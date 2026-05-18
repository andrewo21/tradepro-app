"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Zap, AlertCircle, PenLine, CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const STEPS = [
  {
    icon: <Zap className="w-6 h-6 text-blue-400" />,
    title: "I'm with you on every step.",
    body: "Most resume tools leave you alone with a blank form. I don't. From the moment you start, I'm reading what you type — watching for missing fields, weak bullets, and gaps that recruiters notice. I show up in the bottom corner of every page.",
    visual: "step-watch",
  },
  {
    icon: <AlertCircle className="w-6 h-6 text-amber-400" />,
    title: "I flag exactly what's hurting your score.",
    body: "I calculate your ATS score in real time — it starts at 5 and climbs as you build. I tell you specifically what's dragging it down: a missing LinkedIn, a job with no dates, bullets with no numbers. You see a live badge on my icon so you always know where you stand.",
    visual: "step-score",
  },
  {
    icon: <PenLine className="w-6 h-6 text-indigo-400" />,
    title: "I write the fix — not advice about the fix.",
    body: "When I see a weak bullet like \"I helped the company grow,\" I don't say \"add metrics.\" I write the actual replacement: \"Grew regional revenue by [X]% over 12 months by restructuring the sales pipeline for the Atlanta territory.\" You fill in the number. I write everything else.",
    visual: "step-rewrite",
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
    title: "You decide. I never take over.",
    body: "Every suggestion I make shows you the exact replacement text before anything changes. You see what I'm proposing, then choose \"Yes, replace it\" or \"Not now.\" Your resume stays yours. I just make sure it's the best version of you — not a version I invented.",
    visual: "step-control",
  },
  {
    icon: <ArrowRight className="w-6 h-6 text-blue-400" />,
    title: "Two ways to start. Your call.",
    body: "You can let me guide you from scratch — I'll ask you questions and build your resume as you answer. Or you can fill in the steps yourself and I'll offer improvements as you go. Either way, you preview the finished resume before paying anything.",
    visual: "step-start",
  },
];

