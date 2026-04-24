"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
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
  startDate: "", 
  endDate: "", 
  responsibilities: [createBullet()], 
  achievements: [createBullet()] 
});

export const useResumeStore = create<any>()(
  persist((set, get) => ({
    personalInfo: { firstName: "", lastName: "", tradeTitle: "", phone: "", email: "", city: "", state: "" },
    summary: "", 
    summarySuggestion: null, 
    summaryLoading: false, 
    skills: [], 
    experience: [createExperienceItem()], 
    education: [{ school: "", degree: "", year: "", gpa: "" }], 
    selectedTemplate: "sidebar-green",
    premiumUnlocked: false,

    // --- SHARED ACTIONS ---
    setField: (field: string, value: any) => set({ [field]: value }),
    setSelectedTemplate: (val: string) => set({ selectedTemplate: val }),

    updatePersonalInfo: (field: any, value: any) => set((state: any) => ({ 
        personalInfo: { ...state.personalInfo, [field]: value } 
    })),
    
    updateSummary: (text: string) => set({ summary: text, summarySuggestion: null }),
    
    rewriteSummary: async () => {
      const text = get().summary; 
      if (!text.trim() || !API_BASE) return;
      set({ summaryLoading: true });
      try {
        const res = await fetch(`${API_BASE}/api/ai/rewrite`, { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ type: "summary", text }) 
        });
        const data = await res.json();
        set({ summaryLoading: false, summarySuggestion: sanitize(data.suggestion) });
      } catch (e) { set({ summaryLoading: false }); }
    },
    
    acceptSummarySuggestion: () => set((state: any) => ({ summary: state.summarySuggestion || state.summary, summarySuggestion: null })),

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
      if (!s || !s.text.trim() || !API_BASE) return;
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
          sk[index] = { ...sk[index], loading: false, suggestion: sanitize(data.suggestion) }; 
          return { skills: sk }; 
        });
      } catch (e) { set((state: any) => { const sk = [...state.skills]; sk[index].loading = false; return { skills: sk }; }); }
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
      if (!bullet || !bullet.text.trim() || !API_BASE) return;
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
      if (!bullet || !bullet.text.trim() || !API_BASE) return;
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
  }), { name: "resume-storage" })
);
