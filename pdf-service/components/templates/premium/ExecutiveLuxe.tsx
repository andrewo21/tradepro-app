"use client";

import React from "react";
import Watermark from "@/components/Watermark";

interface TemplateProps {
  data: any;
  mode?: "preview" | "pdf";
  premiumUnlocked: boolean;
  showWatermark: boolean;   // ⭐ NEW
}

export default function ExecutiveLuxe({
  data,
  premiumUnlocked,
  showWatermark,            // ⭐ NEW
}: TemplateProps) {
  const {
    name,
    title,
    contact,
    summary,
    skills,
    experience,
    education,
    certifications,
  } = data;

  const fullName = name || "First Last";
  const jobTitle = title || "Professional Title";

  const location = contact?.location || "";
  const email = contact?.email || "";
  const phone = contact?.phone || "";
  const linkedin = contact?.linkedin || "";

  return (
    <div className="relative w-full bg-white text-gray-900 text-[11px] leading-snug flex">
      {/* ⭐ FIXED — Watermark now uses showWatermark */}
      <Watermark show={showWatermark} />

      {/* GOLD SIDEBAR */}
      <aside
        className="w-[30%] min-h-full p-5 text-gray-900"
        style={{ backgroundColor: "#F4E7C6" }}
      >
        <h1 className="text-[20px] font-serif font-semibold leading-tight">
          {fullName}
        </h1>
        <p className="text-[11px] text-gray-800 mt-1 font-serif">
          {jobTitle}
        </p>

        <div className="mt-4 space-y-1 text-[10px] text-gray-800">
          {location && <div>{location}</div>}
          {email && <div>{email}</div>}
          {phone && <div>{phone}</div>}
          {linkedin && <div className="break-all">{linkedin}</div>}
        </div>

        {skills && skills.length > 0 && (
          <div className="mt-6">
            <SidebarHeader title="Skills" />
            <ul className="mt-2 space-y-1">
              {skills.map((skill: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-black" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div className="mt-6">
            <SidebarHeader title="Certifications" />
            <ul className="mt-2 space-y-1">
              {certifications.map((cert: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-black" />
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="w-[70%] p-7 space-y-7">
        {summary && summary.trim() && (
          <section>
            <MainHeader title="Professional Summary" />
            <p className="mt-1 text-[11px]">{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <MainHeader title="Experience" />
            <div className="mt-2 space-y-4">
              {experience.map((job: any, idx: number) => (
                <ExperienceBlock key={idx} job={job} />
              ))}
            </div>
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <MainHeader title="Education" />
            <div className="mt-2 space-y-1.5">
              {education.map((edu: any, idx: number) => (
                <EducationBlock key={idx} edu={edu} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const SidebarHeader = ({ title }: { title: string }) => (
  <h2 className="text-[11px] font-serif font-semibold uppercase tracking-wide text-gray-900 border-b border-gray-700 pb-1">
    {title}
  </h2>
);

const MainHeader = ({ title }: { title: string }) => (
  <h2 className="text-[12px] font-serif font-semibold uppercase tracking-wide text-gray-900 border-b border-gray-400 pb-1">
    {title}
  </h2>
);

const ExperienceBlock = ({ job }: { job: any }) => {
  const location =
    job.city && job.state
      ? `${job.city}, ${job.state}`
      : job.city || job.state || "";

  const dates =
    job.startDate && job.endDate
      ? `${job.startDate} – ${job.endDate}`
      : job.startDate || job.endDate || "";

  const bullets = [
    ...(job.responsibilities || []),
    ...(job.achievements || []),
  ].filter(Boolean);

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <div>
          <div className="font-serif font-semibold text-[11px]">
            {job.jobTitle}
          </div>
          <div className="text-[10px] text-gray-700">
            {job.company}
            {location && ` | ${location}`}
          </div>
        </div>
        {dates && (
          <div className="text-[10px] text-gray-700 whitespace-nowrap">
            {dates}
          </div>
        )}
      </div>

      {bullets.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {bullets.map((line: string, idx: number) => (
            <li key={idx} className="flex items-start gap-1">
              <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-black" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EducationBlock = ({ edu }: { edu: any }) => {
  const location =
    edu.city && edu.state
      ? `${edu.city}, ${edu.state}`
      : edu.city || edu.state || "";

  const lineParts = [edu.degree, edu.school, location, edu.year].filter(Boolean);

  return <div className="text-[11px]">{lineParts.join(" | ")}</div>;
};
