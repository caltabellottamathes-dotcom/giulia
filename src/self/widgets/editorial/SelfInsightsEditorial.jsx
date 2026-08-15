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

/** Self Insights — foto ONDER (groter), balans-spectrum + staven erboven. */
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
    return Object.entries(counts).map(([type, n]) => ({ type, n })).sort((a, b) => b.n - a.n).slice(0, 5);
  }, [liveActive, useMock]);
  const maxT = Math.max(1, ...types.map((t) => t.n));

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfinsights")} className="min-h-[300px] sm:col-span-2 sm:row-span-2" style={{ "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full gap-3 p-3" style={{ color: PLUM }}>
        <div className="flex flex-col flex-1 min-h-0">
          <WidgetHeader label="Self Insights" count={`${active} actief`} />
          <h3 className="text-[26px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-1">{active} INZICHTEN</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1">balans · patronen</p>

          {/* balans-spectrum */}
          <div className="mt-3">
            <div className="relative h-3.5 rounded-full overflow-hidden" style={{ background: `linear-gradient(90deg, ${SAGE}, ${PLUM})` }}>
              <motion.div className="absolute top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-full bg-white shadow-md" animate={{ left: `${balance}%` }} transition={{ duration: 1.2, ease: "easeOut" }} style={{ left: `${balance}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] uppercase tracking-wider opacity-55">onbalans</span>
              <CountUp value={balance} className="text-[24px] font-display font-semibold tabular-nums" />
              <span className="text-[9px] uppercase tracking-wider opacity-55">balans</span>
            </div>
          </div>

          {/* inzicht-type staven */}
          <div className="mt-3 space-y-2 flex-1 min-h-0">
            {types.map((t, i) => (
              <div key={t.type} className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider w-20 shrink-0 opacity-75">{insightTypeLabel(t.type)}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: SAGE }}>
                  <motion.div className="h-full rounded-full" style={{ background: NEG.includes(t.type) ? PLUM : PLUM }} initial={{ width: 0 }} animate={{ width: `${(t.n / maxT) * 100}%` }} transition={{ duration: 0.9, delay: i * 0.08 }} />
                </div>
                <span className="text-[10px] tabular-nums opacity-65 w-4 text-right">{t.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* foto onder, groter, ronde kaart */}
        <div className="rounded-2xl overflow-hidden h-24 shrink-0">
          <img src={SELF_PHOTO.insights} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>

        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: PLUM_FAINT }}>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-60">observatie · patroon</p>
          <button onClick={(e) => { e.stopPropagation(); openModule("selfinsights"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border hover:bg-[#301728]/10 transition" style={{ borderColor: `${PLUM}4d` }}>Open</button>
        </div>
      </div>
    </WidgetShell>
  );
}