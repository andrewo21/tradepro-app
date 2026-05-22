"use client";

// BrResumeAssistant — Gringo assistant for the Brazil builder.
// Architecture: Gringo is CHAT-ONLY. No store writes from the assistant.
// The wizard forms (steps 1–6) own all data collection.

import { useEffect, useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDraggable } from "@/hooks/useDraggable";
import { MessageCircle } from "lucide-react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { useAssistantStore } from "@/app/store/useAssistantStore";
import { pathToStep, resumeHash } from "@/lib/assistant/step_context";
import GringoCharacter, { type GringoMood } from "./GringoCharacter";
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
      firstName:  s.personalInfo?.nome                 || "",
      lastName:   s.personalInfo?.sobrenome             || "",
      tradeTitle: s.personalInfo?.tituloProfissional    || "",
      phone:      s.personalInfo?.telefone              || "",
      email:      s.personalInfo?.email                 || "",
      city:       s.personalInfo?.cidade                || "",
      state:      s.personalInfo?.estado                || "",
      linkedin:   s.personalInfo?.linkedin              || "",
    },
    summary:  s.resumoProfissional || "",
    skills:   [...(s.habilidadesTecnicas || []), ...(s.habilidadesComportamentais || [])],
    experience: (s.experiencia || []).map((e: any) => ({
      id:               e.id,
      jobTitle:         e.cargo      || "",
      company:          e.empresa    || "",
      startDate:        e.dataInicio || "",
      endDate:          e.dataFim    || "",
      roleSummary:      e.roleSummary || "",
      responsibilities: e.responsabilidades || [],
      achievements:     [],
    })),
    education:      s.formacao || [],
    certifications: (s.cursosCertificacoes || []).map((c: any) => ({ id: c.nome, text: c.nome })),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BrResumeAssistant() {
  const pathname    = usePathname();
  const step        = pathToStep(pathname);
  const resumeState = useBrResumeSnapshot();
  const analyzeRef  = useRef(false);

  const {
    isOpen, isThinking, messages,
    lastAnalyzedStep,
    open, close, toggle, setThinking,
    addMessage, addUserMessage,
    setLastAnalyzed, clearNewSuggestions,
    usedSuggestionLabels,
  } = useAssistantStore();

  const [bubbleVisible, setBubbleVisible] = useState(false);
  const { pos, isDragging, wasDragged, dragHandlers } = useDraggable("gringo-assistant");

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
          body:    JSON.stringify({
            ...payload,
            mode:   "general",
            locale: "pt-BR",
            userMessage: userMsg,
            usedSuggestionLabels,
          }),
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

  // No auto-fire on step change — Gringo only activates on user interaction.
  useEffect(() => {
    if (lastAnalyzedStep !== step) setBubbleVisible(false);
  }, [step, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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

  let gringoMood: GringoMood = "idle";
  if (isThinking)                    gringoMood = "thinking";
  else if (messages.length === 0)    gringoMood = "wave";
  else if (bubbleVisible && !isOpen) gringoMood = "talking";

  const latestMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const pendingCount = messages
    .flatMap((m) => m.suggestions || [])
    .filter((s) => !s.accepted && !s.dismissed).length;

  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-0"
      style={{ left: pos.x, top: pos.y, cursor: isDragging ? "grabbing" : "grab" }}
    >

      {/* Full chat panel */}
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
              onSendMessage={handleUserMessage}
              onRefresh={handleRefresh}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speech bubble (when chat is closed) */}
      <AnimatePresence>
        {bubbleVisible && !isOpen && latestMsg && (
          <div className="mb-2 mr-2">
            <SpeechBubble
              message={latestMsg}
              isThinking={isThinking}
              locale="pt-BR"
              name="Gringo"
              onOpenChat={handleOpenChat}
              onClose={() => setBubbleVisible(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Gringo character */}
      <div className="relative flex flex-col items-center">
        <motion.button
          onClick={() => { if (!wasDragged()) handleRobotClick(); }}
          {...dragHandlers}
          whileHover={isDragging ? {} : { scale: 1.07, y: -2 }}
          whileTap={isDragging ? {} : { scale: 0.93 }}
          className="relative focus:outline-none select-none"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          aria-label="Abrir Gringo coach de currículo IA"
        >
          {(bubbleVisible || isThinking) && !isOpen && (
            <motion.span
              className="absolute inset-0 rounded-full bg-green-400 opacity-20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <GringoCharacter mood={gringoMood} size={100} />

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
              className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </motion.span>
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0   }}
          className="mt-1 px-3 py-0.5 bg-white rounded-full shadow-md border border-green-100"
        >
          <span className="text-[11px] font-bold text-green-700 tracking-wide">Gringo™</span>
        </motion.div>
      </div>
    </div>
  );
}
