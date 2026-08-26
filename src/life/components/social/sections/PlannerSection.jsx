import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { CountUp, MiniStat, BarPulse } from "@/system/widgets/primitives";

const GRID = "grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[176px]";
const DOW = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];
const SAND = "hsl(var(--d-life-light))";

const startOfWeek = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };

/** PlannerSection — §4 willen→gepland als bento: week board, intentions, proposed, load, next. */
export default function PlannerSection({ d, activePlans, circle }) {
  const week = useMemo(() => { const start = startOfWeek(); return DOW.map((label, i) => { const day = new Date(start.getTime() + i * 86400000); day.setHours(0, 0, 0, 0); const next = new Date(day.getTime() + 86400000); const dayPlans = (d.plans || []).filter((p) => { const t = new Date(p.suggested_date || 0).getTime(); return t >= day.getTime() && t < next && p.status !== "cancelled"; }); const busy = (d.events || []).some((e) => { const s = new Date(e.start).getTime(); const en = new Date(e.end || e.start).getTime(); return s < next && en > day.getTime() && e.domain !== "life"; }); return { label, plans: dayPlans, busy, open: !busy && dayPlans.length === 0 }; }); }, [d.plans, d.events]);
  const weekPlans = week.flatMap((w) => w.plans);
  const proposed = activePlans.filter((p) => p.status === "proposed");
  const load = week.map((w) => w.plans.length);
  const maxLoad = Math.max(1, ...load);
  const nextPlan = weekPlans.find((p) => p.status === "planned" || p.status === "confirmed");
  const intentions = d.intentions || [];
  const opps = d.opportunities || [];

  return (
    <div className={GRID}>
      {/* WEEK BOARD — large */}
      <WidgetShell size="2x2" radius="large" domain="life" className="col-span-2 row-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="This Week · Plans" type="agenda" count={`${weekPlans.length}`} />
          <div className="mt-3 grid grid-cols-7 gap-1.5 flex-1">
            {week.map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[8px] uppercase tracking-wider opacity-45 font-semibold">{w.label}</span>
                <div className="relative w-full flex-1 rounded-md flex flex-col items-center justify-center overflow-hidden" style={w.plans.length ? { background: SAND } : { border: `1px ${w.open ? "dashed" : "solid"} currentColor` }}>
                  {w.plans.length ? <span className="text-charcoal text-[8px] font-semibold uppercase leading-tight text-center px-0.5 line-clamp-4">{w.plans[0].activity}</span> : w.open ? <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: "currentColor" }} /> : <span className="text-[8px] opacity-60">·</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </WidgetShell>

      {/* INTENTIONS */}
      <WidgetShell size="1x1" radius="medium" domain="life">
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="Intentions" type="tasks" /><div className="mt-auto"><MiniStat label="open" value={intentions.length} /></div></div>
      </WidgetShell>

      {/* PROPOSED */}
      <WidgetShell size="1x1" radius="medium" domain="life">
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="Proposed" type="pulse" /><div className="mt-auto"><MiniStat label="to confirm" value={proposed.length} /></div></div>
      </WidgetShell>

      {/* LOAD */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Social Load · This week" type="energy" />
          <BarPulse values={load} height={56} className="mt-auto" />
          <div className="flex justify-between mt-2">{DOW.map((l, i) => <span key={i} className="text-[8px] uppercase tracking-wide opacity-45">{l}</span>)}</div>
        </div>
      </WidgetShell>

      {/* NEXT PLAN */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <WidgetHeader label="Next Plan" type="agenda" />
          {nextPlan ? <div className="mt-1 overflow-hidden"><p className="text-lg font-display font-semibold truncate">{nextPlan.activity}</p><p className="text-[11px] opacity-55 mt-1">{new Date(nextPlan.suggested_date).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "short" })}</p></div> : <p className="text-sm opacity-45 mt-1">Nothing planned</p>}
        </div>
      </WidgetShell>

      {/* OPPORTUNITIES */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <WidgetHeader label="Opportunities" type="pulse" count={opps.length || ""} />
          {opps.length ? <div className="mt-1 overflow-hidden"><p className="text-sm font-medium truncate">{opps[0].title}</p><p className="text-[11px] opacity-55 mt-1 line-clamp-2">{opps[0].reasoning}</p></div> : <p className="text-sm opacity-45 mt-1">Quiet right now</p>}
        </div>
      </WidgetShell>
    </div>
  );
}