import ResumePreview from "@/components/ResumePreview";
import type { TemplateKey } from "@/components/templates";

type ResumePayload = {
  template: TemplateKey;
  premiumUnlocked: boolean;
  name: string;
  title: string;
  contact: {
    phone: string;
    email: string;
    location: string;
  };
  summary: string;
  experience: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    achievements: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    year: string;
    gpa: string;
  }>;
  skills: string[];
  certifications: string[];
};

function decodePayload(searchParams: URLSearchParams): ResumePayload | null {
  const raw = searchParams.get("payload");
  if (!raw) return null;

  try {
    const base64 = decodeURIComponent(raw);
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode payload:", e);
    return null;
  }
}

export default function PrintPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((vv) => [k, vv]) : [[k, v ?? ""]]
    )
  );

  const payload = decodePayload(sp);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">Invalid or missing resume data.</p>
      </div>
    );
  }

  const { template, premiumUnlocked, ...cleanData } = payload;

  return (
    <div className="bg-white text-neutral-900 w-[800px] mx-auto my-8">
      <ResumePreview
        template={template}
        data={cleanData}
        mode="pdf"
        premiumUnlocked={premiumUnlocked}
      />
    </div>
  );
}
