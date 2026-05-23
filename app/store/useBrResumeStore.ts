"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const createBullet = () => ({
  id: `${Date.now()}-${Math.random()}`,
  text: "",
  suggestion: null as string | null,
  loading: false,
});

const createExperience = () => ({
  id: `${Date.now()}-${Math.random()}`,
  cargo: "",
  empresa: "",
  cidade: "",
  estado: "",
  dataInicio: "",
  dataFim: "",
  roleSummary: "",
  responsabilidades: [createBullet()],
});

export const useBrResumeStore = create<any>()(
  persist(
    (set, get) => ({
      // Personal info
      personalInfo: {
        nome: "",
        sobrenome: "",
        tituloProfissional: "",
        telefone: "",
        whatsapp: "",
        email: "",
        linkedin: "",
        cidade: "",
        estado: "",
        cpf: "",
        foto: "", // base64 or URL
      },
      resumoProfissional: "",
      habilidadesTecnicas: [],
      habilidadesComportamentais: [],
      idiomas: [],               // ex: [{text: "Inglês (intermediário)"}]
      habilidades: [],           // kept for backwards compat migration
      // Stable initial entry — no Date.now()/Math.random() so server/client match exactly
      experiencia: [{
        id: "br-exp-init",
        cargo: "", empresa: "", cidade: "", estado: "",
        dataInicio: "", dataFim: "", roleSummary: "",
        responsabilidades: [{ id: "br-resp-init", text: "", suggestion: null, loading: false }],
      }],
      formacao: [{ instituicao: "", curso: "", anoConclusao: "", tipo: "Técnico" }],
      cursosCertificacoes: [{ nome: "", instituicao: "", ano: "" }],
      selectedTemplate: "br-moderno-azul",
      showWatermark: true,
      premiumUnlocked: false,

      setPersonalField: (field: string, value: string) =>
        set((state: any) => ({
          personalInfo: { ...state.personalInfo, [field]: value },
        })),

      setField: (field: string, value: any) => set({ [field]: value }),

      updateResumo: (text: string) => set({ resumoProfissional: text }),

      // Legacy habilidades actions (kept for compat)
      addHabilidade: () =>
        set((state: any) => ({
          habilidades: [...(state.habilidades || []), { text: "", suggestion: null, loading: false }],
        })),
      updateHabilidade: (index: number, text: string) =>
        set((state: any) => {
          const h = [...(state.habilidades || [])];
          if (h[index]) h[index] = { ...h[index], text, suggestion: null };
          return { habilidades: h };
        }),
      removeHabilidade: (index: number) =>
        set((state: any) => ({
          habilidades: (state.habilidades || []).filter((_: any, i: number) => i !== index),
        })),

      // Habilidades Técnicas actions
      addHabilidadeTecnica: () =>
        set((state: any) => ({
          habilidadesTecnicas: [...(state.habilidadesTecnicas || []), { text: "", suggestion: null, loading: false }],
        })),
      updateHabilidadeTecnica: (index: number, text: string) =>
        set((state: any) => {
          const h = [...(state.habilidadesTecnicas || [])];
          if (h[index]) h[index] = { ...h[index], text, suggestion: null };
          return { habilidadesTecnicas: h };
        }),
      removeHabilidadeTecnica: (index: number) =>
        set((state: any) => ({
          habilidadesTecnicas: (state.habilidadesTecnicas || []).filter((_: any, i: number) => i !== index),
        })),

      // Habilidades Comportamentais actions
      addHabilidadeComportamental: () =>
        set((state: any) => ({
          habilidadesComportamentais: [...(state.habilidadesComportamentais || []), { text: "", suggestion: null, loading: false }],
        })),
      updateHabilidadeComportamental: (index: number, text: string) =>
        set((state: any) => {
          const h = [...(state.habilidadesComportamentais || [])];
          if (h[index]) h[index] = { ...h[index], text, suggestion: null };
          return { habilidadesComportamentais: h };
        }),
      removeHabilidadeComportamental: (index: number) =>
        set((state: any) => ({
          habilidadesComportamentais: (state.habilidadesComportamentais || []).filter((_: any, i: number) => i !== index),
        })),

      addExperiencia: () =>
        set((state: any) => ({
          experiencia: [...state.experiencia, createExperience()],
        })),

      removeExperiencia: (id: string) =>
        set((state: any) => ({
          experiencia: state.experiencia.filter((e: any) => e.id !== id),
        })),

      updateExperienciaField: (id: string, field: string, value: string) =>
        set((state: any) => ({
          experiencia: state.experiencia.map((e: any) =>
            e.id === id ? { ...e, [field]: value } : e
          ),
        })),

      addResponsabilidade: (id: string) =>
        set((state: any) => ({
          experiencia: state.experiencia.map((e: any) =>
            e.id === id
              ? { ...e, responsabilidades: [...e.responsabilidades, createBullet()] }
              : e
          ),
        })),

      updateResponsabilidade: (id: string, idx: number, text: string) =>
        set((state: any) => ({
          experiencia: state.experiencia.map((e: any) =>
            e.id === id
              ? {
                  ...e,
                  responsabilidades: e.responsabilidades.map((r: any, i: number) =>
                    i === idx ? { ...r, text, suggestion: null } : r
                  ),
                }
              : e
          ),
        })),

      clearAll: () =>
        set({
          personalInfo: {
            nome: "", sobrenome: "", tituloProfissional: "", telefone: "", whatsapp: "",
            email: "", linkedin: "", cidade: "", estado: "", cpf: "", foto: "",
          },
          resumoProfissional: "",
          habilidades: [],
          habilidadesTecnicas: [],
          habilidadesComportamentais: [],
          idiomas: [],
          experiencia: [createExperience()],
          formacao: [{ instituicao: "", curso: "", anoConclusao: "", tipo: "Técnico" }],
          cursosCertificacoes: [{ nome: "", instituicao: "", ano: "" }],
          showWatermark: true,
          premiumUnlocked: false,
        }),
    }),
    {
      name: "br-resume-storage",
      version: 3,
      skipHydration: true,
      // Exclude foto from localStorage — base64 images are 50-500KB and fill the quota
      partialize: (state: any) => ({
        ...state,
        personalInfo: { ...state.personalInfo, foto: "" },
      }),
      migrate: (persisted: any, version: number) => {
        let s = { ...persisted };
        if (version < 2) {
          s = {
            ...s,
            habilidadesTecnicas: s.habilidades || [],
            habilidadesComportamentais: [],
          };
        }
        if (version < 3) {
          // v3 — defensive cleanup after May 2026 changes.
          const createBullet = () => ({
            id: `${Date.now()}-${Math.random()}`,
            text: "", suggestion: null, loading: false,
          });
          s = {
            ...s,
            experiencia: (s.experiencia || []).map((exp: any) => ({
              ...exp,
              id: exp.id || `${Date.now()}-${Math.random()}`,
              cidade: exp.cidade || "",
              estado: exp.estado || "",
              roleSummary: exp.roleSummary || "",
              responsabilidades: Array.isArray(exp.responsabilidades)
                ? exp.responsabilidades.map((r: any) =>
                    typeof r === "string" ? { ...createBullet(), text: r } : { ...createBullet(), ...r }
                  )
                : [createBullet()],
            })),
            habilidadesTecnicas: (s.habilidadesTecnicas || []).map((h: any) =>
              typeof h === "string" ? { text: h, suggestion: null, loading: false } : h
            ),
            habilidadesComportamentais: (s.habilidadesComportamentais || []).map((h: any) =>
              typeof h === "string" ? { text: h, suggestion: null, loading: false } : h
            ),
            personalInfo: {
              nome: "", sobrenome: "", tituloProfissional: "",
              telefone: "", whatsapp: "", email: "",
              linkedin: "", cidade: "", estado: "", cpf: "", foto: "",
              ...(s.personalInfo || {}),
            },
          };
        }
        return s;
      },
    }
  )
);
