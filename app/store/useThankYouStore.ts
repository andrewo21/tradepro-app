"use client";

import { create } from "zustand";

interface ThankYouState {
  customerName: string;
  productName: string;
  orderNumber: string;
  tone: string;
  personalNote: string;
  generatedEmail: string;

  setField: (field: keyof ThankYouState, value: string) => void;
  setGeneratedEmail: (value: string) => void;
}

export const useThankYouStore = create<ThankYouState>((set) => ({
  customerName: "",
  productName: "",
  orderNumber: "",
  tone: "Warm",
  personalNote: "",
  generatedEmail: "",

  setField: (field, value) =>
    set(() => ({
      [field]: value,
    })),

  setGeneratedEmail: (value) =>
    set(() => ({
      generatedEmail: value,
    })),
}));
