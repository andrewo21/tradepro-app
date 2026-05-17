"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useDraggable } from "@/hooks/useDraggable";
import { useResumeStore } from "@/app/store/useResumeStore";
import {
  useAssistantStore,
  type AssistantSuggestion,
} from "@/app/store/useAssistantStore";
import { pathToStep, resumeHash, buildStepPayload } from "@/lib/assistant/step_context";
import { computeLiveAtsScore, atsLabelColor } from "@/lib/ats/live/liveAtsScore";
import AssistantFloat from "./AssistantFloat";
import { AssistantChat } from "./AssistantChat";
import { SpeechBubble } from "./SpeechBubble";

// ─── Apply suggestion → write to resume store ─────────────────────────────────

function useApplySuggestion() {
  const store = useResumeStore();
  return useCallback(
    (suggestion: AssistantSuggestion) => {
      const { action } = suggestion;
      const experience: any[] = store.experience || [];

      switch (action.type) {
        case "add_responsibility": {
          const targetId = action.experienceId || experience[0]?.id;
          if (!targetId) break;
          store.addResponsibility(targetId);
          setTimeout(() => {
            const updated: any[] = useResumeStore.getState().experience;
            const job = updated.find((e: any) => e.id === targetId);
            if (!job) return;
            store.updateResponsibility(targetId, job.responsibilities.length - 1, action.value);
          }, 50);
          break;
        }
        case "update_responsibility": {
          // Replace an existing bullet in-place
          const targetId  = action.experienceId || experience[0]?.id;
          const bulletIdx = typeof action.bulletIndex === "number" ? action.bulletIndex : null;
          if (!targetId || bulletIdx === null) break;
          store.updateResponsibility(targetId, bulletIdx, action.value);
          break;
        }
        case "add_achievement": {
          const targetId = action.experienceId || experience[0]?.id;
          if (!targetId) break;
          store.addAchievement(targetId);
          setTimeout(() => {
            const updated: any[] = useResumeStore.getState().experience;
            const job = updated.find((e: any) => e.id === targetId);
            if (!job) return;
            store.updateAchievement(targetId, job.achievements.length - 1, action.value);
          }, 50);
          break;
        }
        case "update_achievement": {
          const targetId  = action.experienceId || experience[0]?.id;
          const bulletIdx = typeof action.bulletIndex === "number" ? action.bulletIndex : null;
          if (!targetId || bulletIdx === null) break;
          store.updateAchievement(targetId, bulletIdx, action.value);
          break;
        }
        case "add_skill":        store.addSkill(action.value); break;
        case "update_summary":   store.updateSummary(action.value); break;
        case "add_certification": {
          store.addCertification();
          setTimeout(() => {
            const certs = useResumeStore.getState().certifications;
            if (certs.length > 0) store.updateCertification(certs[certs.length - 1].id, action.value);
          }, 50);
          break;
        }
        default: break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store]
  );
}

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
    lastAnalyzedStep, lastAnalyzedHash,
    open, close, toggle, setThinking,
    addMessage, addUserMessage,
    acceptSuggestion, dismissSuggestion,
    setLastAnalyzed, clearNewSuggestions,
    pendingBulletRequest, clearBulletRequest,
  } = useAssistantStore();

  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [toast, setToast]               = useState<string | null>(null);
  const { pos, isDragging, wasDragged, dragHandlers } = useDraggable("cv1-assistant");
  const applySuggestion = useApplySuggestion();
  const analyzeRef = useRef(false);

  // ── Analysis ───────────────────────────────────────────────────────────────
  const runAnalysis = useCallback(
    async (userMsg?: string) => {
      if (analyzeRef.current) return;
      if (step === "unknown" || step === "preview") return;
      analyzeRef.current = true;
      setThinking(true);

      try {
        const payload     = buildStepPayload(step, resumeState, locale);
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

  // ── Handle bullet improvement request from "Ask CV-1" button ─────────────
  useEffect(() => {
    if (!pendingBulletRequest) return;
    const req = pendingBulletRequest;
    clearBulletRequest();

    const userMsg = `Hey CV-1 — can you improve this ${req.bulletType} bullet for my role as ${req.jobTitle} at ${req.company}? Here it is: "${req.bulletText}"`;
    addUserMessage(userMsg);

    // Fire targeted analysis
    setThinking(true);
    analyzeRef.current = true;
    fetch("/api/ai/assistant/suggest", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step:       "experience",
        firstName,
        jobTitle:   req.jobTitle,
        locale:     req.locale,
        liveScore:  computeLiveAtsScore(resumeState).score,
        globalFlags: [],
        userMessage: userMsg,
        data: {
          experience: [{
            id:          req.jobId,
            index:       0,
            jobTitle:    req.jobTitle,
            company:     req.company,
            displayLabel: `${req.jobTitle} at ${req.company}`,
            responsibilities: req.bulletType === "responsibility" ? [req.bulletText] : [],
            achievements:     req.bulletType === "achievement"    ? [req.bulletText] : [],
          }],
        },
        issues: [`Bullet to improve: "${req.bulletText}"`],
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.message || data.suggestions?.length) {
          addMessage({
            id:          `cv1-${Date.now()}`,
            role:        "assistant",
            content:     data.message || "",
            suggestions: (data.suggestions || []).map((s: any) => ({
              ...s,
              action: {
                ...s.action,
                type:        req.bulletType === "responsibility" ? "update_responsibility" : "update_achievement",
                experienceId: req.jobId,
                bulletIndex:  req.bulletIndex,
              },
            })),
            timestamp: Date.now(),
          });
        }
      })
      .catch(() => {})
      .finally(() => { setThinking(false); analyzeRef.current = false; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBulletRequest]);

  const firstName = resumeState.personalInfo?.firstName || "there";

  // Fire on step change (debounced)
  useEffect(() => {
    const currentHash = resumeHash(resumeState as Record<string, unknown>);
    const stepChanged = lastAnalyzedStep !== step;
    const dataChanged = lastAnalyzedHash !== currentHash;

    if (stepChanged || (dataChanged && isOpen)) {
      setBubbleVisible(false);
      const timer = setTimeout(() => runAnalysis(), 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pathname]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleAccept(msgId: string, suggId: string) {
    const msg  = messages.find((m) => m.id === msgId);
    const sugg = msg?.suggestions?.find((s) => s.id === suggId);
    if (!sugg) return;
    applySuggestion(sugg);
    acceptSuggestion(msgId, suggId);
    // Toast showing exact location + points gained
    setToast(`✓ Added: ${sugg.label} (+${sugg.pointGain} pts)`);
    setTimeout(() => setToast(null), 3500);
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

  const latestMsg = messages.length > 0 ? messages[messages.length - 1] : null;

  const pendingCount = messages
    .flatMap((m) => m.suggestions || [])
    .filter((s) => !s.accepted && !s.dismissed).length;

  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-0"
      style={{ left: pos.x, top: pos.y, cursor: isDragging ? "grabbing" : "grab" }}
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
              onClose={() => { close(); clearNewSuggestions(); }}
              onAccept={handleAccept}
              onDismiss={dismissSuggestion}
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
              onAccept={handleAccept}
              onDismiss={dismissSuggestion}
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

          <AssistantFloat
            src="/cv1.glb"
            fallback="/cv1-hero.png"
            alt="CV-1"
            size={120}
            isThinking={isThinking}
          />

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
            <span className="text-[9px] font-medium text-neutral-400">/95</span>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 tracking-wide">
            {charName}™
          </span>
        </motion.div>
      </div>

      {/* Acceptance toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{   opacity: 0, y: 10  }}
            className="fixed bottom-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl z-50 max-w-xs"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
