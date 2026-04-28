"use client";

import { useEffect } from "react";
import { getOrCreateUserId } from "@/lib/userId";

/**
 * Invisible component — mounts once in the root layout and ensures
 * every browser has a stable tradepro_uid cookie set before any
 * server component or API route needs it.
 */
export default function UserIdProvider() {
  useEffect(() => {
    getOrCreateUserId();
  }, []);

  return null;
}
