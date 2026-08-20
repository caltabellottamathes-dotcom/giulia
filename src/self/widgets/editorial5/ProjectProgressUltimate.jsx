import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

const ACTIVE = ["in_progress", "planning", "review", "afwerking", "waiting"];
const HEALTH = { good: SAGE, attention: PLUM, critical: "hsl(var(--destructive))" };

/** ProjectProgressUltimate — grote type "BOUWEN" + voortgangsbalken van echte
 *  actieve Projecten, met health-stip. · 4:3 */
export default function ProjectProgressUltimate() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data, loading } = useEntityList("Project", { sort: "-last_activity_date", limit: 50, externalTick: learnTick });
  const active = useMemo(() => (data || []).filter((p) => ACTIVE.includes(p.status)).slice(0, 4), [data]);
  const [grow, setGrow] = useState(false);
  useEffect(() => { setGrow(true); }, [data]);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => openModule("projects")} className="min-h-0" style={{ aspectRatio: "4 / 3", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <div className="flex items-end justify-between">
          <WidgetHeader label="What I'm Building." count={`${active.length} actief`} />
          <motion.h3 className="text-[26px] leading-none font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>BOUWEN</motion.h3>
        </div>
        <div className="flex-1 flex flex-col gap-2 min-h-0 justify-center">
          {loading ? <div className="m-auto h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: PLUM_FAINT, borderTopColor: PLUM }} /> :
            active.length ? active.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 min-w-0"><span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: HEALTH[p.health] || SAGE }} /><span className="text-[11px] font-medium truncate">{p.title}</span></span>
                  <span className="text-[10px] font-semibold tabular-nums shrink-0">{Math.round(p.progress || 0)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: PLUM_FAINT }}>
                  <motion.div className="h-full rounded-full" style={{ background: i === 0 ? PLUM : SAGE }} initial={{ width: 0 }} animate={{ width: grow ? `${p.progress || 0}%` : 0 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.9, ease: "easeOut" }} />
                </div>
              </motion.div>
            )) : <div className="text-center"><span className="text-[16px] font-display font-semibold opacity-40">geen actieve projecten</span></div>}
        </div>
      </div>
    </WidgetShell>
  );
}