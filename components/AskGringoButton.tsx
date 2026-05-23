"use client";

import { useState, useCallback } from "react";
import { MessageCircle, X } from "lucide-react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { useAssistantStore, type AssistantSuggestion } from "@/app/store/useAssistantStore";
import { usePathname } from "next/navigation";
import { pathToStep } from "@/lib/assistant/step_context";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import GringoCharacter from "@/components/assistant/GringoCharacter";
import { mapBrDataToUsFormat } from "@/lib/pdfTemplates";

function useApplyBrSuggestion() {
  const store = useBrResumeStore();
  return useCallback((suggestion: AssistantSuggestion) => {
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
  }, [store]);
}

export default function AskGringoButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const step = pathToStep(pathname);
  const brStore = useBrResumeStore();
  const apply = useApplyBrSuggestion();

  const {
    isThinking, messages, setThinking,
    addMessage, addUserMessage, acceptSuggestion, dismissSuggestion,
    setLastAnalyzed, clearNewSuggestions,
  } = useAssistantStore();

  const handleUserMessage = useCallback(async (text: string) => {
    addUserMessage(text);
    setThinking(true);
    try {
      const { buildStepPayload, resumeHash } = await import("@/lib/assistant/step_context");
      const snapshot = mapBrDataToUsFormat(brStore);
      const payload = buildStepPayload(step, snapshot as any, "pt-BR");
      const res = await fetch("/api/ai/assistant/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, userMessage: text }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.message || (data.suggestions?.length ?? 0) > 0) {
        addMessage({
          id: `gringo-${Date.now()}`,
          role: "assistant",
          content: data.message || "",
          suggestions: data.suggestions || [],
          timestamp: Date.now(),
        });
        setLastAnalyzed(step, resumeHash(snapshot as any));
      }
    } catch { /* silent */ }
    finally { setThinking(false); }
  }, [step, brStore, addMessage, addUserMessage, setThinking, setLastAnalyzed]);

  function handleAccept(msgId: string, suggId: string, finalText?: string) {
    const msg = messages.find((m) => m.id === msgId);
    const sugg = msg?.suggestions?.find((s) => s.id === suggId);
    if (!sugg) return;
    apply(finalText ? { ...sugg, action: { ...sugg.action, value: finalText }, preview: finalText } : sugg);
    acceptSuggestion(msgId, suggId);
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(o => !o); clearNewSuggestions(); }}
        className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 transition-colors shadow-md"
      >
        <GringoCharacter mood={isThinking ? "thinking" : "idle"} size={36} />
        Perguntar ao Gringo
        <MessageCircle className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-green-800 text-white">
              <div className="flex items-center gap-2">
                <GringoCharacter mood={isThinking ? "thinking" : "talking"} size={44} />
                <div>
                  <p className="font-bold text-sm leading-none">Gringo™</p>
                  <p className="text-xs text-green-200 mt-0.5">Assistente de Currículo IA</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-green-900 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <AssistantChat
              messages={messages}
              isThinking={isThinking}
              locale="pt-BR"
              onClose={() => setOpen(false)}
              onAccept={handleAccept}
              onDismiss={dismissSuggestion}
              onSendMessage={handleUserMessage}
              onRefresh={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
