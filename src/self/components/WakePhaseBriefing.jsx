import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { speak } from "@/self/components/wakeVoice";

export default function WakePhaseBriefing({ onStart }) {
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 1600));
      if (cancelled) return;
      await speak("You're up. I've got the rest.");
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.6 }}
        className="font-display font-light text-ivory/90 tracking-tight leading-none"
        style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
      >
        You're up.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.6, delay: 1.2 }}
        className="mt-6 text-ivory/45 text-xl font-light"
      >
        I've got the rest.
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.6, delay: 3 }}
        onClick={onStart}
        className="mt-16 px-14 py-5 rounded-full bg-ivory text-charcoal text-base font-medium hover:scale-[1.03] transition-transform"
      >
        Start briefing
      </motion.button>
    </div>
  );
}