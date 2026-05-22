"use client";

import { useState, useEffect } from "react";
import GringoWriter from "@/components/assistant/GringoWriter";

export default function CV1StartPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <GringoWriter
      locale="en"
      previewHref="/resume/preview"
    />
  );
}
