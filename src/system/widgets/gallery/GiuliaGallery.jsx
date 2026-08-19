import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT } from "./palette";

const A = ACCENT.giulia;

/** Giulia hero — "Hoe staat je dag?" Groot overzicht met live activiteit. */
export default function GiuliaGallery() {
  const { openChat } = usePanel();
  const t = useLearningSync();
  const { data: tasks } = useEntityList("Task", { realtime: true, externalTick: t });
  const { data: emails } = useEntityList("Email", { realtime: true, externalTick: t });
  const { data: approvals } = useEntityList("Approval", { filter: { status: "pending" }, realtime: true, externalTick: t });
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", realtime: true, externalTick: t });

  const urgent = (tasks || []).filter(x => x.status === "overdue" || x.status === "today").length;
  const unread = (emails || []).filter(x => x.status === "unread").length;
  const pend = (approvals || []).length;
  const todayEv = (events || []).filter(e => new Date(e.start).toDateString() === new Date().toDateString()).length;
  const total = urgent + unread + pend + todayEv;

  const headline = total === 0 ? "RUST" : total <= 3 ? "OVERZICHT" : total <= 8 ? "JE DAG BEWEEGT" : "VEEL GEBEUREND";
  const sub = total === 0 ? "Niets dringends vandaag" : total <= 3 ? "Een paar dingen open" : "Giulia houdt het bij";

  const spark = useMemo(() => {
    const arr = Array.from({ length: 14 }, () => 0);
    const now = Date.now();
    [...(emails || []), ...(tasks || [])].forEach(x => {
      const ts = x.timestamp || x.created_date; if (!ts) return;
      const h = Math.floor((now - new Date(ts).getTime()) / 3600000);
      if (h >= 0 && h < 14) arr[13 - h]++;
    });
    return arr;
  }, [emails, tasks]);
  const maxS = Math.max(1, ...spark);

  return (
    <WidgetShell size="3x2" radius="xl" interactive onClick={() => openChat()} className="min-h-[280px]" style={{ "--tile-accent": A }}>
      <div className="flex h-full">
        <div className="flex-1 p-6 flex flex-col min-w-0">
          <WidgetHeader label="What Matters?" count={total ? `${total} items` : "rustig"} />
          <h3 className="text-[34px] leading-[0.95] font-display font-semibold tracking-[-0.03em] text-current">{headline}</h3>
          <p className="text-[11px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{sub}</p>
          <div className="mt-5 flex items-end gap-5">
            <CountUp value={total} className="text-[84px] leading-[0.78] font-display font-semibold tabular-nums text-current" />
            <div className="flex flex-col gap-1 mb-2 shrink-0">
              <span className="text-[9px] uppercase tracking-[0.18em] opacity-50">{urgent} taken</span>
              <span className="text-[9px] uppercase tracking-[0.18em] opacity-50">{unread} email</span>
              <span className="text-[9px] uppercase tracking-[0.18em] opacity-50">{pend} goedkeuring</span>
              <span className="text-[9px] uppercase tracking-[0.18em] opacity-50">{todayEv} agenda</span>
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-end gap-[3px] h-12">
            {spark.map((v, i) => (
              <motion.span key={i} className="flex-1 rounded-full" style={{ background: A }}
                initial={{ height: "6%" }} animate={{ height: `${Math.max(6, (v / maxS) * 100)}%`, opacity: v ? 0.8 : 0.12 }}
                transition={{ duration: 0.6, delay: i * 0.035 }} />
            ))}
          </div>
        </div>
        <div className="w-[36%] shrink-0 relative overflow-hidden">
          <img src={IMAGES.giuliaPortrait2} alt="" className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-charcoal/40" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-1.5 mb-2">
              <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: A }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }} />
              <span className="text-[8px] uppercase tracking-[0.24em] text-ivory/70 font-semibold">live</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); openChat(); }} className="w-full rounded-full px-4 py-2.5 text-[12px] font-semibold text-charcoal transition hover:scale-[1.02]" style={{ background: "var(--tile-accent)" }}>
              Praat met Giulia
            </button>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}