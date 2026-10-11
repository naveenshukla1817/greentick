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

export async function getWorkspaceData(): Promise<WorkspaceData> {
  if (!isSupabaseConfigured()) {
    return getDemoWorkspace();
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=/app");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_path, timezone")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Could not load your profile: ${profileError.message}`);
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("team_members")
    .select("team_id, user_id, role, joined_at")
    .eq("user_id", user.id)
    .is("removed_at", null)
    .order("joined_at", { ascending: true });

  if (membershipError) {
    throw new Error(
      `Could not load team membership: ${membershipError.message}`,
    );
  }

  const teamIds = [
    ...new Set((memberships || []).map((membership) => membership.team_id)),
  ];

  let team: {
    id: string;
    name: string;
    description: string | null;
    created_by: string | null;
  } | null = null;

  let selectedMembership: TeamMembership | null = null;

  if (teamIds.length) {
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, description, created_by, created_at")
      .in("id", teamIds)
      .is("archived_at", null)
      .order("created_at", { ascending: true });

    if (teamsError) {
      throw new Error(`Could not load your teams: ${teamsError.message}`);
    }

    team = teams?.[0]
      ? {
          id: teams[0].id,
          name: teams[0].name,
          description: teams[0].description,
          created_by: teams[0].created_by,
        }
      : null;

    if (team) {
      selectedMembership =
        ((memberships || []) as TeamMembership[]).find(
          (membership) => membership.team_id === team?.id,
        ) || null;
    }
  }

  let members: WorkspaceMember[] = [];
  let tasks: Task[] = [];

  if (team && selectedMembership) {
    const { data: memberRows, error: membersError } = await supabase
      .from("team_members")
      .select("team_id, user_id, role")
      .eq("team_id", team.id)
      .is("removed_at", null);

    if (membersError) {
      throw new Error(`Could not load team members: ${membersError.message}`);
    }

    const userIds = [
      ...new Set((memberRows || []).map((row) => row.user_id)),
    ];

    const { data: profiles, error: teammateProfilesError } = userIds.length
      ? await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds)
      : { data: [], error: null };

    if (teammateProfilesError) {
      throw new Error(
        `Could not load teammate profiles: ${teammateProfilesError.message}`,
      );
    }

    const profileById = new Map(
      (profiles || []).map((item) => [item.id, item.display_name]),
    );

    members = (memberRows || []).map((row) => ({
      id: row.user_id,
      name: profileById.get(row.user_id) || "Team member",
      role: row.role as "owner" | "member",
    }));

    const { data: taskRows, error: tasksError } = await supabase
      .from("tasks")
      .select(
        "id, team_id, title, description, assignee_id, status, priority, due_at, updated_at, created_at",
      )
      .eq("team_id", team.id)
      .order("updated_at", { ascending: false });

    if (tasksError) {
      throw new Error(`Could not load tasks: ${tasksError.message}`);
    }

    const taskIds = (taskRows || []).map((row) => row.id);

    const latestSubmissionByTask = new Map<
      string,
      { id: string; note: string | null }
    >();

    if (taskIds.length) {
      const { data: submissions, error: submissionsError } = await supabase
        .from("task_submissions")
        .select("id, task_id, note, submitted_at")
        .in("task_id", taskIds)
        .order("submitted_at", { ascending: false });

      if (submissionsError) {
        throw new Error(
          `Could not load task submissions: ${submissionsError.message}`,
        );
      }

      for (const submission of submissions || []) {
        if (!latestSubmissionByTask.has(submission.task_id)) {
          latestSubmissionByTask.set(submission.task_id, {
            id: submission.id,
            note: submission.note,
          });
        }
      }
    }

    const filesBySubmission = new Map<string, TaskProofFile[]>();

    const latestSubmissionIds = [
      ...new Set(
        [...latestSubmissionByTask.values()].map(
          (submission) => submission.id,
        ),
      ),
    ];

    if (latestSubmissionIds.length) {
      const { data: fileRows, error: filesError } = await supabase
        .from("submission_files")
        .select(
          "id, submission_id, storage_path, external_url, file_name, mime_type, size_bytes",
        )
        .in("submission_id", latestSubmissionIds);

      if (filesError) {
        throw new Error(
          `Could not load submission files: ${filesError.message}`,
        );
      }

      for (const file of fileRows || []) {
        let url = file.external_url as string | null;

        if (file.storage_path) {
          const { data: signed, error: signedError } = await supabase.storage
            .from("greenstamp-proofs")
            .createSignedUrl(file.storage_path, 3600);

          if (!signedError) {
            url = signed?.signedUrl || null;
          }
        }

        if (!url) continue;

        const list = filesBySubmission.get(file.submission_id) || [];

        list.push({
          id: file.id,
          name: file.file_name,
          url,
          mimeType: file.mime_type,
          sizeBytes: file.size_bytes,
        });

        filesBySubmission.set(file.submission_id, list);
      }
    }

    const memberNameById = new Map(
      members.map((member) => [member.id, member.name]),
    );

    tasks = (taskRows || []).map((row) => {
      const latest = latestSubmissionByTask.get(row.id);

      return {
        id: row.id,
        teamId: row.team_id,
        title: row.title,
        description: row.description,
        status: row.status as TaskStatus,
        priority: row.priority as "low" | "medium" | "high",
        assigneeId: row.assignee_id,
        assigneeName: row.assignee_id
          ? memberNameById.get(row.assignee_id) || "Team member"
          : "Unassigned",
        dueAt: row.due_at,
        updatedAt: row.updated_at || row.created_at,
        latestSubmissionId: latest?.id || null,
        latestSubmissionNote: latest?.note || null,
        latestSubmissionFiles: latest
          ? filesBySubmission.get(latest.id) || []
          : [],
      };
    });
  }

  const currentUserName =
    profile?.display_name ||
    String(
      user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Greenstamp user",
    );

  return {
    tasks,
    teamId: team?.id || null,
    teamName: team?.name || "Your workspace",
    memberCount: members.length,
    members,
    isDemo: false,
    currentUserName,
    currentUserId: user.id,
    currentUserEmail: user.email || "",
    currentRole: selectedMembership?.role || "member",
  };
}