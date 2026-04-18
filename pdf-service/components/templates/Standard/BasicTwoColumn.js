const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

function BasicTwoColumn({ data, mode, premiumUnlocked, showWatermark }) {
  const {
    name = "",
    title = "",
    contact = {},
    summary = "",
    experience = [],
    skills = [],
    education = [],
    certifications = [],
  } = data ?? {};

  return (
    <div
      className="relative w-[8.5in] min-h-[11in] bg-white text-gray-900 flex font-sans"
      style={{
        padding: mode === "pdf" ? "0" : undefined,
      }}
    >
      <Watermark show={showWatermark} />

      {/* LEFT SIDEBAR */}
      <aside
        className="w-[30%] p-6 border-r border-gray-300"
        style={{
          backgroundColor: "#f3f4f6",
        }}
      >
        <h1 className="text-2xl font-bold leading-tight">{name}</h1>
        <p className="text-sm text-gray-700 mt-1">{title}</p>

        {/* Contact */}
        <div className="mt-6">
          <h2 className="text-xs uppercase tracking-wide font-bold text-gray-700 mb-2">
            Contact
          </h2>
          {contact.phone && <p className="text-sm">{contact.phone}</p>}
          {contact.email && <p className="text-sm">{contact.email}</p>}
          {contact.location && <p className="text-sm">{contact.location}</p>}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs uppercase tracking-wide font-bold text-gray-700 mb-2">
              Skills
            </h2>
            <ul className="text-sm space-y-1">
              {skills.map((skill, i) => (
                <li key={i}>• {skill}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs uppercase tracking-wide font-bold text-gray-700 mb-2">
              Certifications
            </h2>
            <ul className="text-sm space-y-1">
              {certifications.map((cert, i) => (
                <li key={i}>• {cert}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="w-[70%] p-10">
        {/* Summary */}
        {summary && (
          <section className="mb-8">
            <h2 className="text-gray-800 font-bold uppercase tracking-wide text-sm mb-2">
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-gray-800 font-bold uppercase tracking-wide text-sm mb-4">
              Experience
            </h2>

            {experience.map((job, i) => (
              <div key={i} className="mb-6">
                <div className="flex justify-between text-sm font-semibold">
                  <span>
                    {job.jobTitle} — {job.company}
                  </span>
                  <span className="text-gray-600">
                    {job.startDate} – {job.endDate}
                  </span>
                </div>

                {/* Responsibilities */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <ul className="list-disc ml-5 mt-2 text-sm text-gray-700 space-y-1">
                    {job.responsibilities.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}

                {/* Achievements */}
                {job.achievements && job.achievements.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-gray-800 font-semibold text-xs tracking-wide uppercase mb-1">
                      Key Achievements
                    </h3>
                    <ul className="list-disc ml-5 mt-1 text-sm text-gray-700 space-y-1">
                      {job.achievements.map((a, j) => (
                        <li key={j}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <h2 className="text-gray-800 font-bold uppercase tracking-wide text-sm mb-2">
              Education
            </h2>

            {education.map((edu, i) => (
              <p key={i} className="text-sm mb-1">
                {edu.degree}, {edu.school} ({edu.year})
              </p>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

module.exports = BasicTwoColumn;
