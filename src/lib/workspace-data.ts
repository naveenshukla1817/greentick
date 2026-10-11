import { cache } from "react";
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
} from "@/lib/workspace-shared";

export type {
  Task,
  TaskStatus,
  TaskProofFile,
  WorkspaceData,
  WorkspaceMember,
} from "@/lib/workspace-shared";

export type WorkspaceIdentity = Pick<
  WorkspaceData,
  "teamId" | "teamName" | "isDemo" | "currentUserName" | "currentUserId" | "currentUserEmail" | "currentRole"
>;

type TeamMembership = {
  team_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
};

function getDemoWorkspace(): WorkspaceData {
  return {
    tasks: DEMO_TASKS,
    teamId: "demo-team",
    teamName: "Studio North",
    memberCount: 5,
    members: [
      { id: "demo-owner", name: "Naveen Shukla", role: "owner" },
      { id: "demo-priya", name: "Priya Shah", role: "member" },
      { id: "demo-arjun", name: "Arjun Rao", role: "member" },
      { id: "demo-meera", name: "Meera Iyer", role: "member" },
      { id: "demo-rohan", name: "Rohan Das", role: "member" },
    ],
    isDemo: true,
    currentUserName: "Naveen",
    currentUserId: "demo-owner",
    currentUserEmail: "naveen@example.com",
    currentRole: "owner",
  };
}

type WorkspaceBase =
  | {
      isDemo: true;
      supabase: null;
      selectedMembership: null;
      identity: WorkspaceIdentity;
    }
  | {
      isDemo: false;
      supabase: Awaited<ReturnType<typeof createClient>>;
      selectedMembership: TeamMembership | null;
      identity: WorkspaceIdentity;
    };

/**
 * Identity/team metadata is shared by the nested app layout and the active page.
 * React cache deduplicates this request-scoped work without caching one user's
 * private workspace data across requests.
 */
const getWorkspaceBase = cache(async (): Promise<WorkspaceBase> => {
  if (!isSupabaseConfigured()) {
    const demo = getDemoWorkspace();
    return {
      isDemo: true,
      supabase: null,
      selectedMembership: null,
      identity: {
        teamId: demo.teamId,
        teamName: demo.teamName,
        isDemo: true,
        currentUserName: demo.currentUserName,
        currentUserId: demo.currentUserId,
        currentUserEmail: demo.currentUserEmail,
        currentRole: demo.currentRole,
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login?next=/app");

  // These requests do not depend on each other; run them concurrently.
  const [profileResult, membershipResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, avatar_path, timezone")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("team_members")
      .select("team_id, user_id, role, joined_at")
      .eq("user_id", user.id)
      .is("removed_at", null)
      .order("joined_at", { ascending: true }),
  ]);

  if (profileResult.error) {
    throw new Error(`Could not load your profile: ${profileResult.error.message}`);
  }
  if (membershipResult.error) {
    throw new Error(`Could not load team membership: ${membershipResult.error.message}`);
  }

  const memberships = (membershipResult.data || []) as TeamMembership[];
  const teamIds = [...new Set(memberships.map((membership) => membership.team_id))];
  let team: { id: string; name: string; description: string | null; created_by: string | null } | null = null;

  if (teamIds.length) {
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, description, created_by, created_at")
      .in("id", teamIds)
      .is("archived_at", null)
      .order("created_at", { ascending: true });

    if (teamsError) throw new Error(`Could not load your teams: ${teamsError.message}`);
    const selectedTeam = teams?.[0];
    if (selectedTeam) {
      team = {
        id: selectedTeam.id,
        name: selectedTeam.name,
        description: selectedTeam.description,
        created_by: selectedTeam.created_by,
      };
    }
  }

  const selectedMembership = team
    ? memberships.find((membership) => membership.team_id === team?.id) || null
    : null;
  const currentUserName =
    profileResult.data?.display_name ||
    String(user.user_metadata?.display_name || user.email?.split("@")[0] || "Greenstamp user");

  return {
    isDemo: false,
    supabase,
    selectedMembership,
    identity: {
      teamId: team?.id || null,
      teamName: team?.name || "Your workspace",
      isDemo: false,
      currentUserName,
      currentUserId: user.id,
      currentUserEmail: user.email || "",
      currentRole: selectedMembership?.role || "member",
    },
  };
});

export const getWorkspaceIdentity = cache(async (): Promise<WorkspaceIdentity> => {
  const base = await getWorkspaceBase();
  return base.identity;
});

async function getTeamMembers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teamId: string,
): Promise<WorkspaceMember[]> {
  const { data: memberRows, error: membersError } = await supabase
    .from("team_members")
    .select("team_id, user_id, role")
    .eq("team_id", teamId)
    .is("removed_at", null);

  if (membersError) throw new Error(`Could not load team members: ${membersError.message}`);
  const rows = memberRows || [];
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  if (!userIds.length) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);
  if (profilesError) throw new Error(`Could not load teammate profiles: ${profilesError.message}`);

  const profileById = new Map((profiles || []).map((item) => [item.id, item.display_name]));
  return rows.map((row) => ({
    id: row.user_id,
    name: profileById.get(row.user_id) || "Team member",
    role: row.role as "owner" | "member",
  }));
}

