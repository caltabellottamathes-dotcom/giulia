import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * QuestionInfographic — Giulia asks a personal question inline. The answer is
 * saved to the user's profile so she learns over time. Brutal editorial type.
 */
export default function QuestionInfographic({ item, onAnswer }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    onAnswer?.(item.key, text.trim());
  };

  return (
    <div>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] font-bold text-olive mb-3"
      >
        <Sparkles className="h-3 w-3" /> Giulia wil je iets vragen
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, type: "spring", stiffness: 220, damping: 26 }}
        className="block text-[26px] sm:text-[30px] font-display font-bold text-charcoal leading-[1.02] tracking-[-0.025em]"
      >
        {item.title}
      </motion.span>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[14px] text-charcoal/60 leading-relaxed mt-2.5 mb-4"
      >
        {item.summary}
      </motion.p>

      <motion.textarea
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, type: "spring", stiffness: 240, damping: 28 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Typ je antwoord…"
        rows={2}
        className="w-full resize-none rounded-2xl bg-charcoal/[0.06] border border-charcoal/12 px-4 py-3 text-[16px] lg:text-[14px] text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:border-olive/50 focus:bg-charcoal/[0.08] transition"
      />

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46 }}
        onClick={submit}
        disabled={!text.trim() || saving}
        className="mt-2.5 w-full h-11 rounded-2xl bg-charcoal text-ivory font-bold text-sm disabled:opacity-40 hover:bg-charcoal/90 transition inline-flex items-center justify-center gap-2"
      >
        {saving ? "Giulia noteert dit…" : <>Vertel het Giulia</>}
      </motion.button>
    </div>
  );
}