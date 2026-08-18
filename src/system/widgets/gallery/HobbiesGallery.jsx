import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT, FILL } from "./palette";

const A = ACCENT.life;
const SAND = FILL.life;
const TYPES = ["music", "creative", "cultural", "sport", "learning", "collecting"];

/** Hobbies — "Wat is actief?" Count + type-cirkels. */
export default function HobbiesGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: hobbies } = useEntityList("Hobby", { realtime: true, externalTick: t });
  const active = (hobbies || []).filter(h => h.status === "active");
  const count = active.length;
  const byType = useMemo(() => { const m = {}; TYPES.forEach(t => m[t] = 0); active.forEach(h => { if (m[h.type] != null) m[h.type]++; }); return m; }, [active]);
  const headline = count === 0 ? "GEEN HOBBY" : count <= 2 ? "FOCUS" : "VEEL INTERESSES";
  const sub = count === 0 ? "Niets actief" : `${count} actieve hobby's`;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("hobbies")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="flex flex-col h-full">
        <div className="p-5 flex flex-col flex-1 min-h-0">
          <WidgetHeader label="Hobby's" count={count ? `${count} actief` : ""} />
          <h3 className="text-[22px] leading-[1.0] font-display font-semibold tracking-[-0.03em] text-current">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{sub}</p>
          <div className="mt-4 flex items-end gap-3">
            <CountUp value={count} className="text-[48px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5 flex-1 items-center">
            {TYPES.map((tp, i) => {
              const n = byType[tp] || 0;
              return (
                <motion.div key={tp} className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: n ? SAND : "rgba(255,255,255,0.05)" }}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                  <span className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: n ? "hsl(var(--life-blue))" : "rgba(255,255,255,0.3)" }}>{tp.slice(0, 4)}</span>
                  {n > 0 && <span className="text-[8px] tabular-nums" style={{ color: "hsl(var(--life-blue))" }}>{n}</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
        <BrandPhoto src={IMAGES.lifeHobbies} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
          <div className="absolute inset-0 flex items-center px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${TYPES.filter(t => byType[t]).length} soorten` : "Geen hobby's"}</p>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}