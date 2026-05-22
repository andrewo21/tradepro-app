"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useDraggable } from "@/hooks/useDraggable";
import { useResumeStore } from "@/app/store/useResumeStore";
import { useAssistantStore } from "@/app/store/useAssistantStore";
import { pathToStep, resumeHash, buildStepPayload } from "@/lib/assistant/step_context";
import { computeLiveAtsScore, atsLabelColor } from "@/lib/ats/live/liveAtsScore";
import CV1Character from "./CV1Character";
import type { CV1Mood } from "./CV1Character";
import { AssistantChat } from "./AssistantChat";
import { SpeechBubble } from "./SpeechBubble";

// ─── Architecture: assistant is chat-only ─────────────────────────────────────
//
// The wizard steps (forms) own all data collection and writes to the store.
// The assistant (CV-1 / Gringo) only chats — it reads data for context but
// NEVER writes to the store. useApplySuggestion has been removed.

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  locale?: string;
}

export default function ResumeAssistant({ locale = "en" }: Props) {
  const pathname = usePathname();
  const step     = pathToStep(pathname);
  const isEN     = locale !== "pt-BR";
  const charName = isEN ? "CV-1" : "Gringo";

  const resumeState = useResumeStore((s) => ({
    personalInfo:   s.personalInfo,
    summary:        s.summary,
    skills:         s.skills,
    experience:     s.experience,
    education:      s.education,
    certifications: s.certifications,
  }));

  const {
    isOpen, isThinking, messages,
    activeMode, setMode,
    lastAnalyzedStep, lastAnalyzedHash,
    open, close, toggle, setThinking,
    addMessage, addUserMessage,
    setLastAnalyzed, clearNewSuggestions,
    usedSuggestionLabels,
  } = useAssistantStore();

  const [bubbleVisible, setBubbleVisible] = useState(false);
  const { pos, isDragging, wasDragged, dragHandlers } = useDraggable("cv1-assistant");
  const analyzeRef = useRef(false);

  // Declare firstName early — used in useEffects below
  const firstName = resumeState.personalInfo?.firstName || "there";

  // Mode detection — determines which CV-1 mode to activate
  const detectMode = useCallback((userMsg?: string) => {
    if (step === "ats") return "job_match" as const;
    if (userMsg && /^(what|how|why|when|who|can you|could you|do you|is it|are you|tell me about|explain)/i.test(userMsg.trim())
      && !/\b(resume|bullet|skill|experience|summary|certification|improve|rewrite|fix|help me with)\b/i.test(userMsg)) {
      return "general" as const;
    }
    return "resume" as const;
  }, [step]);

  // ── Analysis ───────────────────────────────────────────────────────────────
  const runAnalysis = useCallback(
    async (userMsg?: string) => {
      if (analyzeRef.current) return;
      if (step === "unknown" || step === "preview") return;
      analyzeRef.current = true;
      setThinking(true);

      const currentMode = detectMode(userMsg);
      setMode(currentMode);

      try {
        const payload     = buildStepPayload(step, resumeState, locale);
        const currentHash = resumeHash(resumeState as Record<string, unknown>);

        const recentHistory = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/ai/assistant/suggest", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            ...payload,
            mode: currentMode,
            userMessage: userMsg,
            conversationHistory: recentHistory,
            usedSuggestionLabels,
          }),
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
          // Show speech bubble — NOT the full chat panel
          if (!isOpen) {
            setTimeout(() => setBubbleVisible(true), 400);
          }
        }
        setLastAnalyzed(step, currentHash);
      } catch { /* silent */ } finally {
        setThinking(false);
        analyzeRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, resumeState, locale]
  );

  // "Ask CV-1 to improve" button removed — assistant is chat-only.
  // Users ask questions by typing in the chat; CV-1 replies with read-only advice.

  // CV-1 does NOT auto-fire on step change.
  // Unsolicited suggestions on navigation was the root cause of recycled advice.
  // CV-1 activates only when:
  //   a) User explicitly clicks the robot (handleRobotClick)
  //   b) User sends a message (handleUserMessage)
  //   c) User types in the chat input
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Only track step changes for context — no auto analysis
    if (lastAnalyzedStep !== step) {
      setBubbleVisible(false);
    }
  }, [step, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────────
  // Assistant is chat-only. No accept handler — no store writes from the assistant.
  // The wizard forms own all data collection and modifications.

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
    if (isOpen) {
      close();
      return;
    }
    // If there's a bubble, clicking robot opens full chat
    if (bubbleVisible) {
      handleOpenChat();
      return;
    }
    // No analysis yet — run it and open chat
    if (messages.length === 0) {
      open();
      runAnalysis();
      return;
    }
    // Has messages — toggle chat
    toggle();
    clearNewSuggestions();
  }

  // ── Live ATS score ────────────────────────────────────────────────────────
  const liveAts    = computeLiveAtsScore(resumeState);
  const scoreColor = atsLabelColor(liveAts.label);

  // ── CV-1 mood based on current state ─────────────────────────────────────
  let cv1Mood: CV1Mood = "idle";
  if (isThinking)                    cv1Mood = "thinking";
  else if (messages.length === 0)    cv1Mood = "wave";
  else if (bubbleVisible && !isOpen) cv1Mood = "talking";

  const latestMsg = messages.length > 0 ? messages[messages.length - 1] : null;

  const pendingCount = messages
    .flatMap((m) => m.suggestions || [])
    .filter((s) => !s.accepted && !s.dismissed).length;

  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-0"
      style={{ left: pos.x, top: pos.y }}
      {...dragHandlers}
    >

      {/* ── Full chat panel (slides up above robot) ── */}
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
              locale={locale}
              activeMode={activeMode}
              onClose={() => { close(); clearNewSuggestions(); }}
              onSendMessage={handleUserMessage}
              onRefresh={handleRefresh}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Speech bubble (above robot, only when chat is closed) ── */}
      <AnimatePresence>
        {bubbleVisible && !isOpen && latestMsg && (
          <div className="mb-2 mr-2">
            <SpeechBubble
              message={latestMsg}
              isThinking={isThinking}
              locale={locale}
              name={charName}
              onOpenChat={handleOpenChat}
              onClose={() => setBubbleVisible(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── Robot character — always visible, always the star ── */}
      <div className="relative flex flex-col items-center">
        <motion.button
          onClick={() => { if (!wasDragged()) handleRobotClick(); }}
          {...dragHandlers}
          whileHover={isDragging ? {} : { scale: 1.07, y: -2 }}
          whileTap={isDragging ? {} : { scale: 0.93 }}
          className="relative focus:outline-none select-none"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          aria-label={`Open ${charName} AI resume coach`}
        >
          {/* Glow pulse behind robot when it has something to say */}
          {(bubbleVisible || isThinking) && !isOpen && (
            <motion.span
              className="absolute inset-0 rounded-full bg-indigo-400 opacity-20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <CV1Character mood={cv1Mood} size={100} />

          {/* Pending badge */}
          {!isOpen && !bubbleVisible && pendingCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg px-1"
            >
              {pendingCount}
            </motion.span>
          )}

          {/* "Open chat" icon when chat is closed and we have history */}
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

        {/* Live ATS score + name tag */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0   }}
          className="mt-1 flex flex-col items-center gap-0.5"
        >
          {/* Score pill */}
          <div
            className="px-2.5 py-0.5 rounded-full shadow-md border text-center flex items-center gap-1.5"
            style={{ backgroundColor: scoreColor + "15", borderColor: scoreColor + "40" }}
          >
            <span className="text-[10px] font-bold" style={{ color: scoreColor }}>
              ATS
            </span>
            <span className="text-sm font-black" style={{ color: scoreColor }}>
              {liveAts.score}
            </span>
            <span className="text-[9px] font-medium text-neutral-400">/100</span>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 tracking-wide">
            {charName}™
          </span>
        </motion.div>
      </div>

    </div>
  );
}
