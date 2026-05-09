export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  // Authenticate via the Authorization header (Bearer token from client)
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { resumeId, title, data, locale } = body;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Server config error" }, { status: 503 });
  }

  if (resumeId) {
    // Update existing resume
    const { error } = await admin
      .from("resumes")
      .update({ title: title || "My Resume", data, updated_at: new Date().toISOString() })
      .eq("id", resumeId)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, resumeId });
  } else {
    // Insert new resume
    const { data: inserted, error } = await admin
      .from("resumes")
      .insert({ user_id: user.id, title: title || "My Resume", data, locale: locale || "en" })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, resumeId: inserted.id });
  }
}
