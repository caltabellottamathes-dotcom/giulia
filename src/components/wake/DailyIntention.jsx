import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sunrise, ArrowRight, Check } from "lucide-react";

/**
 * DailyIntention — a calm editorial card where Giulia asks your intention for
 * the day. Saved to the user profile (giulia_answers.daily_intention) so it can
 * resurface through the day. Soft spring entrance.
 */
export default function DailyIntention() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const today = new Date().toLocaleDateString("sv-SE");

  useEffect(() => {
    base44.auth.me().then((u) => {
      const a = u?.giulia_answers || {};
      if (a.daily_intention_date === today && a.daily_intention) {
        setSaved(a.daily_intention);
        setText(a.daily_intention);
      }
    }).catch(() => {});
  }, [today]);

  const save = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const existing = me?.giulia_answers || {};
      await base44.auth.updateMe({
        giulia_answers: { ...existing, daily_intention: text.trim(), daily_intention_date: today },
      });
      setSaved(text.trim());
    } catch {}
    setSaving(false);
  };

  const isSaved = saved && text.trim() === saved;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 border border-olive/25 bg-olive/10">
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sunrise className="h-4 w-4 text-olive" />
          <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-olive">Je intentie voor vandaag</p>
        </div>
        <p className="text-2xl font-display font-bold text-ivory leading-tight tracking-tight mb-1">
          Wat wil je vandaag laten slagen?
        </p>
        <p className="text-xs text-ivory/60 mb-4 leading-snug">
          Eén zin. Giulia houdt het de hele dag voor je in het zicht.
        </p>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Bijv. rustig beginnen, één project afmaken…"
            className="flex-1 h-11 rounded-2xl bg-ivory/10 border border-ivory/20 px-4 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-olive/50 transition"
          />
          <button
            onClick={save}
            disabled={!text.trim() || saving || isSaved}
            className="h-11 px-5 rounded-2xl bg-olive text-ivory font-semibold text-sm disabled:opacity-50 hover:bg-olive/90 transition inline-flex items-center gap-1.5 shrink-0"
          >
            {isSaved ? <><Check className="h-4 w-4" /> Opgeslagen</> : <>Zet <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}