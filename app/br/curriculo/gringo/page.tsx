"use client";

import { useState, useEffect } from "react";
import GringoWriter from "@/components/assistant/GringoWriter";

export default function GringoPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <GringoWriter
      locale="pt-BR"
      previewHref="/br/curriculo/preview"
    />
  );
}
