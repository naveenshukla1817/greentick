import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { teamId?: unknown };
    const teamId = typeof body.teamId === "string" ? body.teamId : "";
    if (!teamId) return NextResponse.json({ error: "Choose a workspace." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

    const { data: membership, error } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .is("removed_at", null)
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Could not validate workspace access." }, { status: 500 });
    if (!membership) return NextResponse.json({ error: "You are not a member of that workspace." }, { status: 403 });

    const cookieStore = await cookies();
    cookieStore.set("greenstamp_team_id", teamId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not switch workspace." }, { status: 400 });
  }
}
