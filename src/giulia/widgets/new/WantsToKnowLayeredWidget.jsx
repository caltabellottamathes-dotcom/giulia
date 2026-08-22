import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ac89b8e63_WTK.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";    // olijf — FOCUS
const LIGHT = "hsl(var(--d-giulia-light))"; // pistachio — LIFE
const URGENT = "hsl(var(--d-giulia-urgent))"; // urgent — URGENT

/** WantsToKnowLayeredWidget — "WANTS TO KNOW!" · P·2x3·B·SIDE (gelaagd).
 *  Shell = alleen de loep-foto (full-bleed, geen tekst erop). Glazen card
 *  onder: header met geanimeerd icoon + "WANTS TO KNOW!" + een comparison-
 *  gauge (metric stack) die Giulia's open vragen in 3 groepen uitsplitst:
 *  FOCUS, LIFE, URGENT. Drie horizontale balken vergelijken de aantallen.
 *  Kleursysteem: GIULIA + Urgent. */

const GROUPS = [
  { key: "FOCUS", color: DEEP },
  { key: "LIFE", color: "hsl(var(--ridge))" },
  { key: "URGENT", color: URGENT },
];

export default function WantsToKnowLayeredWidget() {
  const { openModule } = usePanel();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await base44.entities.GiuliaQuestion.filter({ status: "open" }, "-created_date", 50);
      setQuestions(list || []);
    } catch { setQuestions([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const counts = { FOCUS: 0, LIFE: 0, URGENT: 0 };
  questions.forEach((q) => {
    if (q.priority === "now") counts.URGENT++;
    else if (["life", "self", "admin"].includes(q.domain)) counts.LIFE++;
    else counts.FOCUS++; // projects, time, communication, people
  });
  const max = Math.max(1, counts.FOCUS, counts.LIFE, counts.URGENT);

  return (
    <div className="w-full h-[380px]">
      <PhotoGlassLayeredWidget
        shape="2:3"
        photo={PHOTO}
        glassPosition="bottom"
        glassFraction={0.48}
        overhang={0}
        domain="giulia"
        radius="large"
        overlay="bg-gradient-to-t from-black/55 via-black/25 to-black/5"
        onShellClick={() => openModule("wantstoknow")}
      >
        <WidgetHeader type="pulse" label="WANTS TO KNOW!" />

        {/* comparison gauge — 3 groepen */}
        <div className="flex flex-col gap-2.5 mt-2">
          {GROUPS.map((g, i) => {
            const val = counts[g.key];
            const frac = loading ? 0 : val / max;
            return (
              <motion.button
                key={g.key}
                onClick={() => openModule("wantstoknow")}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-left"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: "hsl(var(--ivory))" }}>{g.key}</span>
                  <span className="text-[18px] font-display font-bold tabular-nums leading-none">{loading ? "–" : val}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${frac * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.08 }}
                    style={{ backgroundColor: g.color }}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}