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
const CATS = ["User preferences", "People", "Projects", "Routines", "Important information", "Conversation-derived", "Insights"];

/** Memory — "Wat weet Giulia?" Count + categorie-verdeling. */
export default function MemoryGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: memories } = useEntityList("Memory", { realtime: true, externalTick: t });
  const list = memories || [];
  const count = list.length;
  const byCat = useMemo(() => { const m = {}; CATS.forEach(c => m[c] = 0); list.forEach(m2 => { if (m[m2.category] != null) m[m2.category]++; }); return m; }, [list]);
  const activeCats = CATS.filter(c => byCat[c]);
  const headline = count === 0 ? "LEEG GEHEUGEN" : count <= 10 ? "GROEIEND" : "RIJK GEVULD";
  const sub = count === 0 ? "Giulia leert nog" : `${activeCats.length} categorieën`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("memory")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Geheugen" count={count ? `${count}` : "leeg"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
        </div>
        <div className="mt-5 flex flex-col gap-1.5">
          {activeCats.slice(0, 5).map((c, i) => {
            const n = byCat[c];
            const maxN = Math.max(...activeCats.map(x => byCat[x]));
            return (
              <div key={c} className="flex items-center gap-2">
                <span className="text-[8px] uppercase tracking-wide opacity-50 w-20 truncate font-semibold">{c.split(" ")[0]}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: A }} initial={{ width: 0 }} animate={{ width: `${(n / maxN) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.08 }} />
                </div>
                <span className="text-[9px] tabular-nums opacity-50 w-4 text-right">{n}</span>
              </div>
            );
          })}
          {!count && <p className="text-[10px] text-ivory/30 italic">Geheugen nog leeg</p>}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.loungeChairs} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${activeCats.length} categorieën · ${count} herinneringen` : "Nog niets onthouden"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}