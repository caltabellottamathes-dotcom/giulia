import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusOliveYarn;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const URGENT = "hsl(var(--d-focus-urgent))";

/** WantsToKnowFocusWidget — P·2x3·B·SIDE · "WANTS TO KNOW!"
 *  Focus-twin. Foto = focusOliveYarn. Comparison-gauge die Giulia's open
 *  vragen in 3 groepen uitsplitst: FOCUS, LIFE, URGENT. Burgundy/cream. */
const GROUPS = [
  { key: "FOCUS", color: DEEP },
  { key: "LIFE", color: LIGHT },
  { key: "URGENT", color: URGENT },
];

export default function WantsToKnowFocusWidget() {
  const { openModule } = usePanel();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 50)
      .then((list) => setQuestions(list || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = { FOCUS: 0, LIFE: 0, URGENT: 0 };
  questions.forEach((q) => {
    if (q.priority === "now") counts.URGENT++;
    else if (["life", "self", "admin"].includes(q.domain)) counts.LIFE++;
    else counts.FOCUS++;
  });
  const max = Math.max(1, counts.FOCUS, counts.LIFE, counts.URGENT);

  return (
    <div className="w-full h-[380px]">
      <PhotoGlassLayeredWidget shape="2:3" photo={PHOTO} glassPosition="bottom" glassFraction={0.48} overhang={0} domain="focus" radius="large" onClick={() => openModule("wantstoknow")} overlay="bg-gradient-to-t from-black/55 via-black/25 to-black/5">
        <WidgetHeader type="pulse" label="WANTS TO KNOW!" />

        <div className="flex flex-col gap-2.5 mt-2">
          {GROUPS.map((g, i) => {
            const val = counts[g.key];
            const frac = loading ? 0 : val / max;
            return (
              <motion.button key={g.key} onClick={(e) => { e.stopPropagation(); openModule("wantstoknow"); }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }} className="text-left">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: "hsl(var(--ivory))" }}>{g.key}</span>
                  <span className="text-[18px] font-display font-bold tabular-nums leading-none">{loading ? "–" : val}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: "0%" }} animate={{ width: `${frac * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.08 }} style={{ backgroundColor: g.color }} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}