export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { grantEntitlement } from "@/lib/entitlements";
import { ProductId } from "@/lib/pricing";

/**
 * Called when a user loads a saved resume from their account page.
 * Verifies they have a saved resume in Supabase (proof of purchase),
 * then restores their builder entitlement so they can edit without re-paying.
 */
export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify Supabase session
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Confirm they have at least one saved resume (proof they paid)
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ error: "Server error" }, { status: 503 });

    const { count } = await admin
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!count || count === 0) {
      return NextResponse.json({ error: "No saved resumes found" }, { status: 403 });
    }

    // Restore entitlement using the cookie userId passed from the client
    const body = await req.json().catch(() => ({}));
    const userId = body.userId;
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const entitlements = await grantEntitlement(userId, ProductId.RESUME);
    return NextResponse.json({ success: true, entitlements });
  } catch (err: any) {
    console.error("grant-access error:", err?.message);
    return NextResponse.json({ error: "Failed to restore access" }, { status: 500 });
  }
}
