"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BrCoverLetterState {
  candidatoNome: string;
  candidatoEmail: string;
  candidatoTelefone: string;
  candidatoWhatsapp: string;
  candidatoEndereco: string;
  candidatoCidadeEstado: string;
  data: string;
  nomeContratante: string;
  nomeEmpresa: string;
  enderecoEmpresa: string;
  cidadeEstadoEmpresa: string;
  cargoPretendido: string;
  saudacao: string;
  experiencia: string;
  cartaGerada: string;

  setField: (field: keyof BrCoverLetterState, value: string) => void;
  setCartaGerada: (value: string) => void;
  clearAll: () => void;
}

export const useBrCoverLetterStore = create<BrCoverLetterState>()(
  persist(
    (set) => ({
      candidatoNome: "",
      candidatoEmail: "",
      candidatoTelefone: "",
      candidatoWhatsapp: "",
      candidatoEndereco: "",
      candidatoCidadeEstado: "",
      data: "",
      nomeContratante: "",
      nomeEmpresa: "",
      enderecoEmpresa: "",
      cidadeEstadoEmpresa: "",
      cargoPretendido: "",
      saudacao: "Prezado(a)",
      experiencia: "",
      cartaGerada: "",

      setField: (field, value) => set(() => ({ [field]: value })),
      setCartaGerada: (value) => set({ cartaGerada: value }),

      clearAll: () => set({
        candidatoNome: "", candidatoEmail: "", candidatoTelefone: "",
        candidatoWhatsapp: "", candidatoEndereco: "", candidatoCidadeEstado: "",
        data: "", nomeContratante: "", nomeEmpresa: "", enderecoEmpresa: "",
        cidadeEstadoEmpresa: "", cargoPretendido: "", saudacao: "Prezado(a)",
        experiencia: "", cartaGerada: "",
      }),
    }),
    { name: "br-cover-letter-storage" }
  )
);
