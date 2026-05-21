"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, RefreshCw } from "lucide-react";
import type { AssistantMessage } from "@/app/store/useAssistantStore";
import { SuggestionCard } from "./SuggestionCard";

// ── Typewriter hook ───────────────────────────────────────────────────────────

function useTypewriter(text: string, active: boolean, speed = 18): string {
  const [displayed, setDisplayed] = useState("");
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    function tick() {
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) {
        frameRef.current = setTimeout(tick, speed);
      }
    }
    frameRef.current = setTimeout(tick, 80); // initial delay
    return () => { if (frameRef.current) clearTimeout(frameRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active]);

  return displayed;
}

// ── Single message bubble ─────────────────────────────────────────────────────

function MessageBubble({
  message,
  isLatest,
  onAccept,
  onDismiss,
  locale,
}: {
  message: AssistantMessage;
  isLatest: boolean;
  onAccept: (msgId: string, suggId: string, finalText?: string) => void;
  onDismiss: (msgId: string, suggId: string) => void;
  locale?: string;
}) {
  const isAssistant = message.role === "assistant";
  const displayedText = useTypewriter(message.content, isAssistant && isLatest);
  const activeSuggestions = (message.suggestions || []).filter((s) => !s.dismissed);

  return (
    <div className={`flex flex-col gap-2 ${isAssistant ? "items-start" : "items-end"}`}>
      {/* Text bubble */}
      <div
        className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isAssistant
            ? "bg-indigo-600 text-white rounded-tl-sm"
            : "bg-gray-100 text-gray-800 rounded-tr-sm"
        }`}
      >
        {displayedText}
        {isAssistant && isLatest && displayedText.length < message.content.length && (
          <span className="inline-block w-1 h-4 bg-white/70 ml-0.5 animate-pulse align-text-bottom" />
        )}
      </div>

      {/* Suggestion cards — shown under assistant messages */}
      {isAssistant && activeSuggestions.length > 0 && (
        <div className="w-full flex flex-col gap-2 pl-1">
          {activeSuggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              msgId={message.id}
              suggestion={s}
              onAccept={onAccept}
              onDismiss={onDismiss}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-indigo-400 rounded-full"
          style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// ── Main chat panel ───────────────────────────────────────────────────────────

interface Props {
  messages: AssistantMessage[];
  isThinking: boolean;
  locale?: string;
  activeMode?: string;
  onClose: () => void;
  onAccept: (msgId: string, suggId: string, finalText?: string) => void;
  onDismiss: (msgId: string, suggId: string) => void;
  onSendMessage: (text: string) => void;
  onRefresh: () => void;
}

const MODE_LABEL: Record<string, string> = {
  general:   "General",
  resume:    "Resume Coach",
  job_match: "Job Match",
};
const MODE_COLOR: Record<string, string> = {
  general:   "bg-slate-500",
  resume:    "bg-indigo-500",
  job_match: "bg-emerald-600",
};

export function AssistantChat({
  messages,
  isThinking,
  locale,
  activeMode = "resume",
  onClose,
  onAccept,
  onDismiss,
  onSendMessage,
  onRefresh,
}: Props) {
  const isEN = locale !== "pt-BR";
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  function handleSend() {
    const text = inputValue.trim();
    if (!text) return;
    onSendMessage(text);
    setInputValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isEmpty = messages.length === 0 && !isThinking;

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden"
         style={{ width: 340, maxHeight: "min(520px, calc(100vh - 220px))" }}>

      {/* ── Header — drag the whole window from here ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold leading-none tracking-wide">
                {isEN ? "CV-1™" : "Gringo™"}
              </p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${MODE_COLOR[activeMode] || "bg-indigo-500"}`}>
                {MODE_LABEL[activeMode] || "Resume Coach"}
              </span>
            </div>
            <p className="text-xs text-indigo-200 leading-none mt-0.5">
              {isEN ? "AI Resume Coach" : "Coach de Currículo IA"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            title={isEN ? "CV-1: re-analyze this step" : "CV-1: re-analisar esta etapa"}
            className="p-1.5 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {isEmpty && !isThinking && (
          <div className="text-center py-8 text-gray-400 text-sm">
            {isEN
              ? "CV-1 is scanning your resume…"
              : "Gringo está analisando seu currículo…"}
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLatest={i === messages.length - 1}
            onAccept={onAccept}
            onDismiss={onDismiss}
            locale={locale}
          />
        ))}

        {isThinking && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="border-t border-gray-100 px-3 py-2.5 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isEN ? "Ask CV-1 anything…" : "Pergunte ao Gringo…"}
          className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all placeholder:text-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="flex-shrink-0 p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
