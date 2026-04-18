const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

function ModernElite({ data, premiumUnlocked, showWatermark }) {
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
      <Watermark show={showWatermark} />

      {/* HEADER */}
      <div
        className="w-full text-white"
        style={{ backgroundColor: "#4B5563" }}
      >
        <div className="max-w-3xl mx-auto px-8 py-5 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-[22px] font-semibold tracking-wide">
              {fullName}
            </h1>
            <p className="text-[12px] text-gray-200 mt-1">{jobTitle}</p>
          </div>

          <div className="text-[10px] text-right space-y-0.5 text-gray-200">
            {location && <div>{location}</div>}
            {email && <div>{email}</div>}
            {phone && <div>{phone}</div>}
            {linkedin && <div className="break-all">{linkedin}</div>}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-3xl mx-auto px-8 py-6">
        <div className="grid grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="col-span-1 space-y-6">
            {summary && summary.trim() && (
              <section>
                <SectionHeader title="Summary" />
                <p className="mt-1 text-[11px] leading-relaxed">{summary}</p>
              </section>
            )}

            {skills && skills.length > 0 && (
              <section>
                <SectionHeader title="Skills" />
                <ul className="mt-1 space-y-1">
                  {skills.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-gray-700" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {certifications && certifications.length > 0 && (
              <section>
                <SectionHeader title="Certifications" />
                <ul className="mt-1 space-y-1">
                  {certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-gray-700" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-2 space-y-6">
            {experience && experience.length > 0 && (
              <section>
                <SectionHeader title="Experience" />
                <div className="mt-2 space-y-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}

//
// SUBCOMPONENTS
//

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-2">
    <h2 className="text-[11px] font-semibold tracking-wide uppercase text-gray-800">
      {title}
    </h2>
    <div className="flex-1 h-px bg-gray-300" />
  </div>
);

const ExperienceBlock = ({ job }) => {
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
          <div className="text-[10px] text-gray-700">{job.company}</div>
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
              <span className="mt-[5px] h-[3px] w-[3px] rounded-full bg-gray-700" />
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

module.exports = ModernElite;
