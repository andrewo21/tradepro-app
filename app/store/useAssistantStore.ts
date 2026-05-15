"use client";

import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SuggestionActionType =
  | "add_responsibility"
  | "update_responsibility"
  | "add_achievement"
  | "update_achievement"
  | "add_skill"
  | "update_summary"
  | "add_certification"
  | "update_personal";

export interface SuggestionAction {
  type:          SuggestionActionType;
  experienceId?: string;
  bulletIndex?:  number;  // 0-based index for update_responsibility / update_achievement
  value:         string;
}

export interface AssistantSuggestion {
  id: string;
  label: string;
  preview: string;       // the full text to insert
  reason: string;        // why this helps
  pointGain: number;
  action: SuggestionAction;
  accepted: boolean;
  dismissed: boolean;
}

export interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggestions?: AssistantSuggestion[];
  timestamp: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AssistantState {
  isOpen: boolean;
  isThinking: boolean;
  messages: AssistantMessage[];
  lastAnalyzedStep: string | null;
  lastAnalyzedHash: string | null;
  hasNewSuggestions: boolean;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setThinking: (val: boolean) => void;
  addMessage: (msg: AssistantMessage) => void;
  addUserMessage: (content: string) => void;
  acceptSuggestion: (msgId: string, suggId: string) => void;
  dismissSuggestion: (msgId: string, suggId: string) => void;
  setLastAnalyzed: (step: string, hash: string) => void;
  clearNewSuggestions: () => void;
  reset: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  isOpen: false,
  isThinking: false,
  messages: [],
  lastAnalyzedStep: null,
  lastAnalyzedHash: null,
  hasNewSuggestions: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setThinking: (val) => set({ isThinking: val }),

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, msg],
      hasNewSuggestions:
        msg.role === "assistant" && (msg.suggestions?.length ?? 0) > 0
          ? true
          : s.hasNewSuggestions,
    })),

  addUserMessage: (content) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content,
          timestamp: Date.now(),
        },
      ],
    })),

  acceptSuggestion: (msgId, suggId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id !== msgId
          ? m
          : {
              ...m,
              suggestions: m.suggestions?.map((sg) =>
                sg.id === suggId ? { ...sg, accepted: true } : sg
              ),
            }
      ),
    })),

  dismissSuggestion: (msgId, suggId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id !== msgId
          ? m
          : {
              ...m,
              suggestions: m.suggestions?.map((sg) =>
                sg.id === suggId ? { ...sg, dismissed: true } : sg
              ),
            }
      ),
    })),

  setLastAnalyzed: (step, hash) =>
    set({ lastAnalyzedStep: step, lastAnalyzedHash: hash }),

  clearNewSuggestions: () => set({ hasNewSuggestions: false }),

  reset: () =>
    set({
      messages: [],
      lastAnalyzedStep: null,
      lastAnalyzedHash: null,
      hasNewSuggestions: false,
      isThinking: false,
    }),
}));
