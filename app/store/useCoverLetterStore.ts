"use client";

import { create } from "zustand";

interface CoverLetterState {
  applicantName: string;
  applicantAddress: string;
  applicantCityStateZip: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantLinkedIn: string;
  date: string;

  hiringManager: string;
  companyName: string;
  companyAddress: string;
  companyCityStateZip: string;

  jobTitle: string;
  tone: string;
  salutationStyle: string;

  extractedText: string;     // RAW text from PDF
  experience: string;        // CLEAN summary shown in textarea
  generatedLetter: string;

  setField: (field: keyof CoverLetterState, value: string) => void;
  setExtractedText: (value: string) => void;
  setGeneratedLetter: (value: string) => void;
}

export const useCoverLetterStore = create<CoverLetterState>((set) => ({
  applicantName: "",
  applicantAddress: "",
  applicantCityStateZip: "",
  applicantEmail: "",
  applicantPhone: "",
  applicantLinkedIn: "",
  date: "",

  hiringManager: "",
  companyName: "",
  companyAddress: "",
  companyCityStateZip: "",

  jobTitle: "",
  tone: "Professional",
  salutationStyle: "Dear",

  extractedText: "",
  experience: "",
  generatedLetter: "",

  setField: (field, value) =>
    set(() => ({
      [field]: value,
    })),

  setExtractedText: (value) =>
    set(() => ({
      extractedText: value,
    })),

  setGeneratedLetter: (value) =>
    set(() => ({
      generatedLetter: value,
    })),

  clearAll: () =>
    set({
      applicantName: "",
      applicantAddress: "",
      applicantCityStateZip: "",
      applicantEmail: "",
      applicantPhone: "",
      applicantLinkedIn: "",
      date: "",
      hiringManager: "",
      companyName: "",
      companyAddress: "",
      companyCityStateZip: "",
      jobTitle: "",
      tone: "Professional",
      salutationStyle: "Dear",
      extractedText: "",
      experience: "",
      generatedLetter: "",
    }),
}));
