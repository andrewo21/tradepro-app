"use client";

import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp, Zap } from "lucide-react";
import type { AssistantSuggestion } from "@/app/store/useAssistantStore";

interface Props {
  msgId: string;
  suggestion: AssistantSuggestion;
  onAccept: (msgId: string, suggId: string) => void;
  onDismiss: (msgId: string, suggId: string) => void;
  locale?: string;
}

export function SuggestionCard({ msgId, suggestion, onAccept, onDismiss, locale }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isEN = locale !== "pt-BR";

  if (suggestion.dismissed) return null;

  if (suggestion.accepted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
        <Check className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">
          {isEN ? "Added!" : "Adicionado!"}{" "}
          <span className="font-normal opacity-75">
            +{suggestion.pointGain} {isEN ? "pts" : "pts"}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="border border-indigo-100 bg-white rounded-xl overflow-hidden shadow-sm">
      {/* Header row */}
      <div className="flex items-start gap-2 px-3 py-2.5">
        {/* Score badge */}
        <div className="flex-shrink-0 flex items-center gap-0.5 bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5 text-xs font-bold mt-0.5">
          <Zap className="w-3 h-3" />
          +{suggestion.pointGain}
        </div>

        {/* Label + expand toggle */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-tight">
            {suggestion.label}
          </p>
          {suggestion.reason && (
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{suggestion.reason}</p>
          )}
        </div>

        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Preview text */}
      {expanded && suggestion.preview && (
        <div className="px-3 pb-2">
          <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 leading-relaxed italic border border-gray-100">
            &ldquo;{suggestion.preview}&rdquo;
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={() => onAccept(msgId, suggestion.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          {isEN ? "Add it" : "Adicionar"}
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => onDismiss(msgId, suggestion.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          {isEN ? "Skip" : "Pular"}
        </button>
      </div>
    </div>
  );
}
