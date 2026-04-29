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
  dataInicio: "",
  dataFim: "",
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
      habilidades: [],
      experiencia: [createExperience()],
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

      addHabilidade: () =>
        set((state: any) => ({
          habilidades: [...state.habilidades, { text: "", suggestion: null, loading: false }],
        })),

      updateHabilidade: (index: number, text: string) =>
        set((state: any) => {
          const h = [...state.habilidades];
          if (h[index]) h[index] = { ...h[index], text, suggestion: null };
          return { habilidades: h };
        }),

      removeHabilidade: (index: number) =>
        set((state: any) => ({
          habilidades: state.habilidades.filter((_: any, i: number) => i !== index),
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
          experiencia: [createExperience()],
          formacao: [{ instituicao: "", curso: "", anoConclusao: "", tipo: "Técnico" }],
          cursosCertificacoes: [{ nome: "", instituicao: "", ano: "" }],
          showWatermark: true,
          premiumUnlocked: false,
        }),
    }),
    { name: "br-resume-storage" }
  )
);
