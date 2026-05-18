"use client";

import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp, Zap, PenLine } from "lucide-react";
import type { AssistantSuggestion } from "@/app/store/useAssistantStore";

interface Props {
  msgId:      string;
  suggestion: AssistantSuggestion;
  onAccept:   (msgId: string, suggId: string, finalText?: string) => void;
  onDismiss:  (msgId: string, suggId: string) => void;
  locale?:    string;
}

// Extract bracket placeholders like [X], [team size], [$amount]
function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\[[^\]]+\]/g) || [];
  return [...new Set(matches)]; // deduplicate
}

export function SuggestionCard({ msgId, suggestion, onAccept, onDismiss, locale }: Props) {
  const isReplacement = suggestion.action.type.startsWith("update_");
  const [expanded, setExpanded]     = useState(isReplacement);
  const [fillValues, setFillValues] = useState<Record<string, string>>({});
  const [showFill, setShowFill]     = useState(false);
  const isEN = locale !== "pt-BR";

  const placeholders = extractPlaceholders(suggestion.preview || "");
  const hasBrackets  = placeholders.length > 0;

  // Build final text with placeholders replaced
  function buildFinalText(): string {
    let text = suggestion.preview || "";
    for (const p of placeholders) {
      const key = p; // e.g. "[X%]"
      const val = fillValues[key]?.trim();
      if (val) text = text.replace(p, val);
    }
    return text;
  }

  const allFilled = placeholders.every(p => fillValues[p]?.trim());

  if (suggestion.dismissed) return null;

  if (suggestion.accepted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
        <Check className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">{isEN ? "Done! Good call." : "Feito! Boa escolha."}</span>
      </div>
    );
  }

  return (
    <div className="border border-indigo-100 bg-white rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-2 px-3 py-2.5">
        {suggestion.pointGain > 0 && (
          <div className="flex-shrink-0 flex items-center gap-0.5 bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5 text-xs font-bold mt-0.5">
            <Zap className="w-3 h-3" />
            +{suggestion.pointGain}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{suggestion.label}</p>
          {suggestion.reason && !hasBrackets && (
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{suggestion.reason}</p>
          )}
          {hasBrackets && !showFill && (
            <p className="text-xs text-amber-600 mt-0.5 leading-snug flex items-center gap-1">
              <PenLine className="w-3 h-3" />
              {isEN ? "Needs your numbers before inserting" : "Precisa dos seus dados antes de inserir"}
            </p>
          )}
        </div>
        <button onClick={() => setExpanded(p => !p)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Preview */}
      {expanded && suggestion.preview && (
        <div className="px-3 pb-2">
          <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide mb-1 px-1">
            {isReplacement ? (isEN ? "Proposed replacement:" : "Substituição proposta:") : (isEN ? "Preview:" : "Prévia:")}
          </p>
          <p className="text-sm text-gray-800 bg-indigo-50 rounded-lg p-2.5 leading-relaxed border border-indigo-100">
            &ldquo;{suggestion.preview}&rdquo;
          </p>
        </div>
      )}

      {/* Bracket fill-in panel */}
      {showFill && hasBrackets && (
        <div className="px-3 pb-3 space-y-2 border-t border-amber-100 bg-amber-50/40">
          <p className="text-xs font-semibold text-amber-700 pt-2">
            {isEN ? "Fill in your real values:" : "Preencha com seus valores reais:"}
          </p>
          {placeholders.map(p => (
            <div key={p}>
              <label className="text-xs text-gray-600 mb-0.5 block">{p}</label>
              <input
                type="text"
                value={fillValues[p] || ""}
                onChange={e => setFillValues(prev => ({ ...prev, [p]: e.target.value }))}
                placeholder={isEN ? "Enter the real value…" : "Digite o valor real…"}
                className="w-full text-sm border border-amber-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
              />
            </div>
          ))}
          {allFilled && (
            <div className="mt-1 p-2 bg-white rounded-lg border border-indigo-100">
              <p className="text-[10px] text-indigo-500 font-semibold uppercase mb-1">
                {isEN ? "Final text:" : "Texto final:"}
              </p>
              <p className="text-xs text-gray-800 leading-relaxed italic">&ldquo;{buildFinalText()}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex border-t border-gray-100">
        {hasBrackets && !showFill ? (
          // Step 1: prompt to fill in values
          <button
            onClick={() => { setExpanded(true); setShowFill(true); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            {isEN ? "Add my numbers →" : "Adicionar meus dados →"}
          </button>
        ) : (
          // Accept — with filled values if applicable
          <button
            onClick={() => onAccept(msgId, suggestion.id, hasBrackets && allFilled ? buildFinalText() : undefined)}
            disabled={hasBrackets && !allFilled}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            {isReplacement
              ? (isEN ? "Yes, replace it" : "Sim, substituir")
              : (isEN ? "Yes, add this"   : "Sim, adicionar")}
          </button>
        )}
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => onDismiss(msgId, suggestion.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          {isEN ? "Not now" : "Agora não"}
        </button>
      </div>
    </div>
  );
}
