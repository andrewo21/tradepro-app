"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// -----------------------------
// Types
// -----------------------------
type PersonalInfo = {
  firstName: string;
  lastName: string;
  tradeTitle: string;
  phone: string;
  email: string;
  city: string;
  state: string;
};

type SkillItem = {
  text: string;
  suggestion: string | null;
  hasAcceptedSuggestion: boolean;
  loading: boolean;
  error: string | null;
  needsRewrite: boolean;
};

type BulletItem = {
  id: string;
  text: string;
  suggestion: string | null;
  hasAcceptedSuggestion: boolean;
  loading: boolean;
  error: string | null;
  needsRewrite: boolean;
};

type ExperienceItem = {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: BulletItem[];
  achievements: BulletItem[];
};

type EducationItem = {
  school: string;
  degree: string;
  year: string;
  gpa: string;
};

type ResumeState = {
  personalInfo: PersonalInfo;
  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;

  summary: string;
  updateSummary: (text: string) => void;

  skills: SkillItem[];
  addSkill: (initialText?: string) => void;
  updateSkill: (index: number, text: string) => void;
  removeSkill: (index: number) => void;
  rewriteSkill: (index: number) => Promise<void>;
  acceptSkillSuggestion: (index: number) => void;

  experience: ExperienceItem[];
  addExperience: () => void;
  removeExperience: (jobId: string) => void;
  updateExperience: (
    jobId: string,
    field: keyof Omit<ExperienceItem, "id" | "responsibilities" | "achievements">,
    value: string
  ) => void;

  addResponsibility: (jobId: string) => void;
  updateResponsibility: (jobId: string, index: number, text: string) => void;
  removeResponsibility: (jobId: string, index: number) => void;
  rewriteResponsibility: (jobId: string, index: number) => Promise<void>;
  acceptResponsibilitySuggestion: (jobId: string, index: number) => void;

  addAchievement: (jobId: string) => void;
  updateAchievement: (jobId: string, index: number, text: string) => void;
  removeAchievement: (jobId: string, index: number) => void;
  rewriteAchievement: (jobId: string, index: number) => Promise<void>;
  acceptAchievementSuggestion: (jobId: string, index: number) => void;

  education: EducationItem[];
  addEducation: () => void;
  updateEducation: (index: number, field: keyof EducationItem, value: string) => void;
  removeEducation: (index: number) => void;

  selectedTemplate: string;
  setSelectedTemplate: (templateKey: string) => void;

  reset: () => void;
};

// -----------------------------
// Helpers
// -----------------------------
const createBullet = (): BulletItem => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  text: "",
  suggestion: null,
  hasAcceptedSuggestion: false,
  loading: false,
  error: null,
  needsRewrite: false,
});

