"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type PersonalInfo = { firstName: string; lastName: string; tradeTitle: string; phone: string; email: string; city: string; state: string; };
type SkillItem = { text: string; suggestion: string | null; hasAcceptedSuggestion: boolean; loading: boolean; error: string | null; needsRewrite: boolean; };
type BulletItem = { id: string; text: string; suggestion: string | null; hasAcceptedSuggestion: boolean; loading: boolean; error: string | null; needsRewrite: boolean; };
type ExperienceItem = { id: string; jobTitle: string; company: string; startDate: string; endDate: string; responsibilities: BulletItem[]; achievements: BulletItem[]; };
type EducationItem = { school: string; degree: string; year: string; gpa: string; };

type ResumeState = {
  personalInfo: PersonalInfo;
  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;
  summary: string;
  summarySuggestion: string | null;
  summaryLoading: boolean;
  updateSummary: (text: string) => void;
  rewriteSummary: () => Promise<void>;
  acceptSummarySuggestion: () => void;
  skills: SkillItem[];
  addSkill: (initialText?: string) => void;
  updateSkill: (index: number, text: string) => void;
  removeSkill: (index: number) => void;
  rewriteSkill: (index: number) => Promise<void>;
  acceptSkillSuggestion: (index: number) => void;
  experience: ExperienceItem[];
  addExperience: () => void;
  removeExperience: (jobId: string) => void;
  updateExperience: (jobId: string, field: keyof Omit<ExperienceItem, "id" | "responsibilities" | "achievements">, value: string) => void;
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

const sanitize = (raw: string): string => (raw ?? "").replace(/^["'‘“`]+|["'’ ”`]+$/g, "").trim();
const createBullet = (): BulletItem => ({ id: `${Date.now()}-${Math.random()}`, text: "", suggestion: null, hasAcceptedSuggestion: false, loading: false, error: null, needsRewrite: false });
const createExperienceItem = (): ExperienceItem => ({ id: `${Date.now()}-${Math.random()}`, jobTitle: "", company: "", startDate: "", endDate: "", responsibilities: [createBullet()], achievements: [createBullet()] });
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const useResumeStore = create<ResumeState>()(
  persist((set, get) => ({
    personalInfo: { firstName: "", lastName: "", tradeTitle: "", phone: "", email: "", city: "", state: "" },
    summary: "", summarySuggestion: null, summaryLoading: false, skills: [], experience: [createExperienceItem()], education: [{ school: "", degree: "", year: "", gpa: "" }], selectedTemplate: "sidebar-green",

    updatePersonalInfo: (field, value) => set((state) => ({ personalInfo: { ...state.personalInfo, [field]: value } })),
    updateSummary: (text) => set({ summary: text, summarySuggestion: null }),
    rewriteSummary: async () => {
      const text = get().summary; if (!text.trim() || !API_BASE) return;
      set({ summaryLoading: true });
      try {
        const res = await fetch(`${API_BASE}/api/ai/rewrite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "summary", text }) });
        const data = await res.json();
        set({ summaryLoading: false, summarySuggestion: sanitize(data.suggestion) });
      } catch (e) { set({ summaryLoading: false }); }
    },
    acceptSummarySuggestion: () => set((state) => ({ summary: state.summarySuggestion || state.summary, summarySuggestion: null })),

    addSkill: (initialText = "") => set((state) => ({ skills: [...state.skills, { text: initialText, suggestion: null, hasAcceptedSuggestion: false, loading: false, error: null, needsRewrite: initialText.trim().length > 0 }] })),
    updateSkill: (index, text) => set((state) => { const s = [...state.skills]; if (s[index]) s[index] = { ...s[index], text, suggestion: null, hasAcceptedSuggestion: false }; return { skills: s }; }),
    removeSkill: (index) => set((state) => ({ skills: state.skills.filter((_, i) => i !== index) })),
    rewriteSkill: async (index) => {
      const s = get().skills[index]; if (!s || !s.text.trim() || !API_BASE) return;
      set((state) => { const sk = [...state.skills]; sk[index].loading = true; return { skills: sk }; });
      try {
        const res = await fetch(`${API_BASE}/api/ai/rewrite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "skill", text: s.text }) });
        const data = await res.json();
        set((state) => { const sk = [...state.skills]; sk[index] = { ...sk[index], loading: false, suggestion: sanitize(data.suggestion) }; return { skills: sk }; });
      } catch (e) { set((state) => { const sk = [...state.skills]; sk[index].loading = false; return { skills: sk }; }); }
    },
    acceptSkillSuggestion: (index) => set((state) => { const s = [...state.skills]; if (s[index]?.suggestion) { s[index].text = s[index].suggestion!; s[index].suggestion = null; s[index].hasAcceptedSuggestion = true; } return { skills: s }; }),

    addExperience: () => set((state) => ({ experience: [...state.experience, createExperienceItem()] })),
    removeExperience: (id) => set((state) => ({ experience: state.experience.filter(e => e.id !== id) })),
    updateExperience: (id, f, v) => set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, [f]: v } : e) })),

    addResponsibility: (id) => set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, responsibilities: [...e.responsibilities, createBullet()] } : e) })),
    updateResponsibility: (id, idx, text) => set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, responsibilities: e.responsibilities.map((r, i) => i === idx ? { ...r, text, suggestion: null } : r) } : e) })),
    removeResponsibility: (id, idx) => set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, responsibilities: e.responsibilities.filter((_, i) => i !== idx) } : e) })),
    rewriteResponsibility: async (id, idx) => {
      const bullet = get().experience.find(e => e.id === id)?.responsibilities[idx]; if (!bullet || !bullet.text.trim() || !API_BASE) return;
      set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, responsibilities: e.responsibilities.map((r, i) => i === idx ? { ...r, loading: true } : r) } : e) }));
      const res = await fetch(`${API_BASE}/api/ai/rewrite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "responsibility", text: bullet.text }) });
      const data = await res.json();
      set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, responsibilities: e.responsibilities.map((r, i) => i === idx ? { ...r, loading: false, suggestion: sanitize(data.suggestion) } : r) } : e) }));
    },
    acceptResponsibilitySuggestion: (id, idx) => set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, responsibilities: e.responsibilities.map((r, i) => i === idx ? { ...r, text: r.suggestion!, suggestion: null, hasAcceptedSuggestion: true } : r) } : e) })),

    addAchievement: (id) => set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, achievements: [...e.achievements, createBullet()] } : e) })),
    updateAchievement: (id, idx, text) => set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, achievements: e.achievements.map((a, i) => i === idx ? { ...a, text, suggestion: null } : a) } : e) })),
    removeAchievement: (id, idx) => set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, achievements: e.achievements.filter((_, i) => i !== idx) } : e) })),
    rewriteAchievement: async (id, idx) => {
      const bullet = get().experience.find(e => e.id === id)?.achievements[idx]; if (!bullet || !bullet.text.trim() || !API_BASE) return;
      set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, achievements: e.achievements.map((a, i) => i === idx ? { ...a, loading: true } : a) } : e) }));
      const res = await fetch(`${API_BASE}/api/ai/rewrite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "achievement", text: bullet.text }) });
      const data = await res.json();
      set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, achievements: e.achievements.map((a, i) => i === idx ? { ...a, loading: false, suggestion: sanitize(data.suggestion) } : a) } : e) }));
    },
    acceptAchievementSuggestion: (id, idx) => set((state) => ({ experience: state.experience.map(e => e.id === id ? { ...e, achievements: e.achievements.map((a, i) => i === idx ? { ...a, text: a.suggestion!, suggestion: null, hasAcceptedSuggestion: true } : a) } : e) })),

    addEducation: () => set((state) => ({ education: [...state.education, { school: "", degree: "", year: "", gpa: "" }] })),
    updateEducation: (idx, f, v) => set((state) => { const e = [...state.education]; e[idx] = { ...e[idx], [f]: v }; return { education: e }; }),
    removeEducation: (idx) => set((state) => ({ education: state.education.filter((_, i) => i !== idx) })),
    setSelectedTemplate: (t) => set({ selectedTemplate: t }),
    reset: () => set({ personalInfo: { firstName: "", lastName: "", tradeTitle: "", phone: "", email: "", city: "", state: "" }, summary: "", skills: [], experience: [createExperienceItem()], education: [{ school: "", degree: "", year: "", gpa: "" }], selectedTemplate: "sidebar-green" }),
  }), { name: "resume-storage" })
);