export const getWorkspaceTeamData = cache(async (): Promise<WorkspaceData> => {
  const base = await getWorkspaceBase();
  if (base.isDemo) return getDemoWorkspace();

  const members = base.identity.teamId
    ? await getTeamMembers(base.supabase, base.identity.teamId)
    : [];

  return { ...base.identity, tasks: [], members, memberCount: members.length };
});

const loadWorkspaceData = cache(async (includeProofFiles: boolean, proofTaskId: string | null): Promise<WorkspaceData> => {
  const base = await getWorkspaceBase();
  if (base.isDemo) return getDemoWorkspace();

  const { supabase, identity, selectedMembership } = base;
  let members: WorkspaceMember[] = [];
  let tasks: Task[] = [];

  if (identity.teamId && selectedMembership) {
    // Member rows and task rows only depend on the selected team, so fetch together.
    const [memberResult, taskResult] = await Promise.all([
      supabase
        .from("team_members")
        .select("team_id, user_id, role")
        .eq("team_id", identity.teamId)
        .is("removed_at", null),
      supabase
        .from("tasks")
        .select("id, team_id, title, description, assignee_id, status, priority, due_at, updated_at, created_at")
        .eq("team_id", identity.teamId)
        .order("updated_at", { ascending: false }),
    ]);

    if (memberResult.error) throw new Error(`Could not load team members: ${memberResult.error.message}`);
    if (taskResult.error) throw new Error(`Could not load tasks: ${taskResult.error.message}`);

    const memberRows = memberResult.data || [];
    const taskRows = taskResult.data || [];
    const userIds = [...new Set(memberRows.map((row) => row.user_id))];
    const taskIds = taskRows.map((row) => row.id);

    // Profile names and submission metadata are also independent after the first queries.
    const [profilesResult, submissionsResult] = await Promise.all([
      userIds.length
        ? supabase.from("profiles").select("id, display_name").in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      taskIds.length
        ? supabase
            .from("task_submissions")
            .select("id, task_id, note, submitted_at")
            .in("task_id", taskIds)
            .order("submitted_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (profilesResult.error) throw new Error(`Could not load teammate profiles: ${profilesResult.error.message}`);
    if (submissionsResult.error) throw new Error(`Could not load task submissions: ${submissionsResult.error.message}`);

    const profileById = new Map((profilesResult.data || []).map((item) => [item.id, item.display_name]));
    members = memberRows.map((row) => ({
      id: row.user_id,
      name: profileById.get(row.user_id) || "Team member",
      role: row.role as "owner" | "member",
    }));

    const latestSubmissionByTask = new Map<string, { id: string; note: string | null }>();
    for (const submission of submissionsResult.data || []) {
      if (!latestSubmissionByTask.has(submission.task_id)) {
        latestSubmissionByTask.set(submission.task_id, { id: submission.id, note: submission.note });
      }
    }

    const filesBySubmission = new Map<string, TaskProofFile[]>();
    const statusByTaskId = new Map(taskRows.map((row) => [row.id, row.status]));
    const latestSubmissionIds = includeProofFiles
      ? [...new Set(
          [...latestSubmissionByTask.entries()]
            .filter(([taskId]) => {
              if (proofTaskId) return taskId === proofTaskId;
              // The review page only needs proof links for items currently awaiting review.
              return statusByTaskId.get(taskId) === "submitted";
            })
            .map(([, submission]) => submission.id),
        )]
      : [];

    if (latestSubmissionIds.length) {
      const { data: fileRows, error: filesError } = await supabase
        .from("submission_files")
        .select("id, submission_id, storage_path, external_url, file_name, mime_type, size_bytes")
        .in("submission_id", latestSubmissionIds);
      if (filesError) throw new Error(`Could not load submission files: ${filesError.message}`);

      // Signed URLs are independent. Promise.all avoids waiting for each storage call in series.
      const resolvedFiles = await Promise.all((fileRows || []).map(async (file) => {
        let url = file.external_url as string | null;
        if (file.storage_path) {
          const { data: signed, error: signedError } = await supabase.storage
            .from("greenstamp-proofs")
            .createSignedUrl(file.storage_path, 3600);
          if (!signedError) url = signed?.signedUrl || null;
        }
        return url ? {
          submissionId: file.submission_id,
          file: {
            id: file.id,
            name: file.file_name,
            url,
            mimeType: file.mime_type,
            sizeBytes: file.size_bytes,
          } satisfies TaskProofFile,
        } : null;
      }));

      for (const resolved of resolvedFiles) {
        if (!resolved) continue;
        const list = filesBySubmission.get(resolved.submissionId) || [];
        list.push(resolved.file);
        filesBySubmission.set(resolved.submissionId, list);
      }
    }

    const memberNameById = new Map(members.map((member) => [member.id, member.name]));
    tasks = taskRows.map((row) => {
      const latest = latestSubmissionByTask.get(row.id);
      return {
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
        latestSubmissionId: latest?.id || null,
        latestSubmissionNote: latest?.note || null,
        latestSubmissionFiles: latest ? filesBySubmission.get(latest.id) || [] : [],
      };
    });
  }

  return { ...identity, tasks, members, memberCount: members.length };
});

export function getWorkspaceData(options?: { includeProofFiles?: boolean; proofTaskId?: string }): Promise<WorkspaceData> {
  return loadWorkspaceData(options?.includeProofFiles === true, options?.proofTaskId || null);
}
