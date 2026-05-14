"use client";

// BR version of the assistant — reads from useBrResumeStore and maps
// field names to the common format expected by step_context helpers.

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import {
  useAssistantStore,
  type AssistantSuggestion,
} from "@/app/store/useAssistantStore";
import { pathToStep, resumeHash } from "@/lib/assistant/step_context";
import { AssistantCharacter, type CharacterMood } from "./AssistantCharacter";
import { AssistantChat } from "./AssistantChat";

// ─── Map BR store → common resume snapshot ───────────────────────────────────

function useBrResumeSnapshot() {
  const s = useBrResumeStore((st: any) => ({
    personalInfo:            st.personalInfo,
    resumoProfissional:      st.resumoProfissional,
    habilidadesTecnicas:     st.habilidadesTecnicas,
    habilidadesComportamentais: st.habilidadesComportamentais,
    experiencia:             st.experiencia,
    formacao:                st.formacao,
    cursosCertificacoes:     st.cursosCertificacoes,
  }));

  return {
    personalInfo: {
      firstName:  s.personalInfo?.nome || "",
      lastName:   s.personalInfo?.sobrenome || "",
      tradeTitle: s.personalInfo?.tituloProfissional || "",
      phone:      s.personalInfo?.telefone || "",
      email:      s.personalInfo?.email || "",
      city:       s.personalInfo?.cidade || "",
      state:      s.personalInfo?.estado || "",
      linkedin:   s.personalInfo?.linkedin || "",
    },
    summary: s.resumoProfissional || "",
    skills: [
      ...(s.habilidadesTecnicas     || []),
      ...(s.habilidadesComportamentais || []),
    ],
    experience: (s.experiencia || []).map((e: any) => ({
      id:               e.id,
      jobTitle:         e.cargo || "",
      company:          e.empresa || "",
      city:             e.cidade || "",
      state:            e.estado || "",
      startDate:        e.dataInicio || "",
      endDate:          e.dataFim || "",
      roleSummary:      e.roleSummary || "",
      responsibilities: e.responsabilidades || [],
      achievements:     [],
    })),
    education:      s.formacao || [],
    certifications: (s.cursosCertificacoes || []).map((c: any) => ({
      id:   c.nome,
      text: c.nome,
    })),
  };
}

// ─── Apply suggestion → BR store ──────────────────────────────────────────────

function useApplyBrSuggestion() {
  const store = useBrResumeStore();
  return useCallback(
    (suggestion: AssistantSuggestion) => {
      const { action } = suggestion;
      const experiencia: any[] = useBrResumeStore.getState().experiencia || [];

      switch (action.type) {
        case "add_responsibility": {
          const targetId = action.experienceId || experiencia[0]?.id;
          if (!targetId) break;
          store.addResponsabilidade(targetId);
          setTimeout(() => {
            const updated: any[] = useBrResumeStore.getState().experiencia;
            const job = updated.find((e: any) => e.id === targetId);
            if (!job) return;
            const idx = job.responsabilidades.length - 1;
            store.updateResponsabilidade(targetId, idx, action.value);
          }, 50);
          break;
        }
        case "add_skill": {
          store.addHabilidadeTecnica();
          setTimeout(() => {
            const tecnicas = useBrResumeStore.getState().habilidadesTecnicas;
            if (tecnicas.length > 0) {
              store.updateHabilidadeTecnica(tecnicas.length - 1, action.value);
            }
          }, 50);
          break;
        }
        case "update_summary": {
          store.updateResumo(action.value);
          break;
        }
        default:
          break;
      }
    },
    [store]
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrResumeAssistant() {
  const pathname     = usePathname();
  const step         = pathToStep(pathname);
  const resumeState  = useBrResumeSnapshot();
  const applyBr      = useApplyBrSuggestion();
  const analyzeRef   = useRef(false);

  const {
    isOpen, isThinking, messages, hasNewSuggestions,
    lastAnalyzedStep, lastAnalyzedHash,
    open, close, toggle, setThinking,
    addMessage, addUserMessage, acceptSuggestion, dismissSuggestion,
    setLastAnalyzed, clearNewSuggestions,
  } = useAssistantStore();

  const runAnalysis = useCallback(
    async (userMsg?: string) => {
      if (analyzeRef.current) return;
      if (step === "unknown" || step === "preview") return;
      analyzeRef.current = true;
      setThinking(true);
      try {
        const { buildStepPayload } = await import("@/lib/assistant/step_context");
        const payload = buildStepPayload(step, resumeState, "pt-BR");
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
            id:          `gringo-${Date.now()}`,
            role:        "assistant",
            content:     data.message || "",
            suggestions: data.suggestions || [],
            timestamp:   Date.now(),
          });
        }
        setLastAnalyzed(step, currentHash);
        if (!isOpen && (data.suggestions?.length ?? 0) > 0) {
          setTimeout(() => open(), 800);
        }
      } catch { /* silent */ } finally {
        setThinking(false);
        analyzeRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, resumeState]
  );

  useEffect(() => {
    const currentHash = resumeHash(resumeState as Record<string, unknown>);
    if (lastAnalyzedStep !== step || (lastAnalyzedHash !== currentHash && isOpen)) {
      const timer = setTimeout(() => runAnalysis(), 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pathname]);

  function handleAccept(msgId: string, suggId: string) {
    const msg  = messages.find((m) => m.id === msgId);
    const sugg = msg?.suggestions?.find((s) => s.id === suggId);
    if (!sugg) return;
    applyBr(sugg);
    acceptSuggestion(msgId, suggId);
  }

  async function handleUserMessage(text: string) {
    addUserMessage(text);
    await runAnalysis(text);
  }

  function handleRefresh() {
    setLastAnalyzed("__force__", "__force__");
    setTimeout(() => runAnalysis(), 100);
  }

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
              locale="pt-BR"
              onClose={() => { close(); clearNewSuggestions(); }}
              onAccept={handleAccept}
              onDismiss={dismissSuggestion}
              onSendMessage={handleUserMessage}
              onRefresh={handleRefresh}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => {
          toggle();
          if (!isOpen) clearNewSuggestions();
          if (!isOpen && messages.length === 0) runAnalysis();
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{  scale: 0.94 }}
        className="relative flex items-end justify-center cursor-pointer"
        aria-label="Abrir Gringo coach de currículo IA"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-25 animate-ping" />
        )}
        <AssistantCharacter mood={mood} size={64} />
        {!isOpen && pendingSuggestions > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
          >
            {pendingSuggestions}
          </motion.span>
        )}
        {!isOpen && (
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-full shadow-sm border border-indigo-100">
            Gringo™
          </span>
        )}
      </motion.button>
    </div>
  );
}
