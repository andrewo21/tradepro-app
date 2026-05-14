"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { useResumeStore } from "@/app/store/useResumeStore";
import {
  useAssistantStore,
  type AssistantSuggestion,
} from "@/app/store/useAssistantStore";
import { pathToStep, resumeHash, buildStepPayload } from "@/lib/assistant/step_context";
import { AssistantCharacter, type CharacterMood } from "./AssistantCharacter";
import { AssistantChat } from "./AssistantChat";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  locale?: string;   // "en" | "pt-BR"
  storeHook?: () => any;  // allow BR store to be passed in
}

// ─── Apply suggestion → write to resume store ─────────────────────────────────

function useApplySuggestion(locale: string) {
  const store = useResumeStore();
  return useCallback(
    (suggestion: AssistantSuggestion) => {
      const { action } = suggestion;
      const experience: any[] = store.experience || [];

      switch (action.type) {
        case "add_responsibility": {
          // Use the specified experienceId, or the most recent job
          const targetId =
            action.experienceId ||
            experience[0]?.id;
          if (!targetId) break;
          store.addResponsibility(targetId);
          // The new bullet is added at the end — update it immediately
          // We need a tiny delay for the store to update
          setTimeout(() => {
            const updated: any[] = useResumeStore.getState().experience;
            const job = updated.find((e: any) => e.id === targetId);
            if (!job) return;
            const idx = job.responsibilities.length - 1;
            store.updateResponsibility(targetId, idx, action.value);
          }, 50);
          break;
        }

        case "add_achievement": {
          const targetId =
            action.experienceId ||
            experience[0]?.id;
          if (!targetId) break;
          store.addAchievement(targetId);
          setTimeout(() => {
            const updated: any[] = useResumeStore.getState().experience;
            const job = updated.find((e: any) => e.id === targetId);
            if (!job) return;
            const idx = job.achievements.length - 1;
            store.updateAchievement(targetId, idx, action.value);
          }, 50);
          break;
        }

        case "add_skill": {
          store.addSkill(action.value);
          break;
        }

        case "update_summary": {
          store.updateSummary(action.value);
          break;
        }

        case "add_certification": {
          store.addCertification();
          setTimeout(() => {
            const certs = useResumeStore.getState().certifications;
            if (certs.length > 0) {
              const lastId = certs[certs.length - 1].id;
              store.updateCertification(lastId, action.value);
            }
          }, 50);
          break;
        }

        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store]
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResumeAssistant({ locale = "en" }: Props) {
  const pathname = usePathname();
  const step     = pathToStep(pathname);

  // Resume store
  const resumeState = useResumeStore((s) => ({
    personalInfo:  s.personalInfo,
    summary:       s.summary,
    skills:        s.skills,
    experience:    s.experience,
    education:     s.education,
    certifications: s.certifications,
  }));

  // Assistant store
  const {
    isOpen, isThinking, messages,
    hasNewSuggestions, lastAnalyzedStep, lastAnalyzedHash,
    open, close, toggle, setThinking,
    addMessage, addUserMessage,
    acceptSuggestion, dismissSuggestion,
    setLastAnalyzed, clearNewSuggestions,
  } = useAssistantStore();

  const applySuggestion = useApplySuggestion(locale);
  const analyzeRef = useRef(false);

  // ── Trigger analysis when step or resume changes ──────────────────────────
  const runAnalysis = useCallback(
    async (userMsg?: string) => {
      if (analyzeRef.current) return; // prevent double-run
      if (step === "unknown" || step === "preview") return;

      analyzeRef.current = true;
      setThinking(true);

      try {
        const payload = buildStepPayload(step, resumeState, locale);
        const currentHash = resumeHash(resumeState as Record<string, unknown>);

        const res = await fetch("/api/ai/assistant/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, userMessage: userMsg }),
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        if (data.message || (data.suggestions?.length ?? 0) > 0) {
          addMessage({
            id:          `cv1-${Date.now()}`,
            role:        "assistant",
            content:     data.message || "",
            suggestions: data.suggestions || [],
            timestamp:   Date.now(),
          });
        }

        setLastAnalyzed(step, currentHash);

        // Auto-open chat when CV-1 has something to say, on first analysis
        if (!isOpen && (data.suggestions?.length ?? 0) > 0) {
          setTimeout(() => open(), 800);
        }
      } catch {
        // Silent fail — don't disrupt the builder UX
      } finally {
        setThinking(false);
        analyzeRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, resumeState, locale]
  );

  // Fire analysis on step change
  useEffect(() => {
    const currentHash = resumeHash(resumeState as Record<string, unknown>);
    const stepChanged = lastAnalyzedStep !== step;
    const dataChanged = lastAnalyzedHash !== currentHash;

    if (stepChanged || (dataChanged && isOpen)) {
      // Debounce 1.5s so we don't fire on every keystroke
      const timer = setTimeout(() => runAnalysis(), 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pathname]);

  // ── Accept handler: apply to store + mark accepted ────────────────────────
  function handleAccept(msgId: string, suggId: string) {
    const msg = messages.find((m) => m.id === msgId);
    const sugg = msg?.suggestions?.find((s) => s.id === suggId);
    if (!sugg) return;

    applySuggestion(sugg);
    acceptSuggestion(msgId, suggId);
  }

  // ── User sends a message → re-analyze with context ────────────────────────
  async function handleUserMessage(text: string) {
    addUserMessage(text);
    await runAnalysis(text);
  }

  // ── Refresh → force re-analysis ───────────────────────────────────────────
  function handleRefresh() {
    setLastAnalyzed("__force__", "__force__");
    setTimeout(() => runAnalysis(), 100);
  }

  // ── Determine robot mood ──────────────────────────────────────────────────
  let mood: CharacterMood = "idle";
  if (isThinking) mood = "thinking";
  else if (messages.length === 0) mood = "waving";
  else if (hasNewSuggestions && !isOpen) mood = "talking";
  else if (isOpen) mood = "happy";

  const pendingSuggestions = messages
    .flatMap((m) => m.suggestions || [])
    .filter((s) => !s.accepted && !s.dismissed).length;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{   opacity: 0, y: 20, scale: 0.95   }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <AssistantChat
              messages={messages}
              isThinking={isThinking}
              locale={locale}
              onClose={() => { close(); clearNewSuggestions(); }}
              onAccept={handleAccept}
              onDismiss={dismissSuggestion}
              onSendMessage={handleUserMessage}
              onRefresh={handleRefresh}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Robot button ── */}
      <motion.button
        onClick={() => {
          toggle();
          if (!isOpen) clearNewSuggestions();
          if (!isOpen && messages.length === 0) runAnalysis();
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{  scale: 0.94 }}
        className="relative flex items-end justify-center cursor-pointer"
        aria-label="Open CV-1 AI resume coach"
      >
        {/* Glow ring when idle */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-25 animate-ping" />
        )}

        <AssistantCharacter mood={mood} size={64} />

        {/* Notification badge */}
        {!isOpen && pendingSuggestions > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
          >
            {pendingSuggestions}
          </motion.span>
        )}

        {/* Label below robot */}
        {!isOpen && (
          <span
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full shadow-sm border border-indigo-100"
          >
            CV-1™
          </span>
        )}
      </motion.button>
    </div>
  );
}
