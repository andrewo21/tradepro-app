export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ resumes: [] });
  }

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return NextResponse.json({ resumes: [] });

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ resumes: [] });

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ resumes: [] });

  const { data, error } = await admin
    .from("resumes")
    .select("id, title, locale, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ resumes: [] });
  return NextResponse.json({ resumes: data });
}
