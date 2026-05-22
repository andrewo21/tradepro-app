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
import { computeLiveAtsScore, atsLabelColor } from "@/lib/ats/live/liveAtsScore";
import { mapBrDataToUsFormat } from "@/lib/pdfTemplates";

// Maps BR store shape to the exact shape computeLiveAtsScore expects
function mapBrStoreForAts(s: any) {
  return {
    personalInfo: {
      firstName:  s.personalInfo?.nome       || "",
      lastName:   s.personalInfo?.sobrenome  || "",
      tradeTitle: s.personalInfo?.tituloProfissional || "",
      phone:      s.personalInfo?.telefone   || s.personalInfo?.whatsapp || "",
      email:      s.personalInfo?.email      || "",
      city:       s.personalInfo?.cidade     || "",
      linkedin:   s.personalInfo?.linkedin   || "",
    },
    summary: s.resumoProfissional || "",
    skills: [...(s.habilidadesTecnicas || s.habilidades || [])].map((h: any) => ({ text: h.text || h })),
    experience: (s.experiencia || []).map((e: any) => ({
      jobTitle: e.cargo || "", company: e.empresa || "",
      startDate: e.dataInicio || "", endDate: e.dataFim || "",
      responsibilities: (e.responsabilidades || []).map((r: any) => ({ text: r.text || r })),
      achievements: [],
    })),
    education: (s.formacao || []).map((f: any) => ({ school: f.instituicao || "", degree: f.curso || "" })),
    certifications: (s.cursosCertificacoes || []).filter((c: any) => c.nome).map((c: any) => ({ id: c.nome, text: c.nome })),
  };
}

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

