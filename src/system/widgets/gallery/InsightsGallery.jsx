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
import { ACCENT } from "./palette";

const A = ACCENT.giulia;
const CATS = ["Opportunity", "Risk", "Research", "Suggestion", "Trend"];

/** Insights — "Wat leerde Giulia?" Count + categorieverdeling als staafjes. */
export default function InsightsGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: insights } = useEntityList("Insight", { realtime: true, externalTick: t });
  const active = (insights || []).filter(i => i.status === "new" || i.status === "reviewed");
  const count = active.length;
  const byCat = useMemo(() => {
    const m = {}; CATS.forEach(c => m[c] = 0);
    active.forEach(i => { if (m[i.category] != null) m[i.category]++; });
    return m;
  }, [active]);
  const maxCat = Math.max(1, ...Object.values(byCat));
  const headline = count === 0 ? "NIETS NIEUW" : count <= 2 ? "EEN INZICHT" : "PATRONEN";
  const sub = count === 0 ? "Giulia observeert" : count <= 2 ? "Giulia leerde iets" : "Giulia ziet verbanden";

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("insights")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="What I've Noticed." count={count ? `${count} nieuw` : "stil"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-3">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
        </div>
        <div className="mt-5 flex items-end gap-2 h-16">
          {CATS.map((c, i) => (
            <div key={c} className="flex-1 flex flex-col items-center gap-1">
              <motion.div className="w-full rounded-md" style={{ background: A }}
                initial={{ height: 4 }} animate={{ height: `${Math.max(6, (byCat[c] / maxCat) * 100)}%`, opacity: byCat[c] ? 0.8 : 0.15 }}
                transition={{ duration: 0.7, delay: i * 0.08 }} />
              <span className="text-[7px] uppercase tracking-wide opacity-40 font-semibold">{c.slice(0, 4)}</span>
            </div>
          ))}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.feetChair} className="h-16 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} inzichten · ${CATS.filter(c => byCat[c]).length} soorten` : "Wachtend op patronen"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}