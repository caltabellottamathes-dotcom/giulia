import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { insightTypeLabel } from "@/lib/selfUtils";
import { SELF_PHOTO, PLUM, SAGE, PLUM_FAINT, MOCK } from "./selfEditorial";

const POS = ["pattern", "balance", "capacity"];
const NEG = ["imbalance", "overload", "under_recovery"];

/** Self Insights — breed & vierkant (2×2). Balans-spectrum + staven + foto onder. */
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

  const types = useMemo(() => {
    if (useMock) return MOCK.insights.items;
    const counts = {};
    liveActive.forEach((i) => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return Object.entries(counts).map(([type, n]) => ({ type, n })).sort((a, b) => b.n - a.n).slice(0, 4);
  }, [liveActive, useMock]);
  const maxT = Math.max(1, ...types.map((t) => t.n));

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfinsights")} className="min-h-[220px]" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full gap-2 p-2.5" style={{ color: PLUM }}>
        <div className="flex flex-col flex-1 min-h-0">
          <WidgetHeader label="Self Insights" count={`${active} actief`} />
          <h3 className="text-[20px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-0.5">{active} INZICHTEN</h3>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mt-0.5">balans · patronen</p>

          <div className="mt-2">
            <div className="relative h-3 rounded-full overflow-hidden" style={{ background: `linear-gradient(90deg, ${SAGE}, ${PLUM})` }}>
              <motion.div className="absolute top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-white shadow-md" animate={{ left: `${balance}%` }} transition={{ duration: 1.2, ease: "easeOut" }} style={{ left: `${balance}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[8px] uppercase tracking-wider opacity-55">onbalans</span>
              <CountUp value={balance} className="text-[20px] font-display font-semibold tabular-nums" />
              <span className="text-[8px] uppercase tracking-wider opacity-55">balans</span>
            </div>
          </div>

          <div className="mt-2 space-y-1.5 flex-1 min-h-0">
            {types.map((t, i) => (
              <div key={t.type} className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider w-20 shrink-0 opacity-75">{insightTypeLabel(t.type)}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: SAGE }}>
                  <motion.div className="h-full rounded-full" style={{ background: PLUM }} initial={{ width: 0 }} animate={{ width: `${(t.n / maxT) * 100}%` }} transition={{ duration: 0.9, delay: i * 0.08 }} />
                </div>
                <span className="text-[9px] tabular-nums opacity-65 w-3 text-right">{t.n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden h-14 shrink-0">
          <img src={SELF_PHOTO.insights} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>

        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: PLUM_FAINT }}>
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-60">observatie · patroon</p>
          <button onClick={(e) => { e.stopPropagation(); openModule("selfinsights"); }} className="rounded-full px-2.5 py-0.5 text-[9px] font-semibold border hover:bg-[#301728]/10 transition" style={{ borderColor: `${PLUM}4d` }}>Open</button>
        </div>
      </div>
    </WidgetShell>
  );
}