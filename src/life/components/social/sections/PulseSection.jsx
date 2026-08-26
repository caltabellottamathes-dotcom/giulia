import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { CountUp, BarPulse, ProgressRing, MiniStat } from "@/system/widgets/primitives";
import { intensitySeries, socialHeatmap, socialChangeCompare, PULSE_LABEL } from "@/lib/domainUtils";

const GRID = "grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[176px]";
const DOW = ["M", "T", "W", "T", "F", "S", "S"];

/** PulseSection — §3 sociale hartslag als bento: state, intensity, change, heatmap, attention. */
export default function PulseSection({ d, mi, attention, state, circle }) {
  const series = useMemo(() => intensitySeries([...(d.whatsapps || []).filter((m) => m.direction === "sent").map((m) => m.timestamp), ...(d.emails || []).filter((e) => e.folder === "sent" || e.status === "sent").map((e) => e.timestamp), ...(d.events || []).filter((e) => e.domain === "life").map((e) => e.start)], 8), [d.whatsapps, d.emails, d.events]);
  const change = useMemo(() => socialChangeCompare(d), [d]);
  const heat = useMemo(() => socialHeatmap({ ...d, weeks: 3 }), [d]);
  const maxHeat = Math.max(1, ...heat.flat());
  const intensity = Math.min(1, mi.total / 8);
  const topAttention = attention.slice(0, 4);

  return (
    <div className={GRID}>
      {/* STATE — large */}
      <WidgetShell size="2x2" radius="large" domain="life" className="col-span-2 row-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Pulse" type="pulse" count={PULSE_LABEL[state]} />
          <div className="flex-1 flex flex-col items-center justify-center">
            <ProgressRing value={intensity} size={128} stroke={10} outerDash label={<span className="text-3xl font-display font-semibold tracking-tight leading-none">{PULSE_LABEL[state]?.split(" ")[0]}</span>} />
            <p className="text-[11px] uppercase tracking-[0.22em] opacity-55 mt-4">{PULSE_LABEL[state]}</p>
            <p className="text-[10px] opacity-40 mt-1">{mi.total} meaningful · 7d</p>
          </div>
        </div>
      </WidgetShell>

      {/* INTENSITY */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Intensity · 8 weeks" type="energy" />
          <BarPulse values={series} height={56} className="mt-auto" />
          <p className="text-[10px] opacity-45 mt-2">weekly meaningful interactions</p>
        </div>
      </WidgetShell>

      {/* THIS WEEK */}
      <WidgetShell size="1x1" radius="medium" domain="life">
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="This Week" type="social" /><div className="mt-auto"><MiniStat label="meaningful" value={change.thisWeek} /></div></div>
      </WidgetShell>

      {/* VS LAST WEEK */}
      <WidgetShell size="1x1" radius="medium" domain="life" style={change.deltaPct > 0 ? { "--tile-accent": "hsl(var(--giulia-urgent))" } : undefined}>
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="vs Last Week" type="energy" /><div className="mt-auto"><p className="text-3xl font-display font-semibold tabular-nums">{change.deltaPct > 0 ? "+" : ""}{change.deltaPct}<span className="text-base opacity-50">%</span></p><p className="text-[10px] opacity-45 mt-0.5">{change.lastWeek} last week</p></div></div>
      </WidgetShell>

      {/* HEATMAP */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Activity · 3 weeks" type="agenda" />
          <div className="mt-2 flex gap-3">
            {heat.map((week, w) => (
              <div key={w} className="flex-1 gap-1" style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)" }}>
                {week.map((v, day) => <div key={day} className="rounded-sm transition-all" style={{ background: v ? `var(--tile-accent)` : "currentColor", opacity: v ? 0.25 + (v / maxHeat) * 0.75 : 0.08 }} />)}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5 px-0.5">{DOW.map((l, i) => <span key={i} className="text-[8px] opacity-40">{l}</span>)}</div>
        </div>
      </WidgetShell>

      {/* ATTENTION */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <WidgetHeader label="Needs Attention" type="pulse" count={attention.length || ""} />
          <div className="mt-2 space-y-1.5 overflow-hidden">
            {topAttention.length ? topAttention.map(({ contact: c, since }) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{c.name}</span>
                <span className="text-[10px] opacity-50 tabular-nums shrink-0 ml-2">{since === Infinity ? "never" : `${since}d ago`}</span>
              </div>
            )) : <p className="text-sm opacity-45">Everyone in rhythm</p>}
          </div>
        </div>
      </WidgetShell>
    </div>
  );
}