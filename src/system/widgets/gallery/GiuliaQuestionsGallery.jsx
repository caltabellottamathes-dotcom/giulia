import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT } from "./palette";

const A = ACCENT.giulia;
const PRIORITY = { now: "#d5e24a", soon: "hsl(var(--accent))", useful: "hsl(var(--olive))", curious: "hsl(var(--steel))" };

/** GiuliaQuestions — "Wat wil Giulia weten?" Rotatie door open vragen. */
export default function GiuliaQuestionsGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    base44.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 20)
      .then(r => setQuestions(r || [])).catch(() => setQuestions([]));
  }, [t]);

  useEffect(() => {
    if (questions.length <= 1) return;
    const id = setInterval(() => setIdx(i => (i + 1) % questions.length), 3500);
    return () => clearInterval(id);
  }, [questions.length]);

  const count = questions.length;
  const q = questions[idx];
  const headline = count === 0 ? "GEEN VRAGEN" : "GIULIA WIL WETEN";
  const sub = count === 0 ? "Alles bekend" : `${count} mysteries open`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("wantstoknow")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Wants to Know!" count={count ? `${count}` : ""} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-3">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
        </div>
        {q && (
          <div className="mt-4 rounded-2xl p-3.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY[q.priority] || A }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }} />
              <span className="text-[8px] uppercase tracking-[0.22em] font-semibold" style={{ color: PRIORITY[q.priority] || A }}>{(q.kind || "").replace(/_/g, " ")} · {q.domain}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={q.id} className="text-[12px] text-ivory/85 leading-snug" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
                {q.title}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.portraitThinking} className="h-16 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} mysteries · roteert` : "Giulia weet alles"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}