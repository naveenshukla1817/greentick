import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  DEMO_TASKS,
  type Task,
  type TaskStatus,
  type TaskProofFile,
  type WorkspaceData,
  type WorkspaceMember,
  type WorkspaceTeam,
} from "@/lib/workspace-shared";

export type {
  Task,
  TaskStatus,
  TaskProofFile,
  WorkspaceData,
  WorkspaceMember,
  WorkspaceTeam,
} from "@/lib/workspace-shared";

type TeamMembership = {
  team_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
};
type TaskSummary = { status: TaskStatus; assignee_id: string | null };
const TEAM_COOKIE = "greenstamp_team_id";

function getDemoWorkspace(): WorkspaceData {
  const teams: WorkspaceTeam[] = [{ id: "demo-team", name: "Studio North", role: "owner" }];
  return {
    tasks: DEMO_TASKS,
    teamId: "demo-team",
    teamName: "Studio North",
    teams,
    memberCount: 5,
    members: [
      { id: "demo-owner", name: "Naveen Shukla", role: "owner", avatarSrc: "/avatars/default.png" },
      { id: "demo-priya", name: "Priya Shah", role: "member" },
      { id: "demo-arjun", name: "Arjun Rao", role: "member" },
      { id: "demo-meera", name: "Meera Iyer", role: "member" },
      { id: "demo-rohan", name: "Rohan Das", role: "member" },
    ],
    isDemo: true,
    currentUserName: "Naveen Shukla",
    currentUserId: "demo-owner",
    currentUserEmail: "naveen@example.com",
    currentRole: "owner",
  };
}

type WorkspaceCore = {
  isDemo: boolean;
  supabase: Awaited<ReturnType<typeof createClient>> | null;
  tasksSummary: TaskSummary[];
  teamId: string | null;
  teamName: string;
  teams: WorkspaceTeam[];
  currentUserName: string;
  currentUserId: string;
  currentUserEmail: string;
  currentRole: "owner" | "member";
};

// Shared authenticated context and compact status summaries power the shell.
// React cache deduplicates this between the app layout and its page during one request.
const getWorkspaceCore = cache(async function getWorkspaceCoreImpl(): Promise<WorkspaceCore> {
  if (!isSupabaseConfigured()) {
    const demo = getDemoWorkspace();
    return {
      isDemo: true,
      supabase: null,
      tasksSummary: DEMO_TASKS.map((task) => ({ status: task.status, assignee_id: task.assigneeId || null })),
      teamId: demo.teamId,
      teamName: demo.teamName,
      teams: demo.teams,
      currentUserName: demo.currentUserName,
      currentUserId: demo.currentUserId,
      currentUserEmail: demo.currentUserEmail,
      currentRole: demo.currentRole,
    };
  }

  const supabase = await createClient();
  const cookieStore = await cookies();
  const preferredTeamId = cookieStore.get(TEAM_COOKIE)?.value;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?next=/app");

  const [profileResult, membershipResult] = await Promise.all([
    supabase.from("profiles").select("id, display_name").eq("id", user.id).maybeSingle(),
    supabase.from("team_members").select("team_id, user_id, role, joined_at").eq("user_id", user.id).is("removed_at", null).order("joined_at", { ascending: true }),
  ]);
  if (profileResult.error) throw new Error(`Could not load your profile: ${profileResult.error.message}`);
  if (membershipResult.error) throw new Error(`Could not load team membership: ${membershipResult.error.message}`);

  const memberships = (membershipResult.data || []) as TeamMembership[];
  const teamIds = [...new Set(memberships.map((membership) => membership.team_id))];
  let teams: WorkspaceTeam[] = [];
  if (teamIds.length) {
    const { data, error } = await supabase.from("teams").select("id, name, created_at").in("id", teamIds).is("archived_at", null).order("created_at", { ascending: true });
    if (error) throw new Error(`Could not load your teams: ${error.message}`);
    teams = (data || []).map((team) => ({
      id: team.id,
      name: team.name,
      role: memberships.find((membership) => membership.team_id === team.id)?.role || "member",
    }));
  }

  const team = teams.find((item) => item.id === preferredTeamId) || teams[0] || null;
  const membership = team ? memberships.find((item) => item.team_id === team.id) || null : null;
  let tasksSummary: TaskSummary[] = [];
  if (team) {
    const { data, error } = await supabase.from("tasks").select("status, assignee_id").eq("team_id", team.id);
    if (error) throw new Error(`Could not load workspace counts: ${error.message}`);
    tasksSummary = (data || []).map((task) => ({ status: task.status as TaskStatus, assignee_id: task.assignee_id }));
  }

  const currentUserName = profileResult.data?.display_name || String(user.user_metadata?.display_name || user.email?.split("@")[0] || "Greenstamp user");
  return {
    isDemo: false,
    supabase,
    tasksSummary,
    teamId: team?.id || null,
    teamName: team?.name || "Your workspace",
    teams,
    currentUserName,
    currentUserId: user.id,
    currentUserEmail: user.email || "",
    currentRole: membership?.role || "owner",
  };
});

