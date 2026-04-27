import React from "react";
import PDFTemplateClient from "./PDFTemplateClient";

export default async function PrintPage({ searchParams }: any) {
  const params = await searchParams;
  const payload = params?.payload || "";

  let resumeData = {};
  let templateId = "sidebar-green";

  try {
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);
    resumeData = parsed.resumeData || {};
    templateId = parsed.templateId || "sidebar-green";
  } catch (err) {
    console.error("Failed to decode payload:", err);
  }

  return (
    <PDFTemplateClient
      templateId={templateId}
      resumeData={resumeData}
    />
  );
}
