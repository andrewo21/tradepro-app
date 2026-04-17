// Unified Resume Data Transformer
// Converts BOTH the Zustand store shape AND the PDF payload shape
// into the template-friendly shape expected by PDF templates.

export function transformResumeData(input: any) {
  if (!input) {
    return {
      personal: {
        firstName: "",
        lastName: "",
        tradeTitle: "",
        phone: "",
        email: "",
        location: "",
        linkedin: "",
      },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    };
  }

  // -----------------------------
  // 1. PERSONAL INFO NORMALIZATION
  // -----------------------------
  const personalSource =
    input.personalInfo || input.personal || {
      firstName: "",
      lastName: "",
      tradeTitle: "",
      phone: "",
      email: "",
      city: "",
      state: "",
      linkedin: "",
    };

  const personal = {
    firstName: personalSource.firstName || "",
    lastName: personalSource.lastName || "",
    tradeTitle: personalSource.tradeTitle || "",
    phone: personalSource.phone || "",
    email: personalSource.email || "",
    location:
      personalSource.city && personalSource.state
        ? `${personalSource.city}, ${personalSource.state}`
        : personalSource.city || personalSource.state || "",
    linkedin: personalSource.linkedin || "",
  };

  // -----------------------------
  // 2. SUMMARY
  // -----------------------------
  const summary = input.summary || "";

  // -----------------------------
  // 3. SKILLS (string[])
  // -----------------------------
  const skills = (input.skills || []).map((s: any) =>
    typeof s === "string" ? s : s.text || ""
  );

  // -----------------------------
  // 4. EXPERIENCE
  // -----------------------------
  const experience = (input.experience || []).map((job: any) => ({
    jobTitle: job.jobTitle || "",
    company: job.company || "",
    startDate: job.startDate || "",
    endDate: job.endDate || "",
    responsibilities: (job.responsibilities || []).map((r: any) =>
      typeof r === "string" ? r : r.text || ""
    ),
    achievements: (job.achievements || []).map((a: any) =>
      typeof a === "string" ? a : a.text || ""
    ),
  }));

  // -----------------------------
  // 5. EDUCATION
  // -----------------------------
  const education = (input.education || []).map((edu: any) => ({
    school: edu.school || "",
    degree: edu.degree || "",
    year: edu.year || "",
    gpa: edu.gpa || "",
  }));

  // -----------------------------
  // 6. CERTIFICATIONS
  // -----------------------------
  const certifications = (input.certifications || []).map((c: any) =>
    typeof c === "string" ? c : c.text || ""
  );

  // -----------------------------
  // FINAL TEMPLATE-FRIENDLY SHAPE
  // -----------------------------
  return {
    personal,
    summary,
    skills,
    experience,
    education,
    certifications,
  };
}
