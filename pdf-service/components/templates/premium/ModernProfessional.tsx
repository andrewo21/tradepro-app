"use client";

import React from "react";
import Watermark from "@/components/Watermark";

interface TemplateProps {
  data: any;
  mode?: "preview" | "pdf";
  premiumUnlocked: boolean;
  showWatermark: boolean;   // ⭐ NEW
}

export default function ModernProfessional({
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
    <div className="relative w-full bg-white text-gray-900 text-[11px] leading-snug">
      {/* ⭐ FIXED — Watermark now uses showWatermark */}
      <Watermark show={showWatermark} />

      {/* HEADER */}
      <div className="text-center py-6 border-b border-gray-300">
        <h1 className="text-[22px] font-semibold tracking-wide">{fullName}</h1>
        <p className="text-[12px] text-gray-700 mt-1">{jobTitle}</p>

        <div className="flex justify-center gap-4 text-[10px] text-gray-600 mt-2">
          {location && <span>{location}</span>}
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {linkedin && <span className="break-all">{linkedin}</span>}
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {/* SUMMARY */}
        {summary && summary.trim() && (
          <section>
            <SectionHeader title="Professional Summary" />
            <p className="mt-1 text-[11px]">{summary}</p>
          </section>
        )}

        {/* SKILLS */}
        {skills && skills.length > 0 && (
          <section>
            <SectionHeader title="Core Skills" />
            <div className="grid grid-cols-2 gap-y-1 gap-x-6 mt-1">
              {skills.map((skill: string, idx: number) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-gray-800" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {experience && experience.length > 0 && (
          <section>
            <SectionHeader title="Experience" />
            <div className="mt-2 space-y-4">
              {experience.map((job: any, idx: number) => (
                <ExperienceBlock key={idx} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        {education && education.length > 0 && (
          <section>
            <SectionHeader title="Education" />
            <div className="mt-2 space-y-1.5">
              {education.map((edu: any, idx: number) => (
                <EducationBlock key={idx} edu={edu} />
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {certifications && certifications.length > 0 && (
          <section>
            <SectionHeader title="Certifications" />
            <ul className="mt-1 space-y-0.5">
              {certifications.map((cert: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-gray-800" />
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2">
    <h2 className="text-[11px] font-semibold tracking-wide uppercase text-gray-800">
      {title}
    </h2>
    <div className="flex-1 h-px bg-gray-300" />
  </div>
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
          <div className="font-semibold text-[11px]">{job.jobTitle}</div>
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
              <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-gray-800" />
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
