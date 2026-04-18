const React = require("react");

// PDF service cannot import from "@/components/..."
// so we use a simple stub to avoid errors
const Watermark = ({ show }) => null;

function ModernBlue({ data, mode, premiumUnlocked, showWatermark }) {
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

  const fullName = name || "";
  const jobTitle = title || "";
  const phone = contact?.phone || "";
  const email = contact?.email || "";
  const location = contact?.location || "";

  return (
    <div
      className={`relative font-sans ${
        mode === "pdf" ? "text-[12px]" : "text-[14px]"
      } text-neutral-900`}
    >
      <Watermark show={showWatermark} />

      {/* HEADER */}
      <div className="bg-blue-700 text-white p-6 rounded-t-lg">
        <h1 className="text-3xl font-bold">{fullName}</h1>
        <p className="text-lg opacity-90">{jobTitle}</p>

        <div className="mt-3 text-sm opacity-90">
          <p>{phone}</p>
          <p>{email}</p>
          <p>{location}</p>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 bg-white border border-neutral-300 rounded-b-lg">
        {/* SUMMARY */}
        {summary && (
          <section className="mb-6">
            <h2 className="text-blue-700 font-semibold text-lg mb-2">Summary</h2>
            <p className="leading-relaxed">{summary}</p>
          </section>
        )}

        {/* SKILLS */}
        {skills?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-blue-700 font-semibold text-lg mb-2">Skills</h2>
            <ul className="list-disc ml-5 space-y-1">
              {skills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </section>
        )}

        {/* EXPERIENCE */}
        {experience?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-blue-700 font-semibold text-lg mb-2">Experience</h2>
            <div className="space-y-4">
              {experience.map((job, idx) => (
                <div key={idx}>
                  <p className="font-semibold">
                    {job.jobTitle} — {job.company}
                  </p>
                  <p className="text-sm text-neutral-600 mb-2">
                    {job.startDate} – {job.endDate}
                  </p>

                  {job.responsibilities?.length > 0 && (
                    <ul className="list-disc ml-5 space-y-1">
                      {job.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}

                  {job.achievements?.length > 0 && (
                    <ul className="list-disc ml-5 space-y-1 mt-2">
                      {job.achievements.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        {education?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-blue-700 font-semibold text-lg mb-2">Education</h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <p className="font-semibold">{edu.school}</p>
                  <p className="text-sm text-neutral-700">{edu.degree}</p>
                  <p className="text-sm text-neutral-600">{edu.year}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {certifications?.length > 0 && (
          <section>
            <h2 className="text-blue-700 font-semibold text-lg mb-2">
              Certifications
            </h2>
            <ul className="list-disc ml-5 space-y-1">
              {certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

module.exports = ModernBlue;
