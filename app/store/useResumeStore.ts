"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { overrides } from "@/config/overrides";


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

  premiumUnlocked: boolean;
  unlockPremium: () => void;

  // Dev / access + watermark behavior
  hasAccess: boolean;
  showWatermark: boolean;

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

// Central sanitization for all AI suggestions
const sanitizeSuggestion = (raw: string): string => {
  let clean = raw ?? "";

  // Remove obvious meta headers / boilerplate
  clean = clean.replace(/As an AI[^.]*\.\s*/gi, "");
  clean = clean.replace(/Here is (a|the) suggestion[^:]*:\s*/gi, "");
  clean = clean.replace(/Here'?s (a|the) suggestion[^:]*:\s*/gi, "");
  clean = clean.replace(/Suggested (rewrite|improvement)[^:]*:\s*/gi, "");
  clean = clean.replace(/Rewritten text[^:]*:\s*/gi, "");
  clean = clean.replace(/Improved version[^:]*:\s*/gi, "");
  clean = clean.replace(/Detected language[^.\n]*[.\n]*/gi, "");

  // Strip markdown bullets and numbering
  clean = clean.replace(/^\s*[-*]\s+/gm, "");
  clean = clean.replace(/^\s*\d+\.\s+/gm, "");

  // Remove triple quotes / asterisks and stray emphasis
  clean = clean.replace(/"""|‘‘‘|’’’|“””/g, "");
  clean = clean.replace(/\*\*\*/g, "");
  clean = clean.replace(/\*\*/g, "");
  clean = clean.replace(/__+/g, "");

  // Strip leading/trailing quotes and backticks
  clean = clean.replace(/^["'`]+/g, "");
  clean = clean.replace(/["'`]+$/g, "");

  // Collapse whitespace
  clean = clean.replace(/\s+\n/g, "\n");
  clean = clean.replace(/\n\s+/g, "\n");
  clean = clean.replace(/\s{2,}/g, " ");

  clean = clean.trim();

  return clean;
};

// -----------------------------
// Base initial state
// -----------------------------
const baseInitialState = {
  personalInfo: {
    firstName: "",
    lastName: "",
    tradeTitle: "",
    phone: "",
    email: "",
    city: "",
    state: "",
  },
  summary: "",
  skills: [] as SkillItem[],
  experience: [createExperienceItem()] as ExperienceItem[],
  education: [{ school: "", degree: "", year: "", gpa: "" }] as EducationItem[],
  selectedTemplate: "sidebar-green",
  premiumUnlocked: false, // real default: watermark ON until user pays
  hasAccess: false,
  showWatermark: true,
};

// -----------------------------
// Apply env-based dev overrides to initial state
// -----------------------------
// Apply override-based dev behavior
const initialState: typeof baseInitialState = (() => {
  let premiumUnlocked = baseInitialState.premiumUnlocked;
  let hasAccess = baseInitialState.hasAccess;
  let showWatermark = baseInitialState.showWatermark;

  if (overrides.devMode) {
    hasAccess = overrides.access;
    premiumUnlocked = overrides.premium;
    showWatermark = overrides.watermark ? true : !overrides.premium;
  } else {
    showWatermark = !premiumUnlocked;
  }

  return {
    ...baseInitialState,
    premiumUnlocked,
    hasAccess,
    showWatermark,
  };
})();


// -----------------------------
// Store (with persistence)
// -----------------------------
export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // PERSONAL INFO
      updatePersonalInfo: (field, value) =>
        set((state) => ({
          personalInfo: {
            ...state.personalInfo,
            [field]: value,
          },
        })),

      // SUMMARY
      updateSummary: (text) => set(() => ({ summary: text })),

      // SKILLS
      skills: [],
      addSkill: (initialText = "") =>
        set((state) => ({
          skills: [
            ...state.skills,
            {
              text: initialText,
              suggestion: null,
              hasAcceptedSuggestion: false,
              loading: false,
              error: null,
              needsRewrite: initialText.trim().length > 0,
            },
          ],
        })),

      updateSkill: (index, text) =>
        set((state) => {
          const skills = [...state.skills];
          if (!skills[index]) return state;

          skills[index] = {
            ...skills[index],
            text,
            needsRewrite: text.trim().length > 0,
            suggestion: null,
            hasAcceptedSuggestion: false,
            error: null,
          };

          return { ...state, skills };
        }),

      removeSkill: (index) =>
        set((state) => {
          const skills = [...state.skills];
          skills.splice(index, 1);
          return { ...state, skills };
        }),

      rewriteSkill: async (index) => {
        const skill = get().skills[index];
        if (!skill || !skill.text.trim() || skill.loading) return;

        set((state) => {
          const updated = [...state.skills];
          updated[index] = { ...updated[index], loading: true, error: null };
          return { skills: updated };
        });

        try {
          const res = await fetch("/api/rewrite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "skill", text: skill.text }),
          });

          if (!res.ok) throw new Error("Failed to rewrite skill");

          const data = await res.json();
          const rawSuggestion = data.suggestion ?? data.text ?? "";

          set((state) => {
            const updated = [...state.skills];
            updated[index] = {
              ...updated[index],
              suggestion: sanitizeSuggestion(rawSuggestion),
              loading: false,
              needsRewrite: false,
            };
            return { skills: updated };
          });
        } catch {
          set((state) => {
            const updated = [...state.skills];
            updated[index] = {
              ...updated[index],
              loading: false,
              error: "Error rewriting skill",
              needsRewrite: false,
            };
            return { skills: updated };
          });
        }
      },

      acceptSkillSuggestion: (index) =>
        set((state) => {
          const skills = [...state.skills];
          const skill = skills[index];
          if (!skill?.suggestion) return state;

          const clean = sanitizeSuggestion(skill.suggestion);

          skills[index] = {
            ...skill,
            text: clean,
            hasAcceptedSuggestion: true,
            needsRewrite: false,
          };

          return { skills };
        }),

      // EXPERIENCE
      experience: [createExperienceItem()],
      addExperience: () =>
        set((state) => ({
          experience: [...state.experience, createExperienceItem()],
        })),

      removeExperience: (jobId) =>
        set((state) => ({
          experience: state.experience.filter((job) => job.id !== jobId),
        })),

      updateExperience: (jobId, field, value) =>
        set((state) => ({
          experience: state.experience.map((job) =>
            job.id === jobId ? { ...job, [field]: value } : job
          ),
        })),

      // RESPONSIBILITIES
      addResponsibility: (jobId) =>
        set((state) => ({
          experience: state.experience.map((job) =>
            job.id === jobId
              ? { ...job, responsibilities: [...job.responsibilities, createBullet()] }
              : job
          ),
        })),

      updateResponsibility: (jobId, index, text) =>
        set((state) => ({
          experience: state.experience.map((job) => {
            if (job.id !== jobId) return job;

            const responsibilities = [...job.responsibilities];
            responsibilities[index] = {
              ...responsibilities[index],
              text,
              needsRewrite: text.trim().length > 0,
              suggestion: null,
              hasAcceptedSuggestion: false,
              error: null,
            };

            return { ...job, responsibilities };
          }),
        })),

      removeResponsibility: (jobId, index) =>
        set((state) => ({
          experience: state.experience.map((job) => {
            if (job.id !== jobId) return job;
            const responsibilities = [...job.responsibilities];
            responsibilities.splice(index, 1);
            return { ...job, responsibilities };
          }),
        })),

      rewriteResponsibility: async (jobId, index) => {
        const job = get().experience.find((j) => j.id === jobId);
        const bullet = job?.responsibilities[index];
        if (!bullet || !bullet.text.trim() || bullet.loading) return;

        set((state) => ({
          experience: state.experience.map((j) => {
            if (j.id !== jobId) return j;
            const responsibilities = [...j.responsibilities];
            responsibilities[index] = { ...responsibilities[index], loading: true };
            return { ...j, responsibilities };
          }),
        }));

        try {
          const res = await fetch("/api/rewrite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "responsibility", text: bullet.text }),
          });

          if (!res.ok) throw new Error("Failed to rewrite responsibility");

          const data = await res.json();
          const rawSuggestion = data.suggestion ?? data.text ?? "";

          set((state) => ({
            experience: state.experience.map((j) => {
              if (j.id !== jobId) return j;
              const responsibilities = [...j.responsibilities];
              responsibilities[index] = {
                ...responsibilities[index],
                suggestion: sanitizeSuggestion(rawSuggestion),
                loading: false,
                needsRewrite: false,
              };
              return { ...j, responsibilities };
            }),
          }));
        } catch {
          set((state) => ({
            experience: state.experience.map((j) => {
              if (j.id !== jobId) return j;
              const responsibilities = [...j.responsibilities];
              responsibilities[index] = {
                ...responsibilities[index],
                loading: false,
                error: "Error rewriting responsibility",
                needsRewrite: false,
              };
              return { ...j, responsibilities };
            }),
          }));
        }
      },

      acceptResponsibilitySuggestion: (jobId, index) =>
        set((state) => ({
          experience: state.experience.map((j) => {
            if (j.id !== jobId) return j;

            const responsibilities = [...j.responsibilities];
            const bullet = responsibilities[index];
            if (!bullet?.suggestion) return j;

            const clean = sanitizeSuggestion(bullet.suggestion);

            responsibilities[index] = {
              ...bullet,
              text: clean,
              hasAcceptedSuggestion: true,
              needsRewrite: false,
            };

            return { ...j, responsibilities };
          }),
        })),

      // ACHIEVEMENTS
      addAchievement: (jobId) =>
        set((state) => ({
          experience: state.experience.map((job) =>
            job.id === jobId
              ? { ...job, achievements: [...job.achievements, createBullet()] }
              : job
          ),
        })),

      updateAchievement: (jobId, index, text) =>
        set((state) => ({
          experience: state.experience.map((job) => {
            if (job.id !== jobId) return job;

            const achievements = [...job.achievements];
            achievements[index] = {
              ...achievements[index],
              text,
              needsRewrite: text.trim().length > 0,
              suggestion: null,
              hasAcceptedSuggestion: false,
              error: null,
            };

            return { ...job, achievements };
          }),
        })),

      removeAchievement: (jobId, index) =>
        set((state) => ({
          experience: state.experience.map((job) => {
            if (job.id !== jobId) return job;
            const achievements = [...job.achievements];
            achievements.splice(index, 1);
            return { ...job, achievements };
          }),
        })),

      rewriteAchievement: async (jobId, index) => {
        const job = get().experience.find((j) => j.id === jobId);
        const bullet = job?.achievements[index];
        if (!bullet || !bullet.text.trim() || bullet.loading) return;

        set((state) => ({
          experience: state.experience.map((j) => {
            if (j.id !== jobId) return j;
            const achievements = [...j.achievements];
            achievements[index] = { ...achievements[index], loading: true };
            return { ...j, achievements };
          }),
        }));

        try {
          const res = await fetch("/api/rewrite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "achievement", text: bullet.text }),
          });

          if (!res.ok) throw new Error("Failed to rewrite achievement");

          const data = await res.json();
          const rawSuggestion = data.suggestion ?? data.text ?? "";

          set((state) => ({
            experience: state.experience.map((j) => {
              if (j.id !== jobId) return j;
              const achievements = [...j.achievements];
              achievements[index] = {
                ...achievements[index],
                suggestion: sanitizeSuggestion(rawSuggestion),
                loading: false,
                needsRewrite: false,
              };
              return { ...j, achievements };
            }),
          }));
        } catch {
          set((state) => ({
            experience: state.experience.map((j) => {
              if (j.id !== jobId) return j;
              const achievements = [...j.achievements];
              achievements[index] = {
                ...achievements[index],
                loading: false,
                error: "Error rewriting achievement",
                needsRewrite: false,
              };
              return { ...j, achievements };
            }),
          }));
        }
      },

      acceptAchievementSuggestion: (jobId, index) =>
        set((state) => ({
          experience: state.experience.map((j) => {
            if (j.id !== jobId) return j;

            const achievements = [...j.achievements];
            const bullet = achievements[index];
            if (!bullet?.suggestion) return j;

            const clean = sanitizeSuggestion(bullet.suggestion);

            achievements[index] = {
              ...bullet,
              text: clean,
              hasAcceptedSuggestion: true,
              needsRewrite: false,
            };

            return { ...j, achievements };
          }),
        })),

      // EDUCATION
      addEducation: () =>
        set((state) => ({
          education: [...state.education, { school: "", degree: "", year: "", gpa: "" }],
        })),

      updateEducation: (index, field, value) =>
        set((state) => {
          const updated = [...state.education];
          updated[index] = { ...updated[index], [field]: value };
          return { education: updated };
        }),

      removeEducation: (index) =>
        set((state) => {
          const updated = [...state.education];
          updated.splice(index, 1);
          return { education: updated };
        }),

      // TEMPLATE SELECTION
      setSelectedTemplate: (templateKey: string) =>
        set(() => ({ selectedTemplate: templateKey })),

      // PREMIUM
      unlockPremium: () =>
  set((state) => {
    if (overrides.devMode) {
      return {
        premiumUnlocked: overrides.premium,
        showWatermark: overrides.watermark ? true : !overrides.premium,
      };
    }

    return {
      premiumUnlocked: true,
      showWatermark: false,
    };
  }),


      // RESET
      reset: () =>
        set(() => {
          // Re-apply initial env-based overrides on reset
          return { ...initialState };
        }),
    }),

    {
      name: "tradepro-resume-store",
      partialize: (state) => ({
        personalInfo: state.personalInfo,
        summary: state.summary,
        skills: state.skills,
        experience: state.experience,
        education: state.education,
        selectedTemplate: state.selectedTemplate,
        premiumUnlocked: state.premiumUnlocked,
        hasAccess: state.hasAccess,
        showWatermark: state.showWatermark,
      }),
    }
  )
);
