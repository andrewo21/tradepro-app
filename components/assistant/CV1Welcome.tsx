"use client";

// CV1Welcome — pops up for first-time visitors only.
// CV-1 slides in from bottom-right, waves, introduces himself,
// and offers to give the tour or start building.

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CV1TourModal } from "./CV1Tour";

const STORAGE_KEY = "cv1-welcomed-v1";

export default function CV1Welcome() {
  const [visible,   setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showTour,  setShowTour]  = useState(false);
  const [msgIndex,  setMsgIndex]  = useState(0);

  const messages = [
    "Hey there! I'm CV-1, your personal AI resume coach.",
    "I'm built into every step of your resume — I'll flag what's weak, write stronger versions, and help you score higher with recruiters.",
    "Want a quick tour to see how I work?",
  ];

  useEffect(() => {
    // Only show for first-time visitors
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Delay so it doesn't fight the page load
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Cycle through intro messages automatically
  useEffect(() => {
    if (!visible || dismissed) return;
    if (msgIndex >= messages.length - 1) return;
    const t = setTimeout(() => setMsgIndex(i => i + 1), 2800);
    return () => clearTimeout(t);
  }, [visible, dismissed, msgIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss() {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => setVisible(false), 300);
  }

  function openTour() {
    dismiss();
    setShowTour(true);
  }

  return (
    <>
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            exit={{   opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.1 }}
            className="fixed bottom-6 right-6 z-[90] flex items-end gap-3"
          >
            {/* Speech bubble */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0  }}
              transition={{ delay: 0.3 }}
              className="mb-4 bg-white rounded-2xl rounded-br-sm shadow-2xl border border-indigo-100 overflow-hidden"
              style={{ width: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-bold text-sm">CV-1™</span>
                  <span className="text-indigo-200 text-xs">AI Resume Coach</span>
                </div>
                <button onClick={dismiss} className="text-white/60 hover:text-white p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Message */}
              <div className="px-4 py-3 min-h-[64px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={msgIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{   opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    {messages[msgIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1 px-4 pb-2">
                {messages.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === msgIndex ? "w-4 bg-indigo-500" : i < msgIndex ? "w-1 bg-indigo-300" : "w-1 bg-gray-200"}`} />
                ))}
              </div>

              {/* CTAs — show after last message */}
              <AnimatePresence>
                {msgIndex === messages.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-gray-100 px-4 py-3 flex gap-2"
                  >
                    <button
                      onClick={openTour}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      Show me the tour →
                    </button>
                    <Link
                      href="/resume/start"
                      onClick={dismiss}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors text-center"
                    >
                      Start building
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bubble tail */}
              <div className="absolute -bottom-2 right-[88px] w-4 h-4 bg-white border-r border-b border-indigo-100 rotate-45" />
            </motion.div>

            {/* CV-1 character */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="flex-shrink-0"
            >
              <Image
                src="/cv1-wave.png"
                alt="CV-1"
                width={90}
                height={180}
                className="object-contain drop-shadow-xl"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour modal */}
      <CV1TourModal isOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  );
}
