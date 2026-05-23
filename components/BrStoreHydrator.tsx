"use client";

import { useEffect } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";

/**
 * Triggers Zustand localStorage rehydration AFTER React hydration completes.
 * With skipHydration:true on the store, the server and client both start with
 * identical default values — no mismatch. This component then loads the real
 * persisted data once the client is fully ready.
 */
export default function BrStoreHydrator() {
  useEffect(() => {
    useBrResumeStore.persist.rehydrate();
  }, []);
  return null;
}
