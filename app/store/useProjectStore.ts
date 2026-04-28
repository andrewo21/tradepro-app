"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProjectType =
  | "Ground-Up Construction"
  | "Renovation"
  | "Tenant Improvement"
  | "Preconstruction"
  | "Design-Build"
  | "Fit-Out"
  | "Site Work"
  | "Other";

export interface Project {
  id: string;
  projectName: string;
  location: string;
  clientOwner: string;
  yourRole: string;
  projectType: ProjectType | string;
  startDate: string;
  endDate: string;
  contractValue: string;       // e.g. "$30MM" or "30,000,000"
  squareFootage: string;       // e.g. "500,000 SF"
  scope: string;               // paragraph description
  highlights: string[];        // 2-3 key achievement bullets
}

export interface PortfolioInfo {
  name: string;
  title: string;
  phone: string;
  email: string;
  location: string;
  yearsExperience: string;
  bio: string;                  // 2-3 sentence professional summary
}

interface ProjectState {
  portfolio: PortfolioInfo;
  projects: Project[];

  setPortfolioField: (field: keyof PortfolioInfo, value: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Project) => void;
  removeProject: (id: string) => void;
  reorderProjects: (projects: Project[]) => void;
  clearAll: () => void;
}

const emptyPortfolio: PortfolioInfo = {
  name: "",
  title: "",
  phone: "",
  email: "",
  location: "",
  yearsExperience: "",
  bio: "",
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      portfolio: emptyPortfolio,
      projects: [],

      setPortfolioField: (field, value) =>
        set((state) => ({
          portfolio: { ...state.portfolio, [field]: value },
        })),

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (id, project) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? project : p)),
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      reorderProjects: (projects) => set({ projects }),

      clearAll: () => set({ portfolio: emptyPortfolio, projects: [] }),
    }),
    { name: "project-storage" }
  )
);

// ── Helpers ──────────────────────────────────────────────────────────────────

export function createProject(overrides: Partial<Project> = {}): Project {
  return {
    id: `${Date.now()}-${Math.random()}`,
    projectName: "",
    location: "",
    clientOwner: "",
    yourRole: "",
    projectType: "Ground-Up Construction",
    startDate: "",
    endDate: "",
    contractValue: "",
    squareFootage: "",
    scope: "",
    highlights: ["", "", ""],
    ...overrides,
  };
}

/** Parse contract value string to a number for totalling */
export function parseValue(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/[$,\s]/g, "").toUpperCase();
  if (clean.endsWith("MM")) return parseFloat(clean) * 1_000_000;
  if (clean.endsWith("M")) return parseFloat(clean) * 1_000_000;
  if (clean.endsWith("K")) return parseFloat(clean) * 1_000;
  return parseFloat(clean) || 0;
}

export function formatValue(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}
