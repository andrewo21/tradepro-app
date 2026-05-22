"use client";

import { X, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { AssistantMessage } from "@/app/store/useAssistantStore";

// Assistant is chat-only — SpeechBubble shows advice, no accept/dismiss.
interface Props {
  message: AssistantMessage | null;
  isThinking: boolean;
  locale: string;
  name: string;
  onOpenChat: () => void;
  onClose: () => void;
}

export function SpeechBubble({
  message, isThinking, locale, name, onOpenChat, onClose,
}: Props) {
  const isEN = locale !== "pt-BR";
  const suggestions = message?.suggestions?.filter((s) => !s.dismissed) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, x: 20, y: 10 }}
      animate={{ opacity: 1, scale: 1,    x: 0,  y: 0  }}
      exit={{   opacity: 0, scale: 0.85, x: 20, y: 10  }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="relative mb-2"
      style={{ maxWidth: 310 }}
    >
      <div className="bg-white rounded-2xl rounded-br-sm shadow-2xl border border-indigo-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm tracking-wide">{name}™</span>
            {isThinking && (
              <span className="flex gap-0.5">
                {[0,1,2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-white/70 rounded-full"
                    style={{ animation: `bounce 1s ease-in-out ${i*0.15}s infinite` }} />
                ))}
                <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}`}</style>
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message */}
        {message?.content && (
          <div className="px-4 pt-3 pb-2">
            <p className="text-sm text-gray-700 leading-relaxed">
              {message.content.length > 160 ? message.content.slice(0, 157) + "…" : message.content}
            </p>
          </div>
        )}

        {/* Read-only advice cards */}
        {suggestions.length > 0 && (
          <div className="mx-3 mb-3 flex flex-col gap-1.5">
            {suggestions.slice(0, 2).map((s) => (
              <div key={s.id} className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-indigo-700 mb-0.5">{s.label}</p>
                {s.preview && (
                  <p className="text-xs text-gray-700 italic leading-relaxed">
                    &ldquo;{s.preview.length > 80 ? s.preview.slice(0, 77) + "…" : s.preview}&rdquo;
                  </p>
                )}
                {s.reason && <p className="text-[10px] text-indigo-400 mt-0.5">{s.reason}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Open chat CTA */}
        <button
          onClick={onOpenChat}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border-t border-indigo-50 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {isEN ? "Ask me anything — open chat" : "Me pergunte qualquer coisa"}
        </button>
      </div>
      <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-indigo-100 rotate-45 shadow-sm" />
    </motion.div>
  );
}