export type WorkspaceShellData = {
  isDemo: boolean;
  teamId: string | null;
  teamName: string;
  teams: WorkspaceTeam[];
  currentUserName: string;
  currentUserId: string;
  currentUserEmail: string;
  currentRole: "owner" | "member";
  openTasksCount: number;
  reviewCount: number;
  submitCount: number;
  attentionCount: number;
};

export const getWorkspaceShellData = cache(async function getWorkspaceShellDataImpl(): Promise<WorkspaceShellData> {
  const core = await getWorkspaceCore();
  const ownTasks = core.tasksSummary.filter((task) => task.assignee_id === core.currentUserId);
  const roleTasks = core.currentRole === "owner" ? core.tasksSummary : ownTasks;
  const openTasksCount = roleTasks.filter((task) => ["assigned", "in_progress", "changes_requested"].includes(task.status)).length;
  const reviewCount = core.currentRole === "owner"
    ? core.tasksSummary.filter((task) => task.status === "submitted").length
    : ownTasks.filter((task) => task.status === "changes_requested").length;
  const submitCount = ownTasks.filter((task) => ["assigned", "in_progress", "changes_requested"].includes(task.status)).length;
  const attentionCount = core.currentRole === "owner"
    ? reviewCount + core.tasksSummary.filter((task) => task.status === "changes_requested").length
    : ownTasks.filter((task) => task.status === "changes_requested").length;
  return {
    isDemo: core.isDemo,
    teamId: core.teamId,
    teamName: core.teamName,
    teams: core.teams,
    currentUserName: core.currentUserName,
    currentUserId: core.currentUserId,
    currentUserEmail: core.currentUserEmail,
    currentRole: core.currentRole,
    openTasksCount,
    reviewCount,
    submitCount,
    attentionCount,
  };
});

