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
const DOMAINS = ["focus", "life", "self", "giulia"];

/** Activity — "Wat gebeurde er?" Count + dag-timeline + domein-staafjes. */
export default function ActivityGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: activity } = useEntityList("Activity", { sort: "-timestamp", limit: 50, realtime: true, externalTick: t });
  const list = activity || [];
  const count = list.length;
  const byDomain = useMemo(() => { const m = {}; DOMAINS.forEach(d => m[d] = 0); list.forEach(a => { if (m[a.domain] != null) m[a.domain]++; }); return m; }, [list]);
  const hours = useMemo(() => { const arr = Array.from({ length: 14 }, () => 0); const now = Date.now(); list.forEach(a => { if (!a.timestamp) return; const h = Math.floor((now - new Date(a.timestamp).getTime()) / 3600000); if (h >= 0 && h < 14) arr[13 - h]++; }); return arr; }, [list]);
  const maxH = Math.max(1, ...hours);
  const headline = count === 0 ? "STIL" : count <= 10 ? "RUSTIG" : "ACTIEF";
  const sub = count === 0 ? "Niets gebeurd" : `${count} recente activiteiten`;

  return (
    <WidgetShell size="3x2" radius="xl" interactive onClick={() => openModule("activity")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Activiteit" count={count ? `${count}` : "stil"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-5">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
          <div className="flex gap-3 mb-2">
            {DOMAINS.map(d => (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className="text-[8px] uppercase tracking-wide opacity-50 font-semibold">{d.slice(0, 3)}</span>
                <span className="text-[14px] tabular-nums font-semibold" style={{ color: byDomain[d] ? A : "rgba(255,255,255,0.2)" }}>{byDomain[d]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex items-end gap-[3px] h-12">
          {hours.map((v, i) => (
            <motion.span key={i} className="flex-1 rounded-t-sm" style={{ background: A }}
              initial={{ height: "6%" }} animate={{ height: `${Math.max(6, (v / maxH) * 100)}%`, opacity: v ? 0.8 : 0.12 }}
              transition={{ duration: 0.6, delay: i * 0.035 }} />
          ))}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.topDownWalk} className="h-14 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} events · ${DOMAINS.filter(d => byDomain[d]).length} domeinen` : "Geen activiteit"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}