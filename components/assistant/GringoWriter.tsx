"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Eye, ChevronRight, Check } from "lucide-react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { useResumeStore }   from "@/app/store/useResumeStore";
import { AssistantCharacter } from "./AssistantCharacter";
import type { WriterMessage, StoreAction } from "@/app/api/ai/gringo-writer/route";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  locale:     "pt-BR" | "en";
  previewHref: string;  // where to go when resume is done (e.g. /br/curriculo/preview)
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 16): [string, boolean] {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone]           = useState(false);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    function tick() {
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) {
        ref.current = setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    }
    ref.current = setTimeout(tick, 60);
    return () => { if (ref.current) clearTimeout(ref.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return [displayed, done];
}

// ─── Apply store action ───────────────────────────────────────────────────────

function useApplyAction(locale: "pt-BR" | "en") {
  const brStore = useBrResumeStore();
  const usStore = useResumeStore();

  return useCallback((action: StoreAction) => {
    if (locale === "pt-BR") {
      applyBR(action, brStore);
    } else {
      applyUS(action, usStore);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
}

function applyBR(action: StoreAction, store: any) {
  const { type, payload } = action;
  const state = useBrResumeStore.getState();

  switch (type) {
    case "set_personal":
      Object.entries(payload).forEach(([k, v]) => {
        if (v) store.setPersonalField(k, v as string);
      });
      break;

    case "set_summary":
      if (payload.text) store.updateResumo(payload.text);
      break;

    case "add_experience": {
      store.addExperiencia();
      setTimeout(() => {
        const exp = useBrResumeStore.getState().experiencia;
        const last = exp[exp.length - 1];
        if (!last) return;
        if (payload.cargo)     store.updateExperienciaField(last.id, "cargo",      payload.cargo);
        if (payload.empresa)   store.updateExperienciaField(last.id, "empresa",    payload.empresa);
        if (payload.dataInicio) store.updateExperienciaField(last.id, "dataInicio", payload.dataInicio);
        if (payload.dataFim)   store.updateExperienciaField(last.id, "dataFim",    payload.dataFim);
        if (payload.cidade)    store.updateExperienciaField(last.id, "cidade",     payload.cidade);
      }, 60);
      break;
    }

    case "add_responsibility": {
      setTimeout(() => {
        const exp = useBrResumeStore.getState().experiencia;
        const idx = typeof payload.experienceIndex === "number" ? payload.experienceIndex : exp.length - 1;
        const job = exp[idx] || exp[exp.length - 1];
        if (!job || !payload.text) return;
        store.addResponsabilidade(job.id);
        setTimeout(() => {
          const updated = useBrResumeStore.getState().experiencia;
          const updatedJob = updated.find((e: any) => e.id === job.id);
          if (!updatedJob) return;
          store.updateResponsabilidade(job.id, updatedJob.responsabilidades.length - 1, payload.text);
        }, 60);
      }, 80);
      break;
    }

    case "add_skill":
      if (payload.text) {
        store.addHabilidadeTecnica();
        setTimeout(() => {
          const tecnicas = useBrResumeStore.getState().habilidadesTecnicas;
          store.updateHabilidadeTecnica(tecnicas.length - 1, payload.text);
        }, 60);
      }
      break;

    case "add_education": {
      const edu = state.formacao || [];
      if (edu.length === 1 && !edu[0].curso) {
        // Fill the default empty slot
        store.setField("formacao", [{
          instituicao: payload.instituicao || "",
          curso:       payload.curso       || "",
          anoConclusao: payload.anoConclusao || "",
          tipo:        "Superior",
        }]);
      } else {
        store.setField("formacao", [...edu, {
          instituicao: payload.instituicao || "",
          curso:       payload.curso       || "",
          anoConclusao: payload.anoConclusao || "",
          tipo:        "Superior",
        }]);
      }
      break;
    }

    case "add_certification": {
      const certs = state.cursosCertificacoes || [];
      const newCert = { nome: payload.nome || "", instituicao: payload.instituicao || "", ano: payload.ano || "" };
      store.setField("cursosCertificacoes", [...certs, newCert]);
      break;
    }

    default: break;
  }
}

function applyUS(action: StoreAction, store: any) {
  const { type, payload } = action;

  switch (type) {
    case "set_personal":
      if (payload.firstName)  store.updatePersonalInfo("firstName",  payload.firstName);
      if (payload.lastName)   store.updatePersonalInfo("lastName",   payload.lastName);
      if (payload.tradeTitle) store.updatePersonalInfo("tradeTitle", payload.tradeTitle);
      if (payload.phone)      store.updatePersonalInfo("phone",      payload.phone);
      if (payload.city)       store.updatePersonalInfo("city",       payload.city);
      if (payload.state)      store.updatePersonalInfo("state",      payload.state);
      if (payload.linkedin)   store.updatePersonalInfo("linkedin",   payload.linkedin);
      break;

    case "set_summary":
      if (payload.text) store.updateSummary(payload.text);
      break;

    case "add_experience": {
      store.addExperience();
      setTimeout(() => {
        const exp = useResumeStore.getState().experience;
        const last = exp[exp.length - 1];
        if (!last) return;
        if (payload.jobTitle) store.updateExperience(last.id, "jobTitle", payload.jobTitle);
        if (payload.company)  store.updateExperience(last.id, "company",  payload.company);
        if (payload.startDate) store.updateExperience(last.id, "startDate", payload.startDate);
        if (payload.endDate)  store.updateExperience(last.id, "endDate",  payload.endDate);
        if (payload.city)     store.updateExperience(last.id, "city",     payload.city);
      }, 60);
      break;
    }

    case "add_responsibility": {
      setTimeout(() => {
        const exp = useResumeStore.getState().experience;
        const idx = typeof payload.experienceIndex === "number" ? payload.experienceIndex : exp.length - 1;
        const job = exp[idx] || exp[exp.length - 1];
        if (!job || !payload.text) return;
        store.addResponsibility(job.id);
        setTimeout(() => {
          const updated = useResumeStore.getState().experience;
          const updatedJob = updated.find((e: any) => e.id === job.id);
          if (!updatedJob) return;
          store.updateResponsibility(job.id, updatedJob.responsibilities.length - 1, payload.text);
        }, 60);
      }, 80);
      break;
    }

    case "add_skill":
      if (payload.text) store.addSkill(payload.text);
      break;

    case "add_education": {
      const edu = useResumeStore.getState().education;
      if (edu.length === 1 && !edu[0].school) {
        store.updateEducation(0, "school", payload.school || "");
        store.updateEducation(0, "degree", payload.degree || "");
      } else {
        store.addEducation();
        setTimeout(() => {
          const updated = useResumeStore.getState().education;
          store.updateEducation(updated.length - 1, "school", payload.school || "");
          store.updateEducation(updated.length - 1, "degree", payload.degree || "");
        }, 60);
      }
      break;
    }

    case "add_certification":
      if (payload.text) {
        store.addCertification();
        setTimeout(() => {
          const certs = useResumeStore.getState().certifications;
          if (certs.length > 0) store.updateCertification(certs[certs.length - 1].id, payload.text);
        }, 60);
      }
      break;

    default: break;
  }
}

// ─── Single bot message with typewriter ──────────────────────────────────────

function BotMessage({ text, isLatest, charVariant }: {
  text: string; isLatest: boolean; charVariant: "us" | "br";
}) {
  const [displayed, typeDone] = useTypewriter(text, isLatest ? 16 : 0);
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <AssistantCharacter
          mood={isLatest && !typeDone ? "talking" : "happy"}
          variant={charVariant}
          size={40}
        />
      </div>
      <div className="flex-1 bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 text-sm text-gray-800 leading-relaxed">
        {displayed}
        {isLatest && !typeDone && (
          <span className="inline-block w-1 h-4 bg-indigo-400 ml-0.5 animate-pulse align-text-bottom" />
        )}
      </div>
    </div>
  );
}

// ─── Progress indicator ───────────────────────────────────────────────────────

const STEPS_PT = ["pessoal", "experiência", "habilidades", "formação", "certificações", "resumo"];
const STEPS_EN = ["personal", "experience",  "skills",     "education","certifications", "summary"];
const STEP_MAP: Record<string, number> = {
  personal: 0, experience: 1, skills: 2, education: 3, certifications: 4, summary: 5,
};

function ProgressBar({ step, locale }: { step: string; locale: string }) {
  const isEN    = locale !== "pt-BR";
  const labels  = isEN ? STEPS_EN : STEPS_PT;
  const current = STEP_MAP[step] ?? 0;

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-gray-100 overflow-x-auto">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-1.5 flex-shrink-0">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold transition-all ${
            i < current  ? "bg-emerald-100 text-emerald-700" :
            i === current ? "bg-indigo-600 text-white shadow-sm" :
                            "bg-gray-100 text-gray-400"
          }`}>
            {i < current && <Check className="w-3 h-3" />}
            {label}
          </div>
          {i < labels.length - 1 && (
            <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RingoWriter({ locale, previewHref }: Props) {
  const router     = useRouter();
  const isEN       = locale !== "pt-BR";
  const charName   = isEN ? "CV-1" : "Ringo";
  const charVariant: "us" | "br" = isEN ? "us" : "br";

  const [history,    setHistory]    = useState<WriterMessage[]>([]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [currentStep, setCurrentStep] = useState("personal");
  const [isDone,     setIsDone]     = useState(false);
  const [started,    setStarted]    = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const applyAction = useApplyAction(locale);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  // Start conversation automatically
  useEffect(() => {
    if (!started) {
      setStarted(true);
      callWriter([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function callWriter(msgs: WriterMessage[], userMsg?: string) {
    const newHistory = userMsg
      ? [...msgs, { role: "user" as const, content: userMsg }]
      : msgs;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/gringo-writer", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ history: newHistory, locale }),
      });
      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      // Apply all store actions
      if (data.actions?.length) {
        for (const action of data.actions) {
          applyAction(action);
          await new Promise(r => setTimeout(r, 80)); // slight delay between writes
        }
      }

      setCurrentStep(data.step || "personal");
      setIsDone(data.done || false);

      const updated: WriterMessage[] = [
        ...newHistory,
        { role: "assistant", content: data.message },
      ];
      setHistory(updated);

      if (data.done) {
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    } catch {
      setHistory(prev => [...prev, {
        role:    "assistant",
        content: isEN
          ? "Sorry, I hit a snag. Let me try again — just click Send or type your message."
          : "Ops, tive um problema. Tente de novo — só clique em Enviar.",
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    callWriter(history, text);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <AssistantCharacter
            mood={loading ? "thinking" : isDone ? "happy" : "talking"}
            variant={charVariant}
            size={44}
          />
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">
              {charName}™
              <span className="ml-2 text-[10px] font-medium text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                {isEN ? "AI Resume Writer" : "Escritor de Currículo IA"}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isDone
                ? (isEN ? "Your resume is ready!" : "Seu currículo está pronto!")
                : (isEN ? "Building your resume…" : "Montando seu currículo…")}
            </p>
          </div>
        </div>

        {isDone && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => router.push(previewHref)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Eye className="w-4 h-4" />
            {isEN ? "Preview & Download" : "Ver e Baixar"}
          </motion.button>
        )}
      </div>

      {/* ── Progress bar ── */}
      <ProgressBar step={currentStep} locale={locale} />

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {history.map((msg, i) =>
          msg.role === "assistant" ? (
            <BotMessage
              key={i}
              text={msg.content}
              isLatest={i === history.length - 1 || (i === history.length - 2 && history[history.length - 1].role === "user")}
              charVariant={charVariant}
            />
          ) : (
            <div key={i} className="flex justify-end">
              <div className="max-w-[75%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm">
                {msg.content}
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex items-center gap-3">
            <AssistantCharacter mood="thinking" variant={charVariant} size={40} />
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex gap-1 items-center">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 bg-indigo-400 rounded-full"
                  style={{ animation: `bounce 1s ease-in-out ${i*0.15}s infinite` }} />
              ))}
              <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
            </div>
          </div>
        )}

        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <AssistantCharacter mood="happy" variant={charVariant} size={80} />
            <div className="text-center">
              <p className="font-bold text-gray-900 text-lg">
                {isEN ? "Resume complete!" : "Currículo pronto!"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isEN
                  ? "Preview it below, then download securely."
                  : "Visualize abaixo, depois baixe com segurança."}
              </p>
            </div>
            <button
              onClick={() => router.push(previewHref)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 text-sm"
            >
              <Eye className="w-4 h-4" />
              {isEN ? "Preview & Download →" : "Ver Currículo e Baixar →"}
            </button>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      {!isDone && (
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              placeholder={isEN ? "Type your answer…" : "Digite sua resposta…"}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:opacity-50 transition-all placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-2">
            {isEN
              ? "CV-1 writes your resume as you answer. Preview before you pay."
              : "Gringo escreve seu currículo enquanto você responde. Veja antes de pagar."}
          </p>
        </div>
      )}
    </div>
  );
}
