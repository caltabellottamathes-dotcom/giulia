import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { speak } from "@/self/components/wakeVoice";

export default function WakePhaseOrient({ wakeTime, context, onAdvance, onSnooze }) {
  const time = wakeTime || "07:30";
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 1600));
      if (cancelled) return;
      if (context?.type && context.type !== "quiet") await speak(context.line);
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 px-6 text-center cursor-pointer" onClick={onAdvance}>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2.6, ease: "easeOut" }}
        className="font-display font-light text-ivory/90 tracking-tight leading-none"
        style={{ fontSize: "clamp(5rem, 18vw, 12rem)" }}
      >
        {time}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.4 }}
        className="mt-7 text-ivory/45 text-lg font-light max-w-md"
      >
        You don't have to think about the day yet.
      </motion.p>
      {context?.type && context.type !== "quiet" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 2.6 }}
          className="mt-3 text-ivory/30 text-sm font-light"
        >
          {context.line}
        </motion.p>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onSnooze(); }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-ivory/35 text-sm font-light hover:text-ivory/60 transition"
      >
        Snooze
      </button>
    </div>
  );
}