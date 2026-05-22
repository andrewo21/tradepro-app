"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Eye, ChevronRight, Check } from "lucide-react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { useResumeStore }   from "@/app/store/useResumeStore";
import GringoCharacter from "./GringoCharacter";
import type { GringoMood } from "./GringoCharacter";
import CV1Character from "./CV1Character";
import type { CV1Mood } from "./CV1Character";
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

function useApplyAction(locale: "pt-BR" | "en", setPendingSummary: (s: string | null) => void) {
  const brStore = useBrResumeStore();
  const usStore = useResumeStore();

  return useCallback((action: StoreAction) => {
    if (locale === "pt-BR") {
      applyBR(action, brStore);
    } else {
      applyUS(action, usStore, setPendingSummary);
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

function applyUS(action: StoreAction, store: any, setPendingSummary?: (s: string | null) => void) {
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
      // Show as pending — user must approve before it goes into the resume
      if (payload.text && setPendingSummary) {
        setPendingSummary(payload.text);
      }
      break;

    case "add_experience": {
      const expState = useResumeStore.getState().experience;
      const norm = (s: string) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

      // DEDUP: if this company+title already exists, UPDATE it — never create a duplicate
      const existing = expState.find((e: any) =>
        norm(e.company) === norm(payload.company) &&
        (norm(e.jobTitle) === norm(payload.jobTitle) || !e.jobTitle || !payload.jobTitle)
      );

      const targetId = existing?.id || null;

      if (!targetId) {
        // Genuinely new job — add it
        store.addExperience();
      }

      setTimeout(() => {
        const fresh = useResumeStore.getState().experience;
        const job = targetId
          ? fresh.find((e: any) => e.id === targetId)
          : fresh[fresh.length - 1];
        if (!job) return;

        if (payload.jobTitle)  store.updateExperience(job.id, "jobTitle",  payload.jobTitle);
        if (payload.company)   store.updateExperience(job.id, "company",   payload.company);
        if (payload.startDate) store.updateExperience(job.id, "startDate", payload.startDate);
        if (payload.endDate)   store.updateExperience(job.id, "endDate",   payload.endDate);
        if (payload.city)      store.updateExperience(job.id, "city",      payload.city);

        // Add bullets — deduplicated: skip any that already exist on this job
        const bullets: string[] = Array.isArray(payload.responsibilities) ? payload.responsibilities : [];
        const existingBullets = [
          ...(job.responsibilities || []).map((b: any) => (typeof b === "string" ? b : b.text || "").toLowerCase().slice(0, 30)),
          ...(job.achievements     || []).map((b: any) => (typeof b === "string" ? b : b.text || "").toLowerCase().slice(0, 30)),
        ];

        const newBullets = bullets.filter((text: string) =>
          text?.trim() && !existingBullets.some(existing => text.toLowerCase().startsWith(existing.slice(0, 20)))
        );

        const emptySlot = job.responsibilities?.findIndex((r: any) => !(typeof r === "string" ? r : r.text)?.trim());
        newBullets.forEach((text: string, i: number) => {
          if (i === 0 && emptySlot !== -1) {
            store.updateResponsibility(job.id, emptySlot ?? 0, text);
          } else {
            store.addResponsibility(job.id);
            setTimeout(() => {
              const u = useResumeStore.getState().experience;
              const j = u.find((e: any) => e.id === job.id);
              if (j) store.updateResponsibility(job.id, j.responsibilities.length - 1, text);
            }, 60 * (i + 1));
          }
        });
      }, 80);
      break;
    }

    case "add_responsibility": break; // disabled — use add_experience with responsibilities[]

    case "add_skill": {
      if (!payload.text?.trim()) break;
      const existingSkills = useResumeStore.getState().skills;
      const alreadyExists = existingSkills.some((s: any) =>
        (typeof s === "string" ? s : s.text || "").toLowerCase().trim() === payload.text.toLowerCase().trim()
      );
      if (!alreadyExists) store.addSkill(payload.text);
      break;
    }

    case "add_education": {
      const edu = useResumeStore.getState().education;
      const norm = (s: string) => (s || "").toLowerCase().trim();
      // Dedup: skip if same school+degree already exists
      const eduExists = edu.some((e: any) =>
        norm(e.school) === norm(payload.school) && norm(e.degree) === norm(payload.degree)
      );
      if (eduExists) break;

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
        {charVariant === "us"
          ? <CV1Character mood={(isLatest && !typeDone ? "talking" : "idle") as CV1Mood} size={110} />
          : <GringoCharacter mood={isLatest && !typeDone ? "talking" : "idle"} size={110} />}
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

export default function GringoWriter({ locale, previewHref }: Props) {
  const router     = useRouter();
  const isEN       = locale !== "pt-BR";
  const charName   = isEN ? "CV-1" : "Gringo";
  const charVariant: "us" | "br" = isEN ? "us" : "br";

  const [history,    setHistory]    = useState<WriterMessage[]>([]);
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [pendingSummary, setPendingSummary] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState("personal");
  const [isDone,     setIsDone]     = useState(false);
  const [started,    setStarted]    = useState(false);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const applyAction = useApplyAction(locale, setPendingSummary);
  const callerLock  = useRef(false); // synchronous lock — prevents concurrent callWriter invocations

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  // Start conversation automatically — clear existing resume data first.
  // This is a "build from scratch" flow, not an "add to existing" flow.
  useEffect(() => {
    if (!started) {
      setStarted(true);
      // Wipe the store so painter + PM data never mix.
      // Preserve the selected template the user chose.
      if (locale === "en") {
        const savedTemplate = useResumeStore.getState().selectedTemplate;
        useResumeStore.getState().clearAll();
        if (savedTemplate) useResumeStore.getState().setSelectedTemplate(savedTemplate);
      } else {
        useBrResumeStore.getState().clearAll();
      }
      callWriter([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function callWriter(msgs: WriterMessage[], userMsg?: string) {
    // Synchronous guard — if a call is already in flight, drop this one silently.
    // React state (loading) updates asynchronously so it can't reliably block a second call.
    if (callerLock.current) { console.warn("[writer] blocked concurrent call"); return; }
    callerLock.current = true;

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

      // Apply store actions — each wrapped individually so a single
      // failed write never aborts the conversation or shows an error.
      if (data.actions?.length) {
        for (const action of data.actions) {
          try { applyAction(action); } catch (e) { console.warn("[writer action]", action.type, e); }
          await new Promise(r => setTimeout(r, 80));
        }
      }

      setCurrentStep(data.step || "personal");
      setIsDone(data.done || false);

      // Only append assistant message if it has content — empty strings in
      // history confuse the model on subsequent calls and can cause errors.
      const updated: WriterMessage[] = data.message?.trim()
        ? [...newHistory, { role: "assistant", content: data.message }]
        : newHistory;
      setHistory(updated);

      if (data.done) {
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    } catch (err) {
      // Log the real error so we can identify the root cause in the console
      console.error("[writer] callWriter failed:", err);
      setHistory([
        ...msgs,
        {
          role:    "assistant" as const,
          content: isEN
            ? "Connection issue — please try again."
            : "Problema de conexão — tente novamente.",
        },
      ]);
    } finally {
      callerLock.current = false; // release lock before setLoading so next call can proceed
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
          {charVariant === "us"
            ? <CV1Character mood={(loading ? "thinking" : isDone ? "celebrate" : "talking") as CV1Mood} size={140} />
            : <GringoCharacter mood={loading ? "thinking" : isDone ? "celebrate" : "talking"} size={140} />}
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
{charVariant === "us" ? <CV1Character mood="thinking" size={110} /> : <GringoCharacter mood="thinking" size={110} />}
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
{charVariant === "us" ? <CV1Character mood="celebrate" size={160} /> : <GringoCharacter mood="celebrate" size={160} />}
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

      {/* ── Summary approval card — shown before input when summary is pending ── */}
      {pendingSummary && !isDone && (
        <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-200">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">
            {isEN ? "✦ CV-1 wrote your summary — approve or edit before it goes in:" : "✦ Resumo escrito — aprove ou edite antes de salvar:"}
          </p>
          <p className="text-sm text-gray-800 bg-white border border-indigo-200 rounded-xl p-3 leading-relaxed mb-3">
            {pendingSummary}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (locale === "en") {
                  useResumeStore.getState().updateSummary(pendingSummary);
                } else {
                  useBrResumeStore.getState().updateResumo(pendingSummary);
                }
                setPendingSummary(null);
              }}
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              {isEN ? "✓ Use this summary" : "✓ Usar este resumo"}
            </button>
            <button
              onClick={() => {
                setInput(pendingSummary);
                setPendingSummary(null);
              }}
              className="px-4 py-2 bg-white border border-indigo-300 text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
            >
              {isEN ? "Edit" : "Editar"}
            </button>
          </div>
        </div>
      )}

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
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:opacity-50 transition-all placeholder:text-gray-400 shadow-sm"
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
