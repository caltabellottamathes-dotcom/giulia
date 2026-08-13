import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { speak, stopSpeaking } from "@/components/wake/wakeVoice";

export default function WakePhaseWake({ onAdvance, onSnooze }) {
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 2800));
      if (cancelled) return;
      await speak("Good morning.");
      if (cancelled) return;
      await new Promise((r) => setTimeout(r, 2200));
      if (cancelled) return;
      await speak("Take your time.");
      if (cancelled) return;
      await new Promise((r) => setTimeout(r, 4500));
      if (!cancelled) onAdvance();
    };
    run();
    return () => { cancelled = true; stopSpeaking(); };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 cursor-pointer" onClick={onAdvance}>
      <motion.div
        className="w-3 h-3 rounded-full bg-ivory/40"
        animate={{ opacity: [0.15, 0.5, 0.15], scale: [1, 1.5, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <button
        onClick={(e) => { e.stopPropagation(); onSnooze(); }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-ivory/35 text-sm font-light hover:text-ivory/60 transition"
      >
        A few more minutes
      </button>
    </div>
  );
}