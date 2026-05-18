"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = "";
const sanitize = (raw: string): string => (raw ?? "").replace(/^["'‘“`]+|["'’ ”`]+$/g, "").trim();

const createBullet = () => ({ 
  id: `${Date.now()}-${Math.random()}`, 
  text: "", 
  suggestion: null, 
  hasAcceptedSuggestion: false, 
  loading: false, 
  error: null, 
  needsRewrite: false 
});

const createExperienceItem = () => ({ 
  id: `${Date.now()}-${Math.random()}`, 
  jobTitle: "", 
  company: "", 
  city: "",
  state: "",
  startDate: "", 
  endDate: "", 
  roleSummary: "",
  responsibilities: [createBullet()], 
  achievements: [createBullet()] 
});

export const useResumeStore = create<any>()(
  persist((set, get) => ({
    personalInfo: { firstName: "", lastName: "", tradeTitle: "", phone: "", email: "", city: "", state: "", linkedin: "" },
    summary: "", 
    summarySuggestion: null, 
    summaryLoading: false, 
    summaryError: null,
    skills: [], 
    experience: [createExperienceItem()], 
    education: [{ school: "", degree: "", gpa: "" }], 
    certifications: [] as { id: string; text: string }[],
    selectedTemplate: "sidebar-green",
    premiumUnlocked: false,
    showWatermark: true,
    jobDescription: "",
    atsPresent: [] as string[],
    atsMissing: [] as string[],
    atsBaseScore: 0,
    atsBulletSuggestions: [] as string[],

    // --- SHARED ACTIONS ---
    setField: (field: string, value: any) => set({ [field]: value }),
    setSelectedTemplate: (val: string) => set({ selectedTemplate: val }),

    // --- CERTIFICATION ACTIONS ---
    addCertification: () => set((state: any) => ({
      certifications: [...state.certifications, { id: `${Date.now()}-${Math.random()}`, text: "" }],
    })),
    updateCertification: (id: string, text: string) => set((state: any) => ({
      certifications: state.certifications.map((c: any) => c.id === id ? { ...c, text } : c),
    })),
    removeCertification: (id: string) => set((state: any) => ({
      certifications: state.certifications.filter((c: any) => c.id !== id),
    })),

    // --- EDUCATION ACTIONS ---
    addEducation: () => set((state: any) => ({
      education: [...state.education, { school: "", degree: "", gpa: "" }],
    })),
    updateEducation: (index: number, field: string, value: string) =>
      set((state: any) => {
        const edu = [...state.education];
        if (edu[index]) edu[index] = { ...edu[index], [field]: value };
        return { education: edu };
      }),
    removeEducation: (index: number) =>
      set((state: any) => ({
        education: state.education.filter((_: any, i: number) => i !== index),
      })),

    updatePersonalInfo: (field: any, value: any) => set((state: any) => ({ 
        personalInfo: { ...state.personalInfo, [field]: value } 
    })),
    
    updateSummary: (text: string) => set({ summary: text, summarySuggestion: null, summaryError: null }),
    
    rewriteSummary: async () => {
      const text = get().summary; 
      if (!text.trim()) return;
      set({ summaryLoading: true, summaryError: null, summarySuggestion: null });
      try {
        const res = await fetch(`${API_BASE}/api/ai/rewrite-summary`, { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ text }) 
        });
        const data = await res.json();
        if (!res.ok) {
          set({ summaryLoading: false, summaryError: data.error || `Server error: ${res.status}` });
          return;
        }
        const result = sanitize(data.suggestion);
        if (result) {
          set({ summaryLoading: false, summarySuggestion: result });
        } else {
          set({ summaryLoading: false, summaryError: "No suggestion returned. Please try again." });
        }
      } catch (e: any) { set({ summaryLoading: false, summaryError: e?.message || "AI rewrite failed. Check your connection and try again." }); }
    },
    
    acceptSummarySuggestion: () => set((state: any) => ({ 
      summary: state.summarySuggestion || state.summary, 
      summarySuggestion: null, 
      summaryError: null 
    })),
    
    discardSummarySuggestion: () => set({ summarySuggestion: null, summaryError: null }),

    // --- SKILLS ACTIONS ---
    addSkill: (initialText = "") => set((state: any) => ({ 
      skills: [...state.skills, { text: initialText, suggestion: null, hasAcceptedSuggestion: false, loading: false }] 
    })),
    updateSkill: (index: number, text: string) => set((state: any) => { 
      const s = [...state.skills]; 
      if (s[index]) s[index] = { ...s[index], text, suggestion: null }; 
      return { skills: s }; 
    }),
    removeSkill: (index: number) => set((state: any) => ({ skills: state.skills.filter((_: any, i: number) => i !== index) })),
    rewriteSkill: async (index: number) => {
      const s = get().skills[index]; 
      if (!s || !s.text.trim()) return;
      set((state: any) => { 
        const sk = [...state.skills]; 
        sk[index].loading = true; 
        return { skills: sk }; 
      });
      try {
        const res = await fetch(`${API_BASE}/api/ai/rewrite`, { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ type: "skill", text: s.text }) 
        });
        const data = await res.json();
        set((state: any) => { 
          const sk = [...state.skills]; 
          sk[index] = { ...sk[index], loading: false, suggestion: res.ok ? sanitize(data.suggestion) : null, error: res.ok ? null : (data.error || "Rewrite failed") }; 
          return { skills: sk }; 
        });
      } catch (e: any) { set((state: any) => { const sk = [...state.skills]; sk[index] = { ...sk[index], loading: false, error: e?.message || "Rewrite failed" }; return { skills: sk }; }); }
    },
    acceptSkillSuggestion: (index: number) => set((state: any) => { 
      const s = [...state.skills]; 
      if (s[index]?.suggestion) { 
        s[index].text = s[index].suggestion!; 
        s[index].suggestion = null; 
        s[index].hasAcceptedSuggestion = true; 
      } 
      return { skills: s }; 
    }),

    // --- WORK EXPERIENCE ACTIONS ---
    addExperience: () => set((state: any) => ({ experience: [...state.experience, createExperienceItem()] })),
    removeExperience: (id: string) => set((state: any) => ({ experience: state.experience.filter((e: any) => e.id !== id) })),
    updateExperience: (id: string, f: string, v: string) => set((state: any) => ({ 
      experience: state.experience.map((e: any) => e.id === id ? { ...e, [f]: v } : e) 
    })),
    updateRoleSummary: (id: string, text: string) => set((state: any) => ({
      experience: state.experience.map((e: any) => e.id === id ? { ...e, roleSummary: text } : e)
    })),

    // --- RESPONSIBILITIES ACTIONS ---
    addResponsibility: (id: string) => set((state: any) => ({ 
      experience: state.experience.map((e: any) => e.id === id ? { ...e, responsibilities: [...e.responsibilities, createBullet()] } : e) 
    })),
    removeResponsibility: (id: string, idx: number) => set((state: any) => ({ 
      experience: state.experience.map((e: any) => e.id === id ? { ...e, responsibilities: e.responsibilities.filter((_: any, i: number) => i !== idx) } : e) 
    })),
    updateResponsibility: (id: string, idx: number, text: string) => set((state: any) => ({ 
      experience: state.experience.map((e: any) => e.id === id ? { 
        ...e, responsibilities: e.responsibilities.map((r: any, i: number) => i === idx ? { ...r, text, suggestion: null } : r) 
      } : e) 
    })),
    rewriteResponsibility: async (id: string, idx: number) => {
      const bullet = get().experience.find((e: any) => e.id === id)?.responsibilities[idx]; 
      if (!bullet || !bullet.text.trim()) return;
      set((state: any) => ({ 
        experience: state.experience.map((e: any) => e.id === id ? { ...e, responsibilities: e.responsibilities.map((r: any, i: number) => i === idx ? { ...r, loading: true } : r) } : e) 
      }));
      try {
        const res = await fetch(`${API_BASE}/api/ai/rewrite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "responsibility", text: bullet.text }) });
        const data = await res.json();
        set((state: any) => ({ 
          experience: state.experience.map((e: any) => e.id === id ? { ...e, responsibilities: e.responsibilities.map((r: any, i: number) => i === idx ? { ...r, loading: false, suggestion: sanitize(data.suggestion) } : r) } : e) 
        }));
      } catch (e) { set((state: any) => ({ experience: state.experience.map((e: any) => e.id === id ? { ...e, responsibilities: e.responsibilities.map((r: any, i: number) => i === idx ? { ...r, loading: false } : r) } : e) })); }
    },
    acceptResponsibilitySuggestion: (id: string, idx: number) => set((state: any) => ({ 
      experience: state.experience.map((e: any) => e.id === id ? { 
        ...e, responsibilities: e.responsibilities.map((r: any, i: number) => i === idx ? { ...r, text: r.suggestion!, suggestion: null, hasAcceptedSuggestion: true } : r) 
      } : e) 
    })),

    // --- ACHIEVEMENTS ACTIONS ---
    addAchievement: (id: string) => set((state: any) => ({ 
      experience: state.experience.map((e: any) => e.id === id ? { ...e, achievements: [...e.achievements, createBullet()] } : e) 
    })),
    removeAchievement: (id: string, idx: number) => set((state: any) => ({ 
      experience: state.experience.map((e: any) => e.id === id ? { ...e, achievements: e.achievements.filter((_: any, i: number) => i !== idx) } : e) 
    })),
    updateAchievement: (id: string, idx: number, text: string) => set((state: any) => ({ 
      experience: state.experience.map((e: any) => e.id === id ? { 
        ...e, achievements: e.achievements.map((a: any, i: number) => i === idx ? { ...a, text, suggestion: null } : a) 
      } : e) 
    })),
    rewriteAchievement: async (id: string, idx: number) => {
      const bullet = get().experience.find((e: any) => e.id === id)?.achievements[idx]; 
      if (!bullet || !bullet.text.trim()) return;
      set((state: any) => ({ 
        experience: state.experience.map((e: any) => e.id === id ? { ...e, achievements: e.achievements.map((a: any, i: number) => i === idx ? { ...a, loading: true } : a) } : e) 
      }));
      try {
        const res = await fetch(`${API_BASE}/api/ai/rewrite`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "achievement", text: bullet.text }) });
        const data = await res.json();
        set((state: any) => ({ 
          experience: state.experience.map((e: any) => e.id === id ? { ...e, achievements: e.achievements.map((a: any, i: number) => i === idx ? { ...a, loading: false, suggestion: sanitize(data.suggestion) } : a) } : e) 
        }));
      } catch (e) { set((state: any) => ({ experience: state.experience.map((e: any) => e.id === id ? { ...e, achievements: e.achievements.map((a: any, i: number) => i === idx ? { ...a, loading: false } : a) } : e) })); }
    },
    acceptAchievementSuggestion: (id: string, idx: number) => set((state: any) => ({ 
      experience: state.experience.map((e: any) => e.id === id ? { 
        ...e, achievements: e.achievements.map((a: any, i: number) => i === idx ? { ...a, text: a.suggestion!, suggestion: null, hasAcceptedSuggestion: true } : a) 
      } : e) 
    })),

    // Discard suggestion without accepting — responsibility
    discardResponsibilitySuggestion: (id: string, idx: number) => set((state: any) => ({
      experience: state.experience.map((e: any) => e.id === id ? {
        ...e, responsibilities: e.responsibilities.map((r: any, i: number) => i === idx ? { ...r, suggestion: null } : r)
      } : e)
    })),

    // Discard suggestion without accepting — achievement
    discardAchievementSuggestion: (id: string, idx: number) => set((state: any) => ({
      experience: state.experience.map((e: any) => e.id === id ? {
        ...e, achievements: e.achievements.map((a: any, i: number) => i === idx ? { ...a, suggestion: null } : a)
      } : e)
    })),

    // Clears all resume data from localStorage — called when downloads are exhausted
    clearAll: () => set({
      personalInfo: { firstName: "", lastName: "", tradeTitle: "", phone: "", email: "", city: "", state: "", linkedin: "" },
      summary: "",
      summarySuggestion: null,
      summaryLoading: false,
      summaryError: null,
      skills: [],
      experience: [createExperienceItem()],
      education: [{ school: "", degree: "", gpa: "" }],
      certifications: [],
      selectedTemplate: "sidebar-green",
      premiumUnlocked: false,
      showWatermark: true,
      jobDescription: "",
      atsPresent: [],
      atsMissing: [],
      atsBaseScore: 0,
      atsBulletSuggestions: [],
    }),
  }), {
    name: "resume-storage",
    version: 5,
    migrate: (persistedState: any, version: number) => {
      let s = { ...persistedState };
      if (version < 2) {
        s = { ...s, showWatermark: true };
      }
      if (version < 3) {
        s = {
          ...s,
          atsPresent: s.atsPresent || [],
          atsMissing: s.atsMissing || [],
          atsBaseScore: s.atsBaseScore || 0,
          atsBulletSuggestions: s.atsBulletSuggestions || [],
          jobDescription: s.jobDescription || "",
        };
      }
      if (version < 4) {
        s = {
          ...s,
          certifications: s.certifications || [],
          personalInfo: {
            ...(s.personalInfo || {}),
            linkedin: s.personalInfo?.linkedin || "",
          },
          education: (s.education || []).map((e: any) => {
            const { year, ...rest } = e;
            return rest;
          }),
          experience: (s.experience || []).map((e: any) => ({
            ...e,
            roleSummary: e.roleSummary || "",
          })),
        };
      }
      if (version < 5) {
        // v5 — defensive cleanup after May 2026 architecture changes.
        // Ensures every experience item has well-formed arrays for
        // responsibilities and achievements so the builder and PDF
        // never crash on malformed old data.
        const createBullet = () => ({
          id: `${Date.now()}-${Math.random()}`,
          text: "", suggestion: null, hasAcceptedSuggestion: false,
          loading: false, error: null, needsRewrite: false,
        });
        s = {
          ...s,
          experience: (s.experience || []).map((exp: any) => ({
            ...exp,
            id: exp.id || `${Date.now()}-${Math.random()}`,
            city:        exp.city        || "",
            state:       exp.state       || "",
            roleSummary: exp.roleSummary || "",
            responsibilities: Array.isArray(exp.responsibilities)
              ? exp.responsibilities.map((r: any) =>
                  typeof r === "string"
                    ? { ...createBullet(), text: r }
                    : { ...createBullet(), ...r }
                )
              : [createBullet()],
            achievements: Array.isArray(exp.achievements)
              ? exp.achievements.map((a: any) =>
                  typeof a === "string"
                    ? { ...createBullet(), text: a }
                    : { ...createBullet(), ...a }
                )
              : [],
          })),
          skills: (s.skills || []).map((sk: any) =>
            typeof sk === "string"
              ? { text: sk, suggestion: null, hasAcceptedSuggestion: false, loading: false }
              : sk
          ),
          certifications: (s.certifications || []).map((c: any) =>
            typeof c === "string"
              ? { id: `${Date.now()}-${Math.random()}`, text: c }
              : c
          ),
          personalInfo: {
            firstName: "", lastName: "", tradeTitle: "",
            phone: "", email: "", city: "", state: "", linkedin: "",
            ...(s.personalInfo || {}),
          },
        };
      }
      return s;
    },
  })
);
