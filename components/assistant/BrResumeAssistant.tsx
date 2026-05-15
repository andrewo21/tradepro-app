"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import {
  useAssistantStore,
  type AssistantSuggestion,
} from "@/app/store/useAssistantStore";
import { pathToStep, resumeHash } from "@/lib/assistant/step_context";
import { AssistantCharacter, type CharacterMood } from "./AssistantCharacter";
import { AssistantChat } from "./AssistantChat";
import { SpeechBubble } from "./SpeechBubble";

// ─── Map BR store → common snapshot ──────────────────────────────────────────

function useBrResumeSnapshot() {
  const s = useBrResumeStore((st: any) => ({
    personalInfo:               st.personalInfo,
    resumoProfissional:         st.resumoProfissional,
    habilidadesTecnicas:        st.habilidadesTecnicas,
    habilidadesComportamentais: st.habilidadesComportamentais,
    experiencia:                st.experiencia,
    formacao:                   st.formacao,
    cursosCertificacoes:        st.cursosCertificacoes,
  }));

  return {
    personalInfo: {
      firstName:  s.personalInfo?.nome       || "",
      lastName:   s.personalInfo?.sobrenome  || "",
      tradeTitle: s.personalInfo?.tituloProfissional || "",
      phone:      s.personalInfo?.telefone   || "",
      email:      s.personalInfo?.email      || "",
      city:       s.personalInfo?.cidade     || "",
      state:      s.personalInfo?.estado     || "",
      linkedin:   s.personalInfo?.linkedin   || "",
    },
    summary:  s.resumoProfissional || "",
    skills:   [...(s.habilidadesTecnicas || []), ...(s.habilidadesComportamentais || [])],
    experience: (s.experiencia || []).map((e: any) => ({
      id:               e.id,
      jobTitle:         e.cargo       || "",
      company:          e.empresa     || "",
      startDate:        e.dataInicio  || "",
      endDate:          e.dataFim     || "",
      roleSummary:      e.roleSummary || "",
      responsibilities: e.responsabilidades || [],
      achievements:     [],
    })),
    education:      s.formacao || [],
    certifications: (s.cursosCertificacoes || []).map((c: any) => ({ id: c.nome, text: c.nome })),
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
            store.updateResponsabilidade(targetId, job.responsabilidades.length - 1, action.value);
          }, 50);
          break;
        }
        case "add_skill": {
          store.addHabilidadeTecnica();
          setTimeout(() => {
            const tecnicas = useBrResumeStore.getState().habilidadesTecnicas;
            if (tecnicas.length > 0) store.updateHabilidadeTecnica(tecnicas.length - 1, action.value);
          }, 50);
          break;
        }
        case "update_summary": store.updateResumo(action.value); break;
        default: break;
      }
    },
    [store]
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrResumeAssistant() {
  const pathname    = usePathname();
  const step        = pathToStep(pathname);
  const resumeState = useBrResumeSnapshot();
  const applyBr     = useApplyBrSuggestion();
  const analyzeRef  = useRef(false);

  const {
    isOpen, isThinking, messages,
    lastAnalyzedStep, lastAnalyzedHash,
    open, close, toggle, setThinking,
    addMessage, addUserMessage,
    acceptSuggestion, dismissSuggestion,
    setLastAnalyzed, clearNewSuggestions,
  } = useAssistantStore();

  const [bubbleVisible, setBubbleVisible] = useState(false);

  const runAnalysis = useCallback(
    async (userMsg?: string) => {
      if (analyzeRef.current) return;
      if (step === "unknown" || step === "preview") return;
      analyzeRef.current = true;
      setThinking(true);
      try {
        const { buildStepPayload } = await import("@/lib/assistant/step_context");
        const payload     = buildStepPayload(step, resumeState, "pt-BR");
        const currentHash = resumeHash(resumeState as Record<string, unknown>);

        const res = await fetch("/api/ai/assistant/suggest", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ ...payload, userMessage: userMsg }),
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
          if (!isOpen) setTimeout(() => setBubbleVisible(true), 400);
        }
        setLastAnalyzed(step, currentHash);
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
      setBubbleVisible(false);
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
    setBubbleVisible(false);
    setTimeout(() => runAnalysis(), 100);
  }

  function handleOpenChat() {
    setBubbleVisible(false);
    clearNewSuggestions();
    open();
  }

  function handleRobotClick() {
    if (isOpen) { close(); return; }
    if (bubbleVisible) { handleOpenChat(); return; }
    if (messages.length === 0) { open(); runAnalysis(); return; }
    toggle();
    clearNewSuggestions();
  }

  let mood: CharacterMood = "idle";
  if (isThinking)                    mood = "thinking";
  else if (messages.length === 0)    mood = "waving";
  else if (bubbleVisible && !isOpen) mood = "talking";
  else if (isOpen)                   mood = "happy";

  const latestMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const pendingCount = messages
    .flatMap((m) => m.suggestions || [])
    .filter((s) => !s.accepted && !s.dismissed).length;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-0">

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{   opacity: 0, y: 30, scale: 0.92   }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="mb-3"
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

      <AnimatePresence>
        {bubbleVisible && !isOpen && latestMsg && (
          <div className="mb-2 mr-2">
            <SpeechBubble
              message={latestMsg}
              isThinking={isThinking}
              locale="pt-BR"
              name="Gringo"
              onAccept={handleAccept}
              onDismiss={dismissSuggestion}
              onOpenChat={handleOpenChat}
              onClose={() => setBubbleVisible(false)}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center">
        <motion.button
          onClick={handleRobotClick}
          whileHover={{ scale: 1.07, y: -2 }}
          whileTap={{  scale: 0.93        }}
          className="relative cursor-pointer focus:outline-none"
          aria-label="Abrir Gringo coach de currículo IA"
        >
          {(bubbleVisible || isThinking) && !isOpen && (
            <motion.span
              className="absolute inset-0 rounded-full bg-indigo-400 opacity-20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <AssistantCharacter mood={mood} size={88} variant="br" />

          {!isOpen && !bubbleVisible && pendingCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg px-1"
            >
              {pendingCount}
            </motion.span>
          )}

          {isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </motion.span>
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0   }}
          className="mt-1 px-3 py-0.5 bg-white rounded-full shadow-md border border-indigo-100"
        >
          <span className="text-[11px] font-bold text-indigo-600 tracking-wide">Gringo™</span>
        </motion.div>
      </div>
    </div>
  );
}
