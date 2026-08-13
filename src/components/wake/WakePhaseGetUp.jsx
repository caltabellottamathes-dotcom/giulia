import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { speak } from "@/components/wake/wakeVoice";

export default function WakePhaseGetUp({ steps, stepIndex, onComplete }) {
  const step = steps[stepIndex];
  useEffect(() => {
    if (!step) return;
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 1300));
      if (cancelled) return;
      if (step.isUp) await speak("Good. I'm up.");
      else await speak(`${step.title}.`);
    };
    run();
    return () => { cancelled = true; };
  }, [stepIndex]);

  if (!step) return null;
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
      <p className="text-ivory/30 text-xs uppercase tracking-[0.3em] mb-7 font-medium">Step {stepIndex + 1}</p>
      <AnimatePresence mode="wait">
        <motion.h1
          key={stepIndex}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 1.3, ease: "easeOut" }}
          className="font-display font-light text-ivory/90 tracking-tight leading-none"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
        >
          {step.title}.
        </motion.h1>
      </AnimatePresence>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 1 }}
        onClick={onComplete}
        className="mt-14 px-12 py-4 rounded-full glass-1 text-ivory/90 text-base font-light hover:bg-ivory/15 transition-all"
      >
        {step.isUp ? "I'm up" : "Done"}
      </motion.button>
    </div>
  );
}