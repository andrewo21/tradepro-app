"use client";

import { useState } from "react";
import { X, Check, Zap, MessageCircle, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AssistantMessage, AssistantSuggestion } from "@/app/store/useAssistantStore";

interface Props {
  message: AssistantMessage | null;
  isThinking: boolean;
  locale: string;
  name: string;
  onAccept: (msgId: string, suggId: string, finalText?: string) => void;
  onDismiss: (msgId: string, suggId: string) => void;
  onOpenChat: () => void;
  onClose: () => void;
}

function extractPlaceholders(text: string): string[] {
  return [...new Set(text.match(/\[[^\]]+\]/g) || [])];
}

export function SpeechBubble({
  message, isThinking, locale, name,
  onAccept, onDismiss, onOpenChat, onClose,
}: Props) {
  const isEN = locale !== "pt-BR";
  const [acceptedId, setAcceptedId]   = useState<string | null>(null);
  const [fillValues, setFillValues]   = useState<Record<string, string>>({});
  const [showFill, setShowFill]       = useState(false);

  const firstPending: AssistantSuggestion | undefined = message?.suggestions?.find(
    (s) => !s.accepted && !s.dismissed
  );
  const totalPending = message?.suggestions?.filter((s) => !s.accepted && !s.dismissed).length ?? 0;

  const placeholders = extractPlaceholders(firstPending?.preview || "");
  const hasBrackets  = placeholders.length > 0;
  const allFilled    = placeholders.every(p => fillValues[p]?.trim());

  function buildFinalText(): string {
    let text = firstPending?.preview || "";
    for (const p of placeholders) {
      if (fillValues[p]?.trim()) text = text.replace(p, fillValues[p].trim());
    }
    return text;
  }

  function handleAccept(suggId: string) {
    if (!message) return;
    setAcceptedId(suggId);
    const finalText = hasBrackets && allFilled ? buildFinalText() : undefined;
    setTimeout(() => {
      onAccept(message.id, suggId, finalText);
      setAcceptedId(null);
    }, 400);
  }

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
              {message.content.length > 140 ? message.content.slice(0, 137) + "…" : message.content}
            </p>
          </div>
        )}

        {/* First suggestion */}
        {firstPending && (
          <div className="mx-3 mb-3 border border-indigo-100 rounded-xl overflow-hidden bg-indigo-50/40">
            <div className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                {/* Only show Zap badge if pointGain > 0 */}
                {firstPending.pointGain > 0 && (
                  <>
                    <Zap className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span className="text-xs font-bold text-indigo-700">+{firstPending.pointGain} pts</span>
                  </>
                )}
                <span className="text-xs font-semibold text-gray-700 truncate">{firstPending.label}</span>
              </div>
              {hasBrackets && !showFill && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                  <PenLine className="w-3 h-3" />
                  {isEN ? "Needs your numbers first" : "Precisa dos seus dados"}
                </p>
              )}
              {firstPending.preview && !showFill && (
                <p className="text-xs text-gray-800 bg-indigo-50 rounded-lg p-2 leading-relaxed border border-indigo-100 mt-1">
                  &ldquo;{firstPending.preview}&rdquo;
                </p>
              )}
              {firstPending.reason && !firstPending.action.type.startsWith("update_") && !hasBrackets && (
                <p className="text-xs text-gray-500 leading-snug mt-1">{firstPending.reason}</p>
              )}
            </div>

            {/* Fill-in panel for brackets */}
            {showFill && hasBrackets && (
              <div className="px-3 pb-3 space-y-2 bg-amber-50/40 border-t border-amber-100">
                <p className="text-xs font-semibold text-amber-700 pt-2">
                  {isEN ? "Fill in your real values:" : "Preencha com seus valores:"}
                </p>
                {placeholders.map(p => (
                  <div key={p}>
                    <label className="text-xs text-gray-600 block mb-0.5">{p}</label>
                    <input
                      type="text"
                      value={fillValues[p] || ""}
                      onChange={e => setFillValues(prev => ({ ...prev, [p]: e.target.value }))}
                      placeholder={isEN ? "Your real value…" : "Seu valor real…"}
                      className="w-full text-xs border border-amber-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                ))}
                {allFilled && (
                  <div className="p-2 bg-white rounded-lg border border-indigo-100">
                    <p className="text-[10px] text-indigo-500 font-semibold uppercase mb-0.5">
                      {isEN ? "Final text:" : "Texto final:"}
                    </p>
                    <p className="text-xs text-gray-800 italic leading-relaxed">&ldquo;{buildFinalText()}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <AnimatePresence mode="wait">
              {acceptedId === firstPending.id ? (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-1.5 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  {isEN ? "Done! Good call." : "Feito!"}
                </motion.div>
              ) : (
                <motion.div key="actions" className="flex border-t border-indigo-100">
                  {hasBrackets && !showFill ? (
                    <button onClick={() => setShowFill(true)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors">
                      <PenLine className="w-3.5 h-3.5" />
                      {isEN ? "Add my numbers" : "Meus dados"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAccept(firstPending.id)}
                      disabled={hasBrackets && !allFilled}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-100 disabled:opacity-40 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                      {firstPending.action.type.startsWith("update_")
                        ? (isEN ? "Yes, replace it" : "Sim, substituir")
                        : (isEN ? "Yes, add this"   : "Sim, adicionar")}
                    </button>
                  )}
                  <div className="w-px bg-indigo-100" />
                  <button onClick={() => message && onDismiss(message.id, firstPending.id)}
                    className="flex-1 flex items-center justify-center py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                    {isEN ? "Not now" : "Agora não"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* More suggestions link */}
        {totalPending > 1 && (
          <button onClick={onOpenChat}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border-t border-indigo-50 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            {isEN ? `${totalPending - 1} more suggestion${totalPending - 1 !== 1 ? "s" : ""} — open chat`
                  : `Mais ${totalPending - 1} sugestão(ões) — abrir chat`}
          </button>
        )}
        {!firstPending && !isThinking && message?.content && (
          <button onClick={onOpenChat}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border-t border-indigo-50 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            {isEN ? "Open full chat" : "Abrir chat completo"}
          </button>
        )}
      </div>
      <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-indigo-100 rotate-45 shadow-sm" />
    </motion.div>
  );
}
