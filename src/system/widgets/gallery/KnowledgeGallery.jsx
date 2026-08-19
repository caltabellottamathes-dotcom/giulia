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

const A = ACCENT.system;
const CATS = ["Research", "Notes", "Insights", "References", "Decisions", "Conversations", "Saved"];

/** Knowledge — "Wat weet je?" Count + categorie-staafjes. */
export default function KnowledgeGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: knowledge } = useEntityList("Knowledge", { realtime: true, externalTick: t });
  const list = knowledge || [];
  const count = list.length;
  const byCat = useMemo(() => { const m = {}; CATS.forEach(c => m[c] = 0); list.forEach(k => { if (m[k.category] != null) m[k.category]++; }); return m; }, [list]);
  const activeCats = CATS.filter(c => byCat[c]);
  const maxN = Math.max(1, ...activeCats.map(c => byCat[c]));
  const headline = count === 0 ? "NIETS OPGESLAGEN" : count <= 5 ? "GROEIEND" : "RIJK GEVULD";
  const sub = count === 0 ? "Nog geen kennis" : `${activeCats.length} categorieën`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("knowledge")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="What I Know." count={count ? `${count}` : "leeg"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
        </div>
        <div className="mt-5 flex items-end gap-1.5 h-16">
          {CATS.map((c, i) => {
            const n = byCat[c] || 0;
            return (
              <div key={c} className="flex-1 flex flex-col items-center gap-1">
                <motion.div className="w-full rounded-t-md" style={{ background: A }}
                  initial={{ height: 4 }} animate={{ height: `${Math.max(6, (n / maxN) * 100)}%`, opacity: n ? 0.8 : 0.12 }} transition={{ duration: 0.7, delay: i * 0.06 }} />
                <span className="text-[6px] uppercase tracking-wide opacity-40 font-semibold">{c.slice(0, 4)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.chairWater} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${activeCats.length} categorieën · ${count} items` : "Kennisbank leeg"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}