function useApplyAction(locale: "pt-BR" | "en", setPendingSummary: (text: string) => void) {
  const brStore = useBrResumeStore();
  const usStore = useResumeStore();

  return useCallback((action: StoreAction) => {
    if (locale === "pt-BR") {
      applyBR(action, brStore, setPendingSummary);
    } else {
      applyUS(action, usStore, setPendingSummary);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
}

function applyBR(action: StoreAction, store: any, setPendingSummary: (text: string) => void) {
  const { type, payload } = action;
  const state = useBrResumeStore.getState();

  switch (type) {
    case "set_personal":
      Object.entries(payload).forEach(([k, v]) => {
        if (v) store.setPersonalField(k, v as string);
      });
      break;

    case "set_summary":
      if (payload.text) setPendingSummary(payload.text);
      break;

    case "add_experience": {
      const currentExp = useBrResumeStore.getState().experiencia || [];
      const singleEmptyBR =
        currentExp.length === 1 &&
        !currentExp[0].cargo?.trim() &&
        !currentExp[0].empresa?.trim();
      if (!singleEmptyBR) store.addExperiencia();
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
      const normEdu = (s: string) => (s || "").toLowerCase().trim();
      const eduExists = edu.some((f: any) =>
        normEdu(f.instituicao) === normEdu(payload.instituicao || "") &&
        normEdu(f.curso) === normEdu(payload.curso || "")
      );
      if (eduExists) break;
      if (edu.length === 1 && !edu[0].curso) {
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
      const norm = (s: string) => (s || "").toLowerCase().trim();
      const alreadyExists = certs.some((c: any) => norm(c.nome) === norm(payload.nome || ""));
      if (!alreadyExists) {
        store.setField("cursosCertificacoes", [...certs, { nome: payload.nome || "", instituicao: payload.instituicao || "", ano: payload.ano || "" }]);
      }
      break;
    }

    default: break;
  }
}

function applyUS(action: StoreAction, store: any, setPendingSummary: (text: string) => void) {
  const { type, payload } = action;

  switch (type) {
    case "set_personal": {
      // Always write via getState() to avoid any stale closure issues.
      // Also handle "name" as a single field (AI sometimes sends full name combined).
      const pi = (field: string, value: any) => {
        if (!value) return;
        useResumeStore.getState().updatePersonalInfo(field, String(value).trim());
      };
      // Name — accept both split fields and combined "name" field
      const rawName: string = payload.name || "";
      const firstName = payload.firstName || (rawName ? rawName.split(" ")[0] : "");
      const lastName  = payload.lastName  || (rawName ? rawName.split(" ").slice(1).join(" ") : "");
      pi("firstName",  firstName);
      pi("lastName",   lastName);
      pi("tradeTitle", payload.tradeTitle || payload.jobTitle || payload.title);
      pi("email",      payload.email);
      pi("phone",      payload.phone);
      pi("city",       payload.city);
      pi("state",      payload.state);
      pi("linkedin",   payload.linkedin);
      break;
    }

    case "set_summary":
      // Show as pending — user must approve before it goes into the resume
      if (payload.text) {
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
        // Reuse the single empty initial slot rather than adding a second one
        const singleEmpty =
          expState.length === 1 &&
          !expState[0].jobTitle?.trim() &&
          !expState[0].company?.trim();
        if (!singleEmpty) store.addExperience();
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

        // Add bullets — deduplicated, then added sequentially to avoid race conditions
        const bullets: string[] = Array.isArray(payload.responsibilities) ? payload.responsibilities : [];
        const existingBullets = [
          ...(job.responsibilities || []).map((b: any) => (typeof b === "string" ? b : b.text || "").toLowerCase().slice(0, 30)),
          ...(job.achievements     || []).map((b: any) => (typeof b === "string" ? b : b.text || "").toLowerCase().slice(0, 30)),
        ];

        const newBullets = bullets.filter((text: string) =>
          text?.trim() && !existingBullets.some(eb => text.toLowerCase().startsWith(eb.slice(0, 20)))
        );

        // Fill the existing empty slot with the first bullet, then add the rest sequentially
        const emptySlot = job.responsibilities?.findIndex((r: any) => !(typeof r === "string" ? r : r.text)?.trim());
        let startIdx = 0;
        if (emptySlot !== -1 && newBullets.length > 0) {
          store.updateResponsibility(job.id, emptySlot ?? 0, newBullets[0]);
          startIdx = 1;
        }
        // Sequential chain — each bullet waits for the previous to land before adding the next
        const remaining = newBullets.slice(startIdx);
        const addNextBullet = (idx: number) => {
          if (idx >= remaining.length) return;
          store.addResponsibility(job.id);
          setTimeout(() => {
            const u = useResumeStore.getState().experience;
            const j = u.find((e: any) => e.id === job.id);
            if (j) {
              store.updateResponsibility(job.id, j.responsibilities.length - 1, remaining[idx]);
              setTimeout(() => addNextBullet(idx + 1), 80);
            }
          }, 80);
        };
        addNextBullet(0);
      }, 80);
      break;
    }

    case "add_responsibility": break; // disabled — use add_experience with responsibilities[]

    case "add_skill": {
      if (!payload.text?.trim()) break;
      const normSkill = (t: string) => t.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
      const existingSkills = useResumeStore.getState().skills;
      const alreadyExists = existingSkills.some((s: any) =>
        normSkill(typeof s === "string" ? s : s.text || "") === normSkill(payload.text)
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
  const callerLock  = useRef(false);

  // Live score — reads store reactively so it updates as Gringo fills in data
  const usStoreSnap = useResumeStore();
  const brStoreSnap = useBrResumeStore();
  let liveScore: ReturnType<typeof computeLiveAtsScore> | null = null;
  try {
    liveScore = computeLiveAtsScore(isEN ? usStoreSnap : mapBrStoreForAts(brStoreSnap));
  } catch { /* silent */ }
  const scoreColor = liveScore ? atsLabelColor(liveScore.label) : "#9ca3af";

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  // PT-BR: auto-navigate to resumo when done and summary has been confirmed
  useEffect(() => {
    if (!isEN && isDone && pendingSummary === null && started) {
      const t = setTimeout(() => router.push("/br/curriculo/resumo"), 1000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, pendingSummary, isEN, started]);

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
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-400">
                {isDone
                  ? (isEN ? "Your resume is ready!" : "Seu currículo está pronto!")
                  : (isEN ? "Building your resume…" : "Montando seu currículo…")}
              </p>
              {liveScore && liveScore.score > 0 && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: scoreColor, borderColor: `${scoreColor}40`, backgroundColor: `${scoreColor}12` }}
                >
                  {isEN ? "ATS" : "Força"} {liveScore.score}/75
                </span>
              )}
            </div>
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

        {isDone && isEN && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-6"
          >
            <CV1Character mood="celebrate" size={160} />
            <div className="text-center">
              <p className="font-bold text-gray-900 text-lg">Resume complete!</p>
              <p className="text-sm text-gray-500 mt-1">Preview it below, then download securely.</p>
            </div>
            <button
              onClick={() => router.push(previewHref)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 text-sm"
            >
              <Eye className="w-4 h-4" />
              Preview &amp; Download →
            </button>
          </motion.div>
        )}

        {isDone && !isEN && !pendingSummary && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 py-4 text-center"
          >
            <GringoCharacter mood="celebrate" size={100} />
            <p className="text-sm text-gray-500">Redirecionando para o resumo…</p>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Summary approval card ── */}
      {pendingSummary && (
        <div className={`px-4 py-3 border-t ${isEN ? "bg-indigo-50 border-indigo-200" : "bg-green-50 border-green-200"}`}>
          <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${isEN ? "text-indigo-700" : "text-green-800"}`}>
            {isEN ? "✦ CV-1 wrote your summary — approve or edit before it goes in:" : "✦ Gringo escreveu seu resumo — confira antes de salvar:"}
          </p>
          <p className="text-sm text-gray-800 bg-white border border-green-200 rounded-xl p-3 leading-relaxed mb-3">
            {pendingSummary}
          </p>

          {/* PT-BR only: Gupy ATS score */}
          {!isEN && (() => {
            try {
              const brState = useBrResumeStore.getState();
              const forScore = mapBrDataToUsFormat({ ...brState, resumoProfissional: pendingSummary });
              const ats = computeLiveAtsScore(forScore);
              const color = atsLabelColor(ats.label);
              const ptLabel = { Strong: "Forte", Good: "Bom", Building: "Em construção", Weak: "Fraco", "Not Started": "Não iniciado" }[ats.label] || ats.label;
              return (
                <div className="flex items-center gap-3 bg-white border border-green-100 rounded-xl px-3 py-2 mb-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="text-2xl font-black" style={{ color }}>{ats.score}</span>
                    <span className="text-[10px] font-bold" style={{ color }}>{ptLabel}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-700">Pontuação ATS do seu currículo</p>
                    <p className="text-[11px] text-neutral-500">Baseada em completude e qualidade do conteúdo</p>
                  </div>
                </div>
              );
            } catch { return null; }
          })()}

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (locale === "en") {
                  useResumeStore.getState().updateSummary(pendingSummary);
                  setPendingSummary(null);
                  if (isDone) router.push(previewHref);
                } else {
                  useBrResumeStore.getState().updateResumo(pendingSummary);
                  setPendingSummary(null);
                  // BR auto-navigates via useEffect when isDone && !pendingSummary
                }
              }}
              className={`flex-1 py-2 text-white text-sm font-bold rounded-xl transition-colors ${isEN ? "bg-indigo-600 hover:bg-indigo-700" : "bg-green-700 hover:bg-green-800"}`}
            >
              {isEN ? "✓ Use this summary" : "✓ Está tudo certo!"}
            </button>
            <button
              onClick={() => {
                setInput(pendingSummary);
                setPendingSummary(null);
              }}
              className={`px-4 py-2 bg-white text-sm font-semibold rounded-xl transition-colors ${isEN ? "border border-indigo-300 text-indigo-700 hover:bg-indigo-50" : "border border-green-300 text-green-700 hover:bg-green-50"}`}
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
