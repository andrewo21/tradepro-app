// types/ResumeData.ts

export interface ExperienceBullet {
  id: string;
  text: string;
  suggestion: string | null;
  hasAcceptedSuggestion: boolean;
  loading: boolean;
  error: string | null;
  needsRewrite: boolean;
}

export interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: ExperienceBullet[];
  achievements: ExperienceBullet[];
}

export interface EducationItem {
  school: string;
  degree: string;
  year: string;
  gpa: string;
}

export interface ResumeData {
  name: string;
  title: string;

  contact: {
    phone: string;
    email: string;
    location: string;
  };

  summary: string;

  experience: ExperienceEntry[];

  education: EducationItem[];

  skills: string[];

  certifications: string[];
}