/** Detailed task data is loaded only by pages that actually render task lists. */
export const getWorkspaceData = cache(async function getWorkspaceDataImpl(includeTasks = true): Promise<WorkspaceData> {
  const core = await getWorkspaceCore();
  if (core.isDemo) return getDemoWorkspace();
  if (!core.supabase || !core.teamId) {
    return {
      tasks: [], teamId: core.teamId, teamName: core.teamName, teams: core.teams, memberCount: 0, members: [],
      isDemo: false, currentUserName: core.currentUserName, currentUserId: core.currentUserId, currentUserEmail: core.currentUserEmail, currentRole: core.currentRole,
    };
  }

  const supabase = core.supabase;
  const [memberRowsResult, taskRowsResult] = await Promise.all([
    supabase.from("team_members").select("team_id, user_id, role").eq("team_id", core.teamId).is("removed_at", null),
    includeTasks
      ? supabase.from("tasks").select("id, team_id, title, description, assignee_id, status, priority, due_at, updated_at, created_at").eq("team_id", core.teamId).order("updated_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (memberRowsResult.error) throw new Error(`Could not load team members: ${memberRowsResult.error.message}`);
  if (taskRowsResult.error) throw new Error(`Could not load tasks: ${taskRowsResult.error.message}`);

  const memberRows = memberRowsResult.data || [];
  const userIds = [...new Set(memberRows.map((row) => row.user_id))];
  const profilesResult = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
    : { data: [], error: null };
  if (profilesResult.error) throw new Error(`Could not load teammate profiles: ${profilesResult.error.message}`);

  const profileById = new Map((profilesResult.data || []).map((row) => [row.id, row.display_name]));
  const members: WorkspaceMember[] = memberRows.map((row) => ({
    id: row.user_id,
    name: profileById.get(row.user_id) || "Team member",
    role: row.role as "owner" | "member",
    avatarSrc: row.user_id === core.currentUserId ? "/avatars/default.png" : null,
  }));
  const memberNameById = new Map(members.map((member) => [member.id, member.name]));
  const tasks: Task[] = (taskRowsResult.data || []).map((row) => ({
    id: row.id,
    teamId: row.team_id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority as "low" | "medium" | "high",
    assigneeId: row.assignee_id,
    assigneeName: row.assignee_id ? memberNameById.get(row.assignee_id) || "Team member" : "Unassigned",
    dueAt: row.due_at,
    updatedAt: row.updated_at || row.created_at,
    latestSubmissionId: null,
    latestSubmissionNote: null,
    latestSubmissionFiles: [],
  }));

  return {
    tasks,
    teamId: core.teamId,
    teamName: core.teamName,
    teams: core.teams,
    memberCount: members.length,
    members,
    isDemo: false,
    currentUserName: core.currentUserName,
    currentUserId: core.currentUserId,
    currentUserEmail: core.currentUserEmail,
    currentRole: core.currentRole,
  };
});

/** Loads latest submissions and proof links only for the review queue. */
export const getReviewTaskDetails = cache(async function getReviewTaskDetailsImpl(taskIds: string[]): Promise<Record<string, Pick<Task, "latestSubmissionId" | "latestSubmissionNote" | "latestSubmissionFiles">>> {
  const ids = [...new Set(taskIds.filter(Boolean))];
  const core = await getWorkspaceCore();
  if (!ids.length || core.isDemo || !core.supabase) return {};
  const supabase = core.supabase;
  const { data: submissions, error: submissionsError } = await supabase
    .from("task_submissions")
    .select("id, task_id, note, submitted_at")
    .in("task_id", ids)
    .order("submitted_at", { ascending: false });
  if (submissionsError) throw new Error(`Could not load review submissions: ${submissionsError.message}`);

  const latestByTask = new Map<string, { id: string; note: string | null }>();
  for (const submission of submissions || []) {
    if (!latestByTask.has(submission.task_id)) latestByTask.set(submission.task_id, { id: submission.id, note: submission.note });
  }
  const latestSubmissionIds = [...new Set([...latestByTask.values()].map((submission) => submission.id))];
  const { data: rows, error: filesError } = latestSubmissionIds.length
    ? await supabase.from("submission_files").select("id, submission_id, storage_path, external_url, file_name, mime_type, size_bytes").in("submission_id", latestSubmissionIds)
    : { data: [], error: null };
  if (filesError) throw new Error(`Could not load review proof files: ${filesError.message}`);

  const fileEntries = await Promise.all((rows || []).map(async (file) => {
    let url = file.external_url as string | null;
    if (file.storage_path) {
      const { data: signed, error: signedError } = await supabase.storage.from("greenstamp-proofs").createSignedUrl(file.storage_path, 3600);
      if (!signedError) url = signed?.signedUrl || null;
    }
    if (!url) return null;
    return {
      submissionId: file.submission_id,
      proof: { id: file.id, name: file.file_name, url, mimeType: file.mime_type, sizeBytes: file.size_bytes } satisfies TaskProofFile,
    };
  }));
  const filesBySubmission = new Map<string, TaskProofFile[]>();
  for (const entry of fileEntries) {
    if (!entry) continue;
    const list = filesBySubmission.get(entry.submissionId) || [];
    list.push(entry.proof);
    filesBySubmission.set(entry.submissionId, list);
  }

  const result: Record<string, Pick<Task, "latestSubmissionId" | "latestSubmissionNote" | "latestSubmissionFiles">> = {};
  for (const taskId of ids) {
    const submission = latestByTask.get(taskId);
    result[taskId] = {
      latestSubmissionId: submission?.id || null,
      latestSubmissionNote: submission?.note || null,
      latestSubmissionFiles: submission ? filesBySubmission.get(submission.id) || [] : [],
    };
  }
  return result;
});

/** Latest submission and expiring proof URLs are fetched only when a task detail is opened. */
export const getTaskSubmissionDetails = cache(async function getTaskSubmissionDetailsImpl(taskId: string): Promise<{ submissionId: string | null; note: string | null; files: TaskProofFile[] }> {
  const core = await getWorkspaceCore();
  if (!taskId || core.isDemo || !core.supabase || !core.teamId) return { submissionId: null, note: null, files: [] };

  const supabase = core.supabase;
  const { data: submissions, error: submissionError } = await supabase
    .from("task_submissions")
    .select("id, note, submitted_at")
    .eq("task_id", taskId)
    .order("submitted_at", { ascending: false })
    .limit(1);
  if (submissionError) throw new Error(`Could not load task submission: ${submissionError.message}`);
  const latest = submissions?.[0];
  if (!latest) return { submissionId: null, note: null, files: [] };

  const { data: rows, error: filesError } = await supabase
    .from("submission_files")
    .select("id, submission_id, storage_path, external_url, file_name, mime_type, size_bytes")
    .eq("submission_id", latest.id);
  if (filesError) throw new Error(`Could not load proof files: ${filesError.message}`);

  const files: Array<TaskProofFile | null> = await Promise.all(
    (rows || []).map(async (file): Promise<TaskProofFile | null> => {
      let url = file.external_url as string | null;
      if (file.storage_path) {
        const { data: signed, error: signedError } = await supabase.storage
          .from("greenstamp-proofs")
          .createSignedUrl(file.storage_path, 3600);
        if (!signedError) url = signed?.signedUrl || null;
      }
      if (!url) return null;
      return {
        id: file.id,
        name: file.file_name,
        url,
        mimeType: file.mime_type,
        sizeBytes: file.size_bytes,
      };
    }),
  );
  return {
    submissionId: latest.id,
    note: latest.note,
    files: files.filter((file): file is TaskProofFile => file !== null),
  };
});
