const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

function ExecutiveClassic({ data, premiumUnlocked, showWatermark }) {
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
  const jobTitle = title || "Sr. Leader, Project Director";

  const location = contact?.location || "";
  const email = contact?.email || "";
  const phone = contact?.phone || "";
  const linkedin = contact?.linkedin || "";

  const hasContactRight = location || email || phone || linkedin;

  return (
    <div className="relative w-full bg-white text-gray-800 text-[11px] leading-snug">
      <Watermark show={showWatermark} />

      <div className="w-full bg-[#003A70] text-white">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="font-semibold text-[20px] tracking-wide">
            {fullName}
          </div>

          {hasContactRight && (
            <div className="text-[10px] text-right space-y-0.5">
              {location && <div>{location}</div>}
              {email && <div>{email}</div>}
              {phone && <div>{phone}</div>}
              {linkedin && <div className="break-all">{linkedin}</div>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-3 pb-4 border-b border-[#F28C28] text-center">
        <div className="text-[12px] font-semibold text-[#0A1F44] tracking-[0.08em] uppercase">
          {jobTitle}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-4 space-y-6">
        {summary && summary.trim() && (
          <section>
            <SectionHeader title="Professional Summary" />
            <p className="text-[11px] mt-1">{summary}</p>
          </section>
        )}

        {skills && skills.length > 0 && (
          <section>
            <SectionHeader title="Core Competencies" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-[#F28C28]" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <SectionHeader title="Professional Experience" />
            <div className="mt-2 space-y-3">
              {experience.map((job, idx) => (
                <ExperienceBlock key={idx} job={job} />
              ))}
            </div>
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <SectionHeader title="Education" />
            <div className="mt-2 space-y-1.5">
              {education.map((edu, idx) => (
                <EducationBlock key={idx} edu={edu} />
              ))}
            </div>
          </section>
        )}

        {certifications && certifications.length > 0 && (
          <section>
            <SectionHeader title="Certifications" />
            <ul className="mt-1 space-y-0.5">
              {certifications.map((cert, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-[#F28C28]" />
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

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-2">
    <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#003A70]">
      {title}
    </h2>
    <div className="flex-1 h-px bg-gray-300" />
  </div>
);

const ExperienceBlock = ({ job }) => {
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
      <div className="flex justify-between items-baseline gap-2">
        <div>
          <div className="font-semibold text-[11px]">
            {job.jobTitle || "Project Manager"}
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
          {bullets.map((line, idx) => (
            <li key={idx} className="flex items-start gap-1">
              <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-[#F28C28]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EducationBlock = ({ edu }) => {
  const location =
    edu.city && edu.state
      ? `${edu.city}, ${edu.state}`
      : edu.city || edu.state || "";

  const lineParts = [edu.degree, edu.school, location, edu.year].filter(Boolean);

  return <div className="text-[11px]">{lineParts.join(" | ")}</div>;
};

module.exports = ExecutiveClassic;
