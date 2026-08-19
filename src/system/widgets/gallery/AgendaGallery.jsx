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
import { ACCENT, FILL } from "./palette";

const A = ACCENT.focus;

/** Agenda — "Wat staat er vandaag?" Event-count + dagbalk. */
export default function AgendaGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", realtime: true, externalTick: t });
  const today = (events || []).filter(e => { const d = new Date(e.start); return d.toDateString() === new Date().toDateString() && e.status !== "cancelled"; });
  const count = today.length;
  const next = today[0];
  const headline = count === 0 ? "VRIJ" : count <= 2 ? "OVERZICHT" : "VOL";
  const sub = count === 0 ? "Niets gepland" : next ? `${new Date(next.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} ${next.title || ""}`.slice(0, 40) : `${count} afspraken`;
  const hours = useMemo(() => { const arr = Array.from({ length: 14 }, () => 0); today.forEach(e => { const h = new Date(e.start).getHours(); if (h >= 6 && h < 20) arr[h - 6]++; }); return arr; }, [today]);
  const maxH = Math.max(1, ...hours);

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("agenda")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="What's Happening?" count={count ? `${count} vandaag` : "leeg"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5 truncate">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
        </div>
        <div className="mt-5 flex items-end gap-1 h-14">
          {hours.map((v, i) => (
            <motion.div key={i} className="flex-1 rounded-t-md relative" style={{ background: A }}
              initial={{ height: "8%" }} animate={{ height: `${Math.max(8, (v / maxH) * 100)}%`, opacity: v ? 0.8 : 0.12 }}
              transition={{ duration: 0.6, delay: i * 0.04 }}>
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[6px] opacity-30 font-mono">{i + 6}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.walkChairsBeach} className="h-16 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `eerste ${new Date(today[0].start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}` : "Hele dag vrij"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}