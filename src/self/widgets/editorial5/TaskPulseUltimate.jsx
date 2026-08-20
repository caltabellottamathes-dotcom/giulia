import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

/** TaskPulseUltimate — grote type "TE DOEN" + aandacht-teller + staafgrafiek
 *  van echte Task-statussen (vandaag / over tijd / komend / open / wacht). · 1:1 */
export default function TaskPulseUltimate() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data, loading } = useEntityList("Task", { sort: "-updated_date", limit: 200, externalTick: learnTick });
  const buckets = useMemo(() => {
    const a = (data || []).filter((t) => !["completed", "archived"].includes(t.status));
    const c = (s) => a.filter((t) => t.status === s).length;
    return [
      { k: "vandaag", v: c("today"), color: SAGE },
      { k: "over tijd", v: c("overdue"), color: "hsl(var(--destructive))" },
      { k: "komend", v: c("upcoming"), color: PLUM },
      { k: "open", v: c("todo"), color: PLUM },
      { k: "wacht", v: c("waiting") + c("delegated"), color: PLUM },
    ];
  }, [data]);
  const attn = buckets[0].v + buckets[1].v;
  const max = Math.max(1, ...buckets.map((b) => b.v));
  const [grow, setGrow] = useState(false);
  useEffect(() => { setGrow(true); }, [data]);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => openModule("tasks")} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <WidgetHeader label="To Do!" count={`${attn} aandacht`} />
        <div className="flex items-end justify-between">
          <motion.h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>TE DOEN</motion.h3>
          <CountUp value={attn} className="text-[40px] font-display font-semibold tabular-nums leading-none" />
        </div>
        <div className="flex-1 flex items-end gap-2 min-h-0">
          {loading ? <div className="m-auto h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: PLUM_FAINT, borderTopColor: PLUM }} /> :
            buckets.map((b, i) => (
              <div key={b.k} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] font-semibold tabular-nums">{b.v}</span>
                <motion.span className="w-full rounded-md" style={{ background: b.color, originY: 1 }} initial={{ height: 0 }} animate={{ height: grow ? `${(b.v / max) * 100}%` : 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.7, ease: "easeOut" }} />
                <span className="text-[7px] uppercase tracking-wider opacity-55">{b.k}</span>
              </div>
            ))}
        </div>
      </div>
    </WidgetShell>
  );
}