const createExperienceItem = (): ExperienceItem => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  responsibilities: [createBullet()],
  achievements: [createBullet()],
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// -----------------------------
// Store
// -----------------------------
export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      personalInfo: { firstName: "", lastName: "", tradeTitle: "", phone: "", email: "", city: "", state: "" },
      summary: "",
      skills: [],
      experience: [createExperienceItem()],
      education: [{ school: "", degree: "", year: "", gpa: "" }],
      selectedTemplate: "sidebar-green",

      updatePersonalInfo: (field, value) =>
        set((state) => ({ personalInfo: { ...state.personalInfo, [field]: value } })),

      updateSummary: (text) => set(() => ({ summary: text })),

      addSkill: (initialText = "") =>
        set((state) => ({
          skills: [...state.skills, { text: initialText, suggestion: null, hasAcceptedSuggestion: false, loading: false, error: null, needsRewrite: initialText.trim().length > 0 }],
        })),

      updateSkill: (index, text) =>
        set((state) => {
          const skills = [...state.skills];
          if (skills[index]) {
            skills[index] = { ...skills[index], text, suggestion: null, hasAcceptedSuggestion: false };
          }
          return { skills };
        }),

      removeSkill: (index) => set((state) => ({ skills: state.skills.filter((_, i) => i !== index) })),

      rewriteSkill: async (index) => {
        const skill = get().skills[index];
        if (!skill || !skill.text.trim() || !API_BASE) return;
        set((state) => {
          const s = [...state.skills];
          s[index].loading = true;
          return { skills: s };
        });
        try {
          const res = await fetch(`${API_BASE}/api/ai/rewrite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "skill", text: skill.text }),
          });
          const data = await res.json();
          set((state) => {
            const s = [...state.skills];
            s[index] = { ...s[index], loading: false, suggestion: data.suggestion };
            return { skills: s };
          });
        } catch (e) {
          set((state) => {
            const s = [...state.skills];
            s[index].loading = false;
            return { skills: s };
          });
        }
      },

      acceptSkillSuggestion: (index) =>
        set((state) => {
          const skills = [...state.skills];
          if (skills[index]?.suggestion) {
            skills[index].text = skills[index].suggestion!;
            skills[index].suggestion = null;
            skills[index].hasAcceptedSuggestion = true;
          }
          return { skills };
        }),

      addExperience: () => set((state) => ({ experience: [...state.experience, createExperienceItem()] })),
      removeExperience: (jobId) => set((state) => ({ experience: state.experience.filter(exp => exp.id !== jobId) })),

      updateExperience: (jobId, field, value) =>
        set((state) => ({
          experience: state.experience.map(exp => exp.id === jobId ? { ...exp, [field]: value } : exp)
        })),

      addResponsibility: (jobId) =>
        set((state) => ({
          experience: state.experience.map(exp => exp.id === jobId ? { ...exp, responsibilities: [...exp.responsibilities, createBullet()] } : exp)
        })),

      updateResponsibility: (jobId, index, text) =>
        set((state) => ({
          experience: state.experience.map(exp => exp.id === jobId ? {
            ...exp,
            responsibilities: exp.responsibilities.map((r, i) => i === index ? { ...r, text, suggestion: null } : r)
          } : exp)
        })),

      removeResponsibility: (jobId, index) =>
        set((state) => ({
          experience: state.experience.map(exp => exp.id === jobId ? {
            ...exp,
            responsibilities: exp.responsibilities.filter((_, i) => i !== index)
          } : exp)
        })),

      rewriteResponsibility: async (jobId, index) => {
        const exp = get().experience.find(e => e.id === jobId);
        const bullet = exp?.responsibilities[index];
        if (!bullet || !bullet.text.trim() || !API_BASE) return;
        set((state) => ({
          experience: state.experience.map(e => e.id === jobId ? {
            ...e, responsibilities: e.responsibilities.map((r, i) => i === index ? { ...r, loading: true } : r)
          } : e)
        }));
        try {
          const res = await fetch(`${API_BASE}/api/ai/rewrite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "responsibility", text: bullet.text }),
          });
          const data = await res.json();
          set((state) => ({
            experience: state.experience.map(e => e.id === jobId ? {
              ...e, responsibilities: e.responsibilities.map((r, i) => i === index ? { ...r, loading: false, suggestion: data.suggestion } : r)
            } : e)
          }));
        } catch (e) {
          set((state) => ({
            experience: state.experience.map(e => e.id === jobId ? {
              ...e, responsibilities: e.responsibilities.map((r, i) => i === index ? { ...r, loading: false } : r)
            } : e)
          }));
        }
      },

      acceptResponsibilitySuggestion: (jobId, index) =>
        set((state) => ({
          experience: state.experience.map(exp => exp.id === jobId ? {
            ...exp,
            responsibilities: exp.responsibilities.map((r, i) => i === index ? { ...r, text: r.suggestion!, suggestion: null, hasAcceptedSuggestion: true } : r)
          } : exp)
        })),

      addAchievement: (jobId) =>
        set((state) => ({
          experience: state.experience.map(exp => exp.id === jobId ? { ...exp, achievements: [...exp.achievements, createBullet()] } : exp)
        })),

      updateAchievement: (jobId, index, text) =>
        set((state) => ({
          experience: state.experience.map(exp => exp.id === jobId ? {
            ...exp,
            achievements: exp.achievements.map((a, i) => i === index ? { ...a, text, suggestion: null } : a)
          } : exp)
        })),

      removeAchievement: (jobId, index) =>
        set((state) => ({
          experience: state.experience.map(exp => exp.id === jobId ? {
            ...exp,
            achievements: exp.achievements.filter((_, i) => i !== index)
          } : exp)
        })),

      rewriteAchievement: async (jobId, index) => {
        const exp = get().experience.find(e => e.id === jobId);
        const bullet = exp?.achievements[index];
        if (!bullet || !bullet.text.trim() || !API_BASE) return;
        set((state) => ({
          experience: state.experience.map(e => e.id === jobId ? {
            ...e, achievements: e.achievements.map((a, i) => i === index ? { ...a, loading: true } : a)
          } : e)
        }));
        try {
          const res = await fetch(`${API_BASE}/api/ai/rewrite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "achievement", text: bullet.text }),
          });
          const data = await res.json();
          set((state) => ({
            experience: state.experience.map(e => e.id === jobId ? {
              ...e, achievements: e.achievements.map((a, i) => i === index ? { ...a, loading: false, suggestion: data.suggestion } : a)
            } : e)
          }));
        } catch (e) {
          set((state) => ({
            experience: state.experience.map(e => e.id === jobId ? {
              ...e, achievements: e.achievements.map((a, i) => i === index ? { ...a, loading: false } : a)
            } : e)
          }));
        }
      },

      acceptAchievementSuggestion: (jobId, index) =>
        set((state) => ({
          experience: state.experience.map(exp => exp.id === jobId ? {
            ...exp,
            achievements: exp.achievements.map((a, i) => i === index ? { ...a, text: a.suggestion!, suggestion: null, hasAcceptedSuggestion: true } : a)
          } : exp)
        })),

      addEducation: () => set((state) => ({ education: [...state.education, { school: "", degree: "", year: "", gpa: "" }] })),
      updateEducation: (index, field, value) =>
        set((state) => {
          const edu = [...state.education];
          edu[index] = { ...edu[index], [field]: value };
          return { education: edu };
        }),
      removeEducation: (index) => set((state) => ({ education: state.education.filter((_, i) => i !== index) })),

      setSelectedTemplate: (templateKey) => set({ selectedTemplate: templateKey }),

      reset: () => set({
        personalInfo: { firstName: "", lastName: "", tradeTitle: "", phone: "", email: "", city: "", state: "" },
        summary: "",
        skills: [],
        experience: [createExperienceItem()],
        education: [{ school: "", degree: "", year: "", gpa: "" }],
        selectedTemplate: "sidebar-green"
      }),
    }),
    { name: "resume-storage" }
  )
);
