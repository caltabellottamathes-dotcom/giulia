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

/** AgentActivity — "Wie werkt er?" Agent-count + status-dots. */
export default function AgentActivityGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: activity } = useEntityList("Activity", { sort: "-timestamp", limit: 30, realtime: true, externalTick: t });
  const agents = useMemo(() => {
    const m = {};
    (activity || []).forEach(a => {
      const src = a.agent_source || a.source || "unknown";
      if (!m[src]) m[src] = { name: src, count: 0, last: a.timestamp };
      m[src].count++;
      if (a.timestamp > m[src].last) m[src].last = a.timestamp;
    });
    return Object.values(m).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [activity]);
  const count = agents.length;
  const headline = count === 0 ? "GEEN AGENTEN" : count <= 2 ? "EEN ACTIEF" : "TEAM ACTIEF";
  const sub = count === 0 ? "Niemand werkt" : `${count} agenten bezig`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("agentactivity")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Giulia · Agenten" count={count ? `${count} actief` : ""} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
        </div>
        <div className="mt-5 flex flex-col gap-2">
          {agents.map((ag, i) => (
            <motion.div key={ag.name} className="flex items-center gap-2"
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <motion.span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: A }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
              <span className="text-[10px] text-ivory/70 truncate flex-1">{ag.name}</span>
              <span className="text-[9px] tabular-nums opacity-50">{ag.count}</span>
            </motion.div>
          ))}
          {!count && <p className="text-[10px] text-ivory/30 italic">Geen agenten actief</p>}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.feetChair} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} agenten werken` : "Geen activiteit"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}