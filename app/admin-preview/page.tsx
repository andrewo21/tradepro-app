export const dynamic = "force-dynamic";
// Not indexed, not linked, not visible publicly.
// robots.txt is handled by middleware — this page never appears in search.

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminPreviewClient from "./AdminPreviewClient";

export default async function AdminPreviewPage({
  searchParams,
}: {
  searchParams: { pw?: string };
}) {
  const PASSWORD = process.env.PREVIEW_PASSWORD;
  const COOKIE   = "tp_preview_access";

  // Check cookie first
  const cookieStore = cookies();
  const hasCookie   = cookieStore.get(COOKIE)?.value === PASSWORD;

  // Check query param
  const queryMatch = searchParams.pw && PASSWORD && searchParams.pw === PASSWORD;

  if (!PASSWORD) {
    // PREVIEW_PASSWORD not set — redirect to maintenance
    redirect("/maintenance");
  }

  if (!hasCookie && !queryMatch) {
    // No valid access — redirect to maintenance
    redirect("/maintenance");
  }

  // Valid — set cookie if coming from query and render the real site
  return <AdminPreviewClient setFromQuery={!!queryMatch} password={PASSWORD} />;
}
