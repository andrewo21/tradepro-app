"use client";

import { useState, useCallback } from "react";
import { MessageCircle, X } from "lucide-react";
import { useResumeStore } from "@/app/store/useResumeStore";
import { useAssistantStore, type AssistantSuggestion } from "@/app/store/useAssistantStore";
import { usePathname } from "next/navigation";
import { pathToStep } from "@/lib/assistant/step_context";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import CV1Character from "@/components/assistant/CV1Character";

function useApplySuggestion() {
  const store = useResumeStore();
  return useCallback((suggestion: AssistantSuggestion) => {
    const { action } = suggestion;
    const experience: any[] = store.experience || [];
    switch (action.type) {
      case "add_responsibility": {
        const job = experience.find((e: any) => e.id === action.experienceId) || experience[experience.length - 1];
        if (!job) break;
        store.addResponsibility(job.id);
        setTimeout(() => {
          const updated = useResumeStore.getState().experience;
          const j = updated.find((e: any) => e.id === job.id);
          if (j) store.updateResponsibility(job.id, j.responsibilities.length - 1, action.value);
        }, 60);
        break;
      }
      case "add_skill": store.addSkill(action.value); break;
      case "update_summary": store.updateSummary(action.value); break;
      default: break;
    }
  }, [store]);
}

export default function AskCV1Button() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const step = pathToStep(pathname);
  const resumeStore = useResumeStore();
  const apply = useApplySuggestion();

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
      const snapshot = {
        personalInfo: resumeStore.personalInfo,
        summary: resumeStore.summary,
        skills: resumeStore.skills,
        experience: resumeStore.experience,
        education: resumeStore.education,
        certifications: resumeStore.certifications,
      };
      const payload = buildStepPayload(step, snapshot as any, "en");
      const res = await fetch("/api/ai/assistant/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, userMessage: text }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.message || (data.suggestions?.length ?? 0) > 0) {
        addMessage({
          id: `cv1-${Date.now()}`,
          role: "assistant",
          content: data.message || "",
          suggestions: data.suggestions || [],
          timestamp: Date.now(),
        });
        setLastAnalyzed(step, resumeHash(snapshot as any));
      }
    } catch { /* silent */ }
    finally { setThinking(false); }
  }, [step, resumeStore, addMessage, addUserMessage, setThinking, setLastAnalyzed]);

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
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
      >
        <CV1Character mood={isThinking ? "thinking" : "idle"} size={36} />
        Ask CV-1
        <MessageCircle className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <CV1Character mood={isThinking ? "thinking" : "talking"} size={44} />
                <div>
                  <p className="font-bold text-sm leading-none">CV-1™</p>
                  <p className="text-xs text-indigo-200 mt-0.5">AI Resume Coach</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-indigo-700 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <AssistantChat
              messages={messages}
              isThinking={isThinking}
              locale="en"
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
