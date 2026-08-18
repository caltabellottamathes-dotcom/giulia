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
import { ACCENT, URGENT } from "./palette";

const A = ACCENT.focus;

/** Tasks — "Hoeveel moet er vandaag?" Big count + status-ring. */
export default function TasksGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: tasks } = useEntityList("Task", { realtime: true, externalTick: t });
  const overdue = (tasks || []).filter(x => x.status === "overdue");
  const today = (tasks || []).filter(x => x.status === "today");
  const done = (tasks || []).filter(x => x.status === "completed");
  const urgent = overdue.length + today.length;
  const total = (tasks || []).length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  const headline = urgent === 0 ? "BIJNA KLAAR" : overdue.length > today.length ? "ACHTER" : "VANDAAG";
  const sub = urgent === 0 ? "Niets dringends" : `${overdue.length} achter · ${today.length} vandaag`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("tasks")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Taken" count={urgent ? `${urgent} dringend` : "oké"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={urgent} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
          {urgent > 0 && <motion.span className="mb-2 h-3 w-3 rounded-full" style={{ background: URGENT }} animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />}
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[8px] uppercase tracking-[0.2em] opacity-50">klaar</span>
            <span className="text-[10px] tabular-nums font-semibold">{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div className="h-full rounded-full" style={{ background: A }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
          </div>
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.feetChairs} className="h-16 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{done.length} klaar · {total} totaal</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}