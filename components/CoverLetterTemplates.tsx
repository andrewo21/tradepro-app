"use client";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface CoverLetterData {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  applicantCityStateZip: string;
  date: string;
  hiringManager: string;
  companyName: string;
  companyAddress: string;
  companyCityStateZip: string;
  jobTitle: string;
  letter: string;
}

// ── Template 1: Modern Blue Header (existing style) ──────────────────────────

export function ModernBlueCoverLetter({ data }: { data: CoverLetterData }) {
  return (
    <div className="font-sans text-neutral-900 bg-white rounded-lg overflow-hidden border shadow-sm">
      {/* Blue Header */}
      <div className="bg-[#1F4E79] text-white px-8 py-6">
        <h1 className="text-2xl font-bold">{data.applicantName || "Your Name"}</h1>
        <p className="text-sm mt-1 opacity-90">{data.applicantEmail} {data.applicantPhone ? `| ${data.applicantPhone}` : ""}</p>
        <p className="text-sm opacity-90">{data.applicantAddress}</p>
        <p className="text-sm opacity-90">{data.applicantCityStateZip}</p>
      </div>

      {/* Body */}
      <div className="px-8 py-6 space-y-4 text-sm leading-relaxed">
        <p className="text-neutral-500">{data.date}</p>
        {data.letter ? (
          <div className="whitespace-pre-wrap">{data.letter}</div>
        ) : (
          <p className="text-neutral-400 italic">Your cover letter will appear here after you generate it.</p>
        )}
      </div>
    </div>
  );
}

// ── Template 2: Traditional Clean (no color header, professional black) ──────

export function TraditionalCoverLetter({ data }: { data: CoverLetterData }) {
  return (
    <div className="font-serif text-neutral-900 bg-white rounded-lg border shadow-sm px-8 py-8 space-y-4 text-sm leading-relaxed">
      {/* Applicant block — top left */}
      <div className="space-y-0.5">
        <p className="font-bold text-base">{data.applicantName || "Your Name"}</p>
        {data.applicantAddress && <p>{data.applicantAddress}</p>}
        {data.applicantCityStateZip && <p>{data.applicantCityStateZip}</p>}
        {data.applicantPhone && <p>{data.applicantPhone}</p>}
        {data.applicantEmail && <p>{data.applicantEmail}</p>}
      </div>

      <div className="border-t border-neutral-200 pt-4 space-y-0.5">
        <p>{data.date}</p>
      </div>

      {/* Recipient block */}
      {(data.hiringManager || data.companyName) && (
        <div className="space-y-0.5">
          {data.hiringManager && <p>{data.hiringManager}</p>}
          {data.companyName && <p>{data.companyName}</p>}
          {data.companyAddress && <p>{data.companyAddress}</p>}
          {data.companyCityStateZip && <p>{data.companyCityStateZip}</p>}
        </div>
      )}

      {/* Letter body */}
      <div className="pt-2">
        {data.letter ? (
          <div className="whitespace-pre-wrap">{data.letter}</div>
        ) : (
          <p className="text-neutral-400 italic">Your cover letter will appear here after you generate it.</p>
        )}
      </div>
    </div>
  );
}

export const coverLetterTemplates = {
  "modern-blue": {
    name: "Modern Blue",
    component: ModernBlueCoverLetter,
  },
  "traditional-clean": {
    name: "Traditional Clean",
    component: TraditionalCoverLetter,
  },
} as const;

export type CoverLetterTemplateKey = keyof typeof coverLetterTemplates;
