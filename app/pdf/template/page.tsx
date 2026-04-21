"use client";

import React from "react";
import PDFTemplateClient from "./PDFTemplateClient";

export default function PrintPage({ searchParams }: any) {
  const { payload } = searchParams;

  let resumeData = {};
  let templateId = "basic-two-column";

  try {
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);

    resumeData = parsed.resumeData || {};
    templateId = parsed.templateId || "basic-two-column";
  } catch (err) {
    console.error("Failed to decode payload:", err);
  }

  // Inject resume data for PDFTemplateClient
  (window as any).__INJECT_RESUME_DATA__ = () => ({
    resumeData,
    templateId,
  });

  return (
    <PDFTemplateClient templateId={templateId} />
  );
}
