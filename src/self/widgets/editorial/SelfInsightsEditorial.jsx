import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { insightTypeLabel } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, CONTRAST, URGENT, CONCRETE, PLUM_GLASS, MOCK } from "./selfEditorial";

const POS = ["pattern", "balance", "capacity"];
const NEG = ["imbalance", "overload", "under_recovery"];

/** Self Insights — foto ONDER groot, glas boven zweeft erover. Balans-spectrum
 *  + inzicht-type staven. */
export default function SelfInsightsEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: insights } = useEntityList("SelfInsight", { realtime: true, sort: "-created_date", limit: 30, externalTick: learnTick });

  const liveActive = (insights || []).filter((i) => i.status === "active" || i.status === "confirmed");
  const useMock = !liveActive.length;
  const active = useMock ? MOCK.insights.items.reduce((s, t) => s + t.n, 0) : liveActive.length;
  const pos = useMock ? MOCK.insights.pos : liveActive.filter((i) => POS.includes(i.type)).length;
  const neg = useMock ? MOCK.insights.neg : liveActive.filter((i) => NEG.includes(i.type)).length;
  const balance = pos + neg ? Math.round((pos / (pos + neg)) * 100) : (useMock ? MOCK.insights.balance : 50);
  const headline = active ? `${active} INZICHTEN` : "LEES";

  const types = useMemo(() => {
    if (useMock) return MOCK.insights.items;
    const counts = {};
    liveActive.forEach((i) => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return Object.entries(counts).map(([type, n]) => ({ type, n })).sort((a, b) => b.n - a.n).slice(0, 5);
  }, [liveActive, useMock]);
  const maxT = Math.max(1, ...types.map((t) => t.n));

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfinsights")} className="min-h-[300px] sm:col-span-2 sm:row-span-2" style={{ "--tile-accent": CONTRAST, background: "transparent" }}>
      <div className="relative h-full w-full overflow-hidden rounded-[inherit] text-ivory">
        {/* foto onder groot */}
        <div className="absolute inset-x-0 bottom-0 h-[48%]">
          <img src={SELF_PHOTO.insights} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(48,23,40,0.55), rgba(48,23,40,0.10) 45%, rgba(48,23,40,0.96) 100%)" }} />
        </div>

        {/* glas boven zweeft erover */}
        <div className="relative z-10 h-full p-5 flex flex-col" style={{ background: "linear-gradient(180deg, rgba(48,23,40,0.62), rgba(48,23,40,0.30) 60%, rgba(48,23,40,0.10))", backdropFilter: "blur(16px) saturate(1.2)", WebkitBackdropFilter: "blur(16px) saturate(1.2)" }}>
          <WidgetHeader label="Self Insights" count={`${active} actief`} />
          <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-65 mt-1.5">balans · patronen</p>

          <div className="mt-4">
            <div className="relative h-3 rounded-full overflow-hidden" style={{ background: `linear-gradient(90deg, ${URGENT}, ${CONCRETE} 50%, ${CONTRAST})` }}>
              <motion.div className="absolute top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-ivory shadow" animate={{ left: `${balance}%` }} transition={{ duration: 1.1, ease: "easeOut" }} style={{ left: `${balance}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] uppercase tracking-wider opacity-55">onbalans</span>
              <CountUp value={balance} className="text-[22px] font-display font-semibold tabular-nums" />
              <span className="text-[9px] uppercase tracking-wider opacity-55">balans</span>
            </div>
          </div>

          <div className="mt-4 space-y-2 flex-1 min-h-0">
            {types.map((t, i) => (
              <div key={t.type} className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider w-20 shrink-0 opacity-75">{insightTypeLabel(t.type)}</span>
                <div className="flex-1 h-2 rounded-full bg-ivory/12 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: NEG.includes(t.type) ? URGENT : i === 0 ? CONTRAST : CONCRETE }} initial={{ width: 0 }} animate={{ width: `${(t.n / maxT) * 100}%` }} transition={{ duration: 0.9, delay: i * 0.08 }} />
                </div>
                <span className="text-[10px] tabular-nums opacity-65 w-4 text-right">{t.n}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-ivory/10">
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-65">observatie · patroon</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfinsights"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}