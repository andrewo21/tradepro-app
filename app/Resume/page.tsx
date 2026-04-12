"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResumeEntryPoint() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/resume/select");
  }, [router]);

  return null;
}
