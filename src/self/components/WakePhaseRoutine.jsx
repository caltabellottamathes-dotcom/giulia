import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { speak } from "@/self/components/wakeVoice";

export default function WakePhaseRoutine({ steps, stepIndex, onComplete, onSkip }) {
  const step = steps[stepIndex];
  useEffect(() => {
    if (!step) return;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 1000));
      if (cancelled) return;
      await speak(`${step.title}.`);
    };
    run();
    return () => { cancelled = true; };
  }, [stepIndex]);

  if (!step) return null;
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
      <p className="text-ivory/30 text-xs uppercase tracking-[0.3em] mb-2 font-medium">
        {stepIndex + 1} / {steps.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.h1
          key={stepIndex}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="font-display font-light text-ivory/90 tracking-tight leading-none"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
        >
          {step.title}.
        </motion.h1>
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.9 }}
        className="mt-14 flex items-center gap-5"
      >
        <button onClick={onSkip} className="text-ivory/40 text-sm font-light hover:text-ivory/70 transition">Skip</button>
        <button onClick={onComplete} className="px-12 py-4 rounded-full glass-1 text-ivory/90 text-base font-light hover:bg-ivory/15 transition-all">Done</button>
      </motion.div>
    </div>
  );
}