// Visual mockups for each step
function StepVisual({ id }: { id: string }) {
  if (id === "step-watch") return (
    <div className="relative w-full h-32 bg-slate-800 rounded-xl overflow-hidden flex items-end justify-end p-3">
      <div className="absolute top-3 left-3 right-3 space-y-1.5">
        {["Personal Info", "Experience", "Skills", "Summary"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${i < 2 ? "bg-emerald-400" : "bg-slate-600"}`} />
            <div className={`h-2 rounded ${i < 2 ? "bg-slate-600 w-24" : "bg-slate-700 w-16"}`} />
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
          <Image src="/cv1-hero.png" alt="CV-1" width={32} height={32} className="object-contain" />
        </div>
        <span className="text-[9px] font-bold text-indigo-300">CV-1™</span>
      </div>
    </div>
  );

  if (id === "step-score") return (
    <div className="w-full h-32 bg-slate-800 rounded-xl p-3 flex items-center gap-4">
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle cx="40" cy="40" r="30" fill="none" stroke="#3b82f6" strokeWidth="8"
            strokeDasharray="113 188" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-blue-400">38</span>
          <span className="text-[9px] text-slate-400">/95</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {[
          { label: "Start date missing", color: "text-red-400" },
          { label: "No LinkedIn URL", color: "text-red-400" },
          { label: "3 bullets need metrics", color: "text-amber-400" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <AlertCircle className={`w-3 h-3 flex-shrink-0 ${item.color}`} />
            <span className={`text-[10px] ${item.color}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (id === "step-rewrite") return (
    <div className="w-full h-32 bg-slate-800 rounded-xl p-3 space-y-2">
      <div className="bg-red-950/50 border border-red-800/40 rounded-lg p-2">
        <p className="text-[10px] text-red-400 font-semibold mb-0.5">BEFORE</p>
        <p className="text-[10px] text-slate-300 italic">"I helped the company grow and made them money"</p>
      </div>
      <div className="bg-emerald-950/50 border border-emerald-700/40 rounded-lg p-2">
        <p className="text-[10px] text-emerald-400 font-semibold mb-0.5">CV-1 REPLACEMENT</p>
        <p className="text-[10px] text-slate-200">"Grew regional revenue by [X]% over 12 months by restructuring the sales pipeline for the Atlanta territory"</p>
      </div>
    </div>
  );

  if (id === "step-control") return (
    <div className="w-full h-32 bg-slate-800 rounded-xl p-3 flex flex-col justify-between">
      <div className="bg-indigo-950/60 border border-indigo-700/30 rounded-lg p-2">
        <p className="text-[10px] text-indigo-300 font-semibold mb-1">Proposed replacement:</p>
        <p className="text-[10px] text-slate-200 italic">"Managed 3 concurrent HVAC installations valued at $[X], delivering all projects on time"</p>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-indigo-600 rounded-lg text-white text-[11px] font-bold">
          <CheckCircle className="w-3 h-3" /> Yes, replace it
        </div>
        <div className="flex-1 flex items-center justify-center py-1.5 bg-slate-700 rounded-lg text-slate-400 text-[11px]">
          Not now
        </div>
      </div>
    </div>
  );

  if (id === "step-start") return (
    <div className="w-full h-32 bg-slate-800 rounded-xl p-3 flex gap-3">
      <div className="flex-1 bg-indigo-950/60 border border-indigo-600/40 rounded-xl p-2.5 flex flex-col justify-between">
        <p className="text-[10px] text-indigo-300 font-bold">CV-1 builds it</p>
        <p className="text-[9px] text-slate-400">Answer questions — I write everything</p>
        <div className="text-[9px] font-bold text-indigo-400 flex items-center gap-0.5">Start with CV-1 <ChevronRight className="w-2.5 h-2.5" /></div>
      </div>
      <div className="flex-1 bg-slate-700/60 border border-slate-600/40 rounded-xl p-2.5 flex flex-col justify-between">
        <p className="text-[10px] text-slate-300 font-bold">I build it myself</p>
        <p className="text-[9px] text-slate-400">Fill in the steps, I'll assist</p>
        <div className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">Use builder <ChevronRight className="w-2.5 h-2.5" /></div>
      </div>
    </div>
  );

  return null;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen:  boolean;
  onClose: () => void;
}

export function CV1TourModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  function next()  { if (!isLast) setStep(s => s + 1); }
  function prev()  { if (step > 0) setStep(s => s - 1); }
  function reset() { setStep(0); onClose(); }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{   opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) reset(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.92, y: 24  }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Image src="/cv1-hero.png" alt="CV-1" width={36} height={36} className="object-contain" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none">CV-1™</p>
                  <p className="text-indigo-300 text-xs mt-0.5">AI Resume Coach · Feature Tour</p>
                </div>
              </div>
              <button onClick={reset} className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 px-5 mb-4">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all ${i === step ? "bg-blue-500 w-6" : i < step ? "bg-blue-800 w-1.5" : "bg-slate-700 w-1.5"}`}
                />
              ))}
              <span className="ml-auto text-xs text-slate-500">{step + 1} of {STEPS.length}</span>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0  }}
                exit={{   opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="px-5 pb-5"
              >
                {/* Visual */}
                <div className="mb-4">
                  <StepVisual id={current.visual} />
                </div>

                {/* Icon + title */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-shrink-0 mt-0.5">{current.icon}</div>
                  <h3 className="text-white font-bold text-base leading-snug">{current.title}</h3>
                </div>

                {/* Body */}
                <p className="text-slate-300 text-sm leading-relaxed ml-9">{current.body}</p>
              </motion.div>
            </AnimatePresence>

            {/* Footer nav */}
            <div className="flex items-center gap-3 px-5 pb-5">
              {step > 0 ? (
                <button onClick={prev} className="flex items-center gap-1 px-4 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition-colors rounded-xl hover:bg-slate-800">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <button onClick={reset} className="px-4 py-2.5 text-slate-500 hover:text-slate-300 text-sm transition-colors rounded-xl">
                  Skip tour
                </button>
              )}

              <div className="flex-1" />

              {isLast ? (
                <div className="flex gap-2">
                  <Link
                    href="/resume/start"
                    onClick={reset}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Start with CV-1 <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/resume/select"
                    onClick={reset}
                    className="px-4 py-2.5 border border-slate-600 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-colors hover:bg-slate-800"
                  >
                    Builder
                  </Link>
                </div>
              ) : (
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Trigger button ───────────────────────────────────────────────────────────

export function CV1TourButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-sm font-semibold rounded-xl transition-all"
      >
        <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Image src="/cv1-hero.png" alt="CV-1" width={18} height={18} className="object-contain" />
        </div>
        See how CV-1 works →
      </button>
      <CV1TourModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
