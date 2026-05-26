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

// ─── Bullet text sanitizer ────────────────────────────────────────────────────
function sanitizeBullet(raw: any): string {
  if (typeof raw === "string")   return raw.trim();
  if (Array.isArray(raw))        return raw.join(" ").trim();
  if (typeof raw === "object" && raw !== null && "content" in raw) return String(raw.content).trim();
  if (raw)                       return String(raw).trim();
  return "";
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
    case "set_personal": {
      const isBRPlaceholder = (v: string) => {
        if (!v) return true;
        const l = v.toLowerCase().trim();
        return l.includes("[") || l.includes("]") ||
          l === "nome" || l === "sobrenome" || l === "cidade" || l === "estado" ||
          l === "seu nome" || l === "sua cidade" || l === "n/a" || l === "não informado" ||
          l.endsWith("@example.com") || l.endsWith("@email.com") || l.endsWith(".aio") ||
          l === "telefone" || l === "seu telefone" || l === "seu email" ||
          // Reject profession words used as first names
          ["pintor", "eletricista", "gerente", "técnico", "engenheiro", "analista", "diretor",
           "supervisor", "operador", "assistente", "coordenador"].includes(l);
      };
      const sp = (field: string, value: any) => {
        const v = String(value || "").trim();
        if (!v || isBRPlaceholder(v)) return;
        store.setPersonalField(field, v);
      };
      // Accept Portuguese field names AND English fallbacks the AI sometimes uses
      const rawName = payload.name || payload.fullName || "";
      const nome     = payload.nome     || payload.firstName || (rawName ? rawName.split(" ")[0] : "");
      const sobrenome = payload.sobrenome || payload.lastName  || (rawName ? rawName.split(" ").slice(1).join(" ") : "");
      sp("nome",              nome);
      sp("sobrenome",         sobrenome);
      sp("tituloProfissional", payload.tituloProfissional || payload.tradeTitle || payload.jobTitle || payload.title);
      sp("email",             payload.email);
      sp("telefone",          payload.telefone || payload.phone);
      sp("whatsapp",          payload.whatsapp);
      sp("cidade",            payload.cidade || payload.city);
      sp("estado",            payload.estado || payload.state);
      sp("linkedin",          payload.linkedin);
      break;
    }

    case "set_summary":
      if (payload.text) setPendingSummary(payload.text);
      break;

    case "add_experience": {
      // Reject placeholder company names
      const empresaRaw: string = payload.empresa || payload.company || "";
      const isPlaceholderEmpresa = !empresaRaw.trim() ||
        empresaRaw.includes("[") || empresaRaw.includes("]") ||
        empresaRaw.toLowerCase() === "desconhecida" ||
        empresaRaw.toLowerCase() === "n/a" ||
        empresaRaw.toLowerCase() === "nome da empresa" ||
        empresaRaw.toLowerCase() === "empresa";
      if (isPlaceholderEmpresa) break;

      const isPlaceholderDate = (d: string) =>
        !d || d.includes("[") || d.includes("]") ||
        d.toLowerCase().includes("data") || d.toLowerCase() === "n/a";

      const currentExp = useBrResumeStore.getState().experiencia || [];
      const normBR = (s: string) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      const existingBR = currentExp.find((e: any) =>
        normBR(e.empresa) === normBR(empresaRaw) &&
        (normBR(e.cargo) === normBR(payload.cargo || payload.jobTitle || "") || !e.cargo)
      );
      if (existingBR) break; // already have this job

      const singleEmptyBR =
        currentExp.length === 1 &&
        !currentExp[0].cargo?.trim() &&
        !currentExp[0].empresa?.trim();
      if (!singleEmptyBR) store.addExperiencia();
      setTimeout(() => {
        const exp = useBrResumeStore.getState().experiencia;
        const last = exp[exp.length - 1];
        if (!last) return;
        const cargo   = payload.cargo   || payload.jobTitle || "";
        const empresa = payload.empresa || payload.company  || "";
        if (cargo)   store.updateExperienciaField(last.id, "cargo",   cargo);
        if (empresa) store.updateExperienciaField(last.id, "empresa", empresa);
        if (payload.dataInicio && !isPlaceholderDate(payload.dataInicio))
          store.updateExperienciaField(last.id, "dataInicio", payload.dataInicio);
        if (payload.dataFim && !isPlaceholderDate(payload.dataFim))
          store.updateExperienciaField(last.id, "dataFim", payload.dataFim);
        const cidade = payload.cidade || payload.city || "";
        const estado = payload.estado || payload.state || "";
        if (cidade) store.updateExperienciaField(last.id, "cidade", cidade);
        if (estado) store.updateExperienciaField(last.id, "estado", estado);
      }, 60);
      break;
    }

    case "add_responsibility": {
      const bulletTextBR = sanitizeBullet(payload.text);
      if (!bulletTextBR) break;
      setTimeout(() => {
        const exp = useBrResumeStore.getState().experiencia;
        const job = exp[exp.length - 1]; // always target most recently added job
        if (!job) return;
        // Dedup: skip if this bullet already exists (matches US implementation)
        const alreadyHasBR = [...(job.responsabilidades || [])]
          .some((r: any) => sanitizeBullet(r.text ?? r).toLowerCase().slice(0, 30) === bulletTextBR.toLowerCase().slice(0, 30));
        if (alreadyHasBR) return;
        // Fill empty slot or add new one
        const emptyIdxBR = job.responsabilidades?.findIndex((r: any) => !sanitizeBullet(r.text ?? r));
        if (emptyIdxBR !== undefined && emptyIdxBR !== -1) {
          store.updateResponsabilidade(job.id, emptyIdxBR, bulletTextBR);
        } else {
          store.addResponsabilidade(job.id);
          setTimeout(() => {
            const updated = useBrResumeStore.getState().experiencia;
            const updatedJob = updated.find((e: any) => e.id === job.id);
            if (!updatedJob) return;
            store.updateResponsabilidade(job.id, updatedJob.responsabilidades.length - 1, bulletTextBR);
          }, 60);
        }
      }, 80);
      break;
    }

    case "add_skill": {
      if (!payload.text?.trim()) break;
      const normSkillBR = (t: string) => t.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
      const existingTecnicas = useBrResumeStore.getState().habilidadesTecnicas || [];
      const alreadyExistsBR = existingTecnicas.some((s: any) =>
        normSkillBR(s.text || s) === normSkillBR(payload.text)
      );
      if (alreadyExistsBR) break;
      store.addHabilidadeTecnica();
      setTimeout(() => {
        const tecnicas = useBrResumeStore.getState().habilidadesTecnicas;
        store.updateHabilidadeTecnica(tecnicas.length - 1, payload.text);
      }, 60);
      break;
    }

    case "add_education": {
      const edu = state.formacao || [];
      // Accept both Portuguese and English field names
      const instituicao  = payload.instituicao || payload.school || payload.institution || "";
      const curso        = payload.curso || payload.degree || payload.course || "";
      const anoConclusao = payload.anoConclusao || payload.year || payload.graduationYear || "";
      const normEdu = (s: string) => (s || "").toLowerCase().trim();
      const eduExists = edu.some((f: any) =>
        normEdu(f.instituicao) === normEdu(instituicao) &&
        normEdu(f.curso) === normEdu(curso)
      );
      if (eduExists || (!instituicao && !curso)) break;
      if (edu.length === 1 && !edu[0].curso && !edu[0].instituicao) {
        store.setField("formacao", [{ instituicao, curso, anoConclusao, tipo: "Superior" }]);
      } else {
        store.setField("formacao", [...edu, { instituicao, curso, anoConclusao, tipo: "Superior" }]);
      }
      break;
    }

    case "add_certification": {
      const certs = state.cursosCertificacoes || [];
      // Accept both Portuguese and English field names
      const nome = payload.nome || payload.text || payload.name || payload.certification || "";
      if (!nome.trim()) break;
      const norm = (s: string) => (s || "").toLowerCase().trim();
      const alreadyExists = certs.some((c: any) => norm(c.nome) === norm(nome));
      if (!alreadyExists) {
        store.setField("cursosCertificacoes", [...certs, {
          nome,
          instituicao: payload.instituicao || payload.institution || "",
          ano: payload.ano || payload.year || "",
        }]);
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
      // Reject obvious placeholder values the AI invents when it doesn't have real data
      const isPlaceholder = (v: string) => {
        if (!v) return true;
        const l = v.toLowerCase().trim();
        return (
          l.includes("[") || l.includes("]") ||
          l === "city name" || l === "state name" || l === "your city" || l === "your state" ||
          l === "city" || l === "state" || l === "n/a" || l === "not provided" ||
          l.endsWith("@example.com") || l.endsWith("@email.com") ||
          l === "123-456-7890" || l === "555-555-5555" || l === "000-000-0000" ||
          l === "phone number" || l === "your phone" ||
          l === "email address" || l === "your email"
        );
      };
      const pi = (field: string, value: any) => {
        const v = String(value || "").trim();
        if (!v || isPlaceholder(v)) return;
        useResumeStore.getState().updatePersonalInfo(field, v);
      };
      // Accept both split fields and combined "name" field
      const rawName: string = payload.name || "";
      const firstName = payload.firstName || (rawName ? rawName.split(" ")[0] : "");
      const lastName  = payload.lastName  || (rawName ? rawName.split(" ").slice(1).join(" ") : "");
      pi("firstName",  firstName);
      pi("lastName",   lastName);
      // tradeTitle set only from add_experience (first job) — not from personal step
      pi("email",      payload.email);
      pi("phone",      payload.phone);
      // Only update city/state if not already set — prevents school location overwriting real city
      const currentPI = useResumeStore.getState().personalInfo;
      if (!currentPI.city)  pi("city",  payload.city);
      if (!currentPI.state) pi("state", payload.state);
      pi("linkedin",   payload.linkedin);
      break;
    }

    case "set_summary":
      // EN: write directly — no approval card needed
      if (payload.text) {
        useResumeStore.getState().updateSummary(payload.text);
      }
      break;

    case "add_experience": {
      // Reject if company is a placeholder — prevents ghost entries
      const companyRaw: string = payload.company || "";
      const isPlaceholderCompany = !companyRaw.trim() ||
        companyRaw.includes("[") || companyRaw.includes("]") ||
        companyRaw.toLowerCase() === "unknown" ||
        companyRaw.toLowerCase() === "n/a" ||
        companyRaw.toLowerCase() === "company name" ||
        companyRaw.toLowerCase() === "employer";
      if (isPlaceholderCompany) break;

      const expState = useResumeStore.getState().experience;
      const norm = (s: string) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

      // DEDUP: same company + same title OR same company + same normalized start date = same job
      const normDate = (d: string) => (d || "").replace(/\D/g, "").slice(0, 6); // "05/2003" → "052003"
      const existing = expState.find((e: any) => {
        const sameCompany = norm(e.company) === norm(payload.company);
        if (!sameCompany) return false;
        const sameTitle = norm(e.jobTitle) === norm(payload.jobTitle) || !e.jobTitle || !payload.jobTitle;
        const sameStart = e.startDate && payload.startDate &&
          normDate(e.startDate) === normDate(payload.startDate) && normDate(e.startDate).length >= 4;
        return sameTitle || sameStart;
      });

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

        if (payload.jobTitle) {
          store.updateExperience(job.id, "jobTitle", payload.jobTitle);
          // Auto-set resume header title from first job if not already set
          const current = useResumeStore.getState().personalInfo;
          if (!current.tradeTitle) useResumeStore.getState().updatePersonalInfo("tradeTitle", payload.jobTitle);
        }
        if (payload.company)     store.updateExperience(job.id, "company",     payload.company);
        if (payload.startDate)   store.updateExperience(job.id, "startDate",   payload.startDate);
        if (payload.endDate)     store.updateExperience(job.id, "endDate",     payload.endDate);
        // Reject placeholder city/state — always defined before use
        const isPlaceholderGeo = (v: string) => !v || v.includes("[") || v.includes("]") ||
          v.toLowerCase() === "city" || v.toLowerCase() === "state" ||
          v.toLowerCase() === "your city" || v.toLowerCase() === "your state";
        if (payload.city  && !isPlaceholderGeo(payload.city))
          store.updateExperience(job.id, "city",  payload.city);
        if (payload.state && !isPlaceholderGeo(payload.state))
          store.updateExperience(job.id, "state", payload.state);
        if (payload.roleSummary) store.updateRoleSummary(job.id, payload.roleSummary);

        // Add bullets — deduplicated, then added sequentially to avoid race conditions
        const bullets: string[] = Array.isArray(payload.responsibilities) ? payload.responsibilities : [];
        const existingBullets = [
          ...(job.responsibilities || []).map((b: any) => sanitizeBullet(b.text ?? b).toLowerCase().slice(0, 30)),
          ...(job.achievements     || []).map((b: any) => sanitizeBullet(b.text ?? b).toLowerCase().slice(0, 30)),
        ].filter(eb => eb.trim()); // exclude empty slots so startsWith("") never falsely matches

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

        // Achievements — same sequential pattern
        const achieves: string[] = Array.isArray(payload.achievements) ? payload.achievements : [];
        const existingAchieves = (job.achievements || [])
          .map((b: any) => (typeof b === "string" ? b : b.text || "").toLowerCase().slice(0, 30))
          .filter((eb: string) => eb.trim());
        const newAchieves = achieves.filter((text: string) =>
          text?.trim() && !existingAchieves.some((eb: string) => text.toLowerCase().startsWith(eb.slice(0, 20)))
        );
        const addNextAchieve = (idx: number) => {
          if (idx >= newAchieves.length) return;
          store.addAchievement(job.id);
          setTimeout(() => {
            const u = useResumeStore.getState().experience;
            const j = u.find((e: any) => e.id === job.id);
            if (j) {
              store.updateAchievement(job.id, j.achievements.length - 1, newAchieves[idx]);
              setTimeout(() => addNextAchieve(idx + 1), 80);
            }
          }, 80);
        };
        addNextAchieve(0);
      }, 80);
      break;
    }

    case "add_responsibility": {
      if (!payload.text?.trim()) break;
      const expSnap = useResumeStore.getState().experience;
      // Always target the last entry — it is always the most recently added job
      const job = expSnap[expSnap.length - 1];
      if (!job) break;
      // Dedup: skip if this bullet already exists on this job
      const alreadyHas = [...(job.responsibilities || []), ...(job.achievements || [])]
        .some((b: any) => sanitizeBullet(b.text ?? b).toLowerCase().slice(0, 30) === sanitizeBullet(payload.text).toLowerCase().slice(0, 30));
      if (alreadyHas) break;
      // Find empty slot or add new one, then write text
      const emptyIdx = job.responsibilities?.findIndex((r: any) => !(r.text?.trim()));
      if (emptyIdx !== -1 && emptyIdx !== undefined) {
        useResumeStore.getState().updateResponsibility(job.id, emptyIdx, payload.text);
      } else {
        store.addResponsibility(job.id);
        setTimeout(() => {
          const fresh = useResumeStore.getState().experience;
          const j = fresh.find((e: any) => e.id === job.id);
          if (j) useResumeStore.getState().updateResponsibility(job.id, j.responsibilities.length - 1, payload.text);
        }, 80);
      }
      break;
    }

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

  // Live score — reads store reactively, but only after client mount to avoid hydration mismatch
  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => setClientMounted(true), []);
  const usStoreSnap = useResumeStore();
  const brStoreSnap = useBrResumeStore();
  let liveScore: ReturnType<typeof computeLiveAtsScore> | null = null;
  if (clientMounted) {
    try {
      liveScore = computeLiveAtsScore(isEN ? usStoreSnap : mapBrStoreForAts(brStoreSnap));
    } catch { /* silent */ }
  }
  const scoreColor = liveScore ? atsLabelColor(liveScore.label) : "#9ca3af";

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  // PT-BR: auto-navigate to resumo ONLY when summary step is truly complete
  useEffect(() => {
    const summaryDone = currentStep === "summary" || currentStep === "done";
    if (!isEN && isDone && pendingSummary === null && started && summaryDone) {
      const t = setTimeout(() => router.push("/br/curriculo/resumo"), 1000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, pendingSummary, isEN, started, currentStep]);

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      let res: Response;
      try {
        res = await fetch("/api/ai/gringo-writer", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ history: newHistory, locale }),
          signal:  controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      if (!res!.ok) throw new Error("API error");

      const data = await res.json();

      // Apply store actions — each wrapped individually so a single
      // failed write never aborts the conversation or shows an error.
      if (data.actions?.length) {
        for (const action of data.actions) {
          try { applyAction(action); } catch (e) { console.warn("[writer action]", action.type, e); }
          // 150ms between actions — gives add_experience's 80ms setTimeout time to complete
          // before a following add_responsibility reads the store
          await new Promise(r => setTimeout(r, 150));
        }
      }

      // ── Bullet collection guard ──────────────────────────────────────────────
      // If the AI just finished collecting an experience entry but stored no
      // responsibilities, block progression and force the user to provide bullets.
      const incomingStep = data.step || "personal";
      const advancingPastExperience =
        (incomingStep === "skills" || incomingStep === "education" ||
         incomingStep === "certifications" || incomingStep === "summary" ||
         incomingStep === "done") &&
        currentStep === "experience";

      let blockedByMissingBullets = false;
      if (advancingPastExperience) {
        const expStore = isEN
          ? useResumeStore.getState().experience
          : useBrResumeStore.getState().experiencia;
        const lastExp = expStore?.[expStore.length - 1];
        const bulletField = isEN ? "responsibilities" : "responsabilidades";
        const bullets = (lastExp?.[bulletField] || []).filter((r: any) => {
          const raw = r.text ?? r;
          const text =
            typeof raw === "string"   ? raw.trim() :
            Array.isArray(raw)        ? raw.join(" ").trim() :
            typeof raw === "object" && raw !== null && "content" in raw ? String(raw.content).trim() :
            raw                       ? String(raw).trim() : "";
          return text.length > 0;
        });
        if (bullets.length === 0) {
          blockedByMissingBullets = true;
        }
      }

      if (blockedByMissingBullets) {
        // Stay on experience step and inject the required message
        setCurrentStep("experience");
        setIsDone(false);
        const blockedMsg = isEN
          ? "I still need 2–4 bullet points for this role before we continue. What was your first main responsibility in this position?"
          : "Preciso de 2 a 4 bullets para este cargo antes de continuar. Qual foi sua primeira responsabilidade principal neste emprego?";
        setHistory([...newHistory, { role: "assistant", content: blockedMsg }]);
      } else {
        setCurrentStep(incomingStep);
        setIsDone(data.done || false);

        // Only append assistant message if it has content
        const updated: WriterMessage[] = data.message?.trim()
          ? [...newHistory, { role: "assistant", content: data.message }]
          : newHistory;
        setHistory(updated);
      }

      if (data.done && isEN && !blockedByMissingBullets) {
        // EN: summary already written to store — navigate to preview after a short delay
        setTimeout(() => router.push(previewHref), 1800);
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

      {/* ── Summary approval card — PT-BR only; EN writes summary directly to store ── */}
      {pendingSummary && !isEN && (
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
