import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { CountUp, BarPulse, ProgressRing, MiniStat } from "@/system/widgets/primitives";
import Avatar from "@/system/components/glass/Avatar";
import { weeklyActivityBars, personalBaseline, daysSince, PULSE_LABEL } from "@/lib/domainUtils";

const GRID = "grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[176px]";

/** OverviewSection — §1 het hele sociale systeem als bento van widget-tegels. */
export default function OverviewSection({ d, mi, circle, attention, activePlans, state, onOpenPerson }) {
  const bars = useMemo(() => weeklyActivityBars(d), [d]);
  const baseline = useMemo(() => personalBaseline(d), [d]);
  const intensity = Math.min(1, mi.total / 8);
  const people = useMemo(() => [...circle].sort((a, b) => daysSince(a.last_contact_date) - daysSince(b.last_contact_date)).slice(0, 6), [circle]);
  const upcoming = useMemo(() => [...activePlans.map((p) => ({ id: p.id, title: p.activity, at: p.suggested_date })), ...(d.events || []).filter((e) => e.domain === "life" && new Date(e.start) >= new Date()).map((e) => ({ id: e.id, title: e.title, at: e.start }))].filter((u) => u.at).sort((a, b) => new Date(a.at) - new Date(b.at)).slice(0, 4), [activePlans, d.events]);
  const opps = d.opportunities || [];

  return (
    <div className={GRID}>
      {/* 1.1 SOCIAL STATE — large */}
      <WidgetShell size="2x2" radius="large" domain="life" className="col-span-2 row-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Social State" type="pulse" count={PULSE_LABEL[state]} />
          <div className="flex-1 flex flex-col items-center justify-center">
            <ProgressRing value={intensity} size={128} stroke={10} outerDash label={<CountUp value={mi.total} className="text-5xl font-display font-semibold tabular-nums leading-none" />} />
            <p className="text-[11px] uppercase tracking-[0.22em] opacity-55 mt-4">{PULSE_LABEL[state]}</p>
            <p className="text-[10px] opacity-40 mt-1">meaningful · 7d</p>
          </div>
        </div>
      </WidgetShell>

      {/* 1.2 ACTIVITY */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="This Week · Activity" type="social" count={`${mi.total} meaningful`} />
          <BarPulse values={bars.map((b) => b.count)} height={56} className="mt-auto" />
          <div className="flex justify-between mt-2">{bars.map((b, i) => <span key={i} className={`text-[8px] uppercase tracking-wide ${b.isToday ? "font-bold" : "opacity-45"}`}>{b.label}</span>)}</div>
        </div>
      </WidgetShell>

      {/* 1.3 ACTIVE PLANS */}
      <WidgetShell size="1x1" radius="medium" domain="life">
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="Active Plans" type="agenda" /><div className="mt-auto"><MiniStat label="planned" value={activePlans.length} /></div></div>
      </WidgetShell>

      {/* 1.4 ATTENTION */}
      <WidgetShell size="1x1" radius="medium" domain="life" style={attention.length ? { "--tile-accent": "hsl(var(--giulia-urgent))" } : undefined}>
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="Attention" type="pulse" count={attention.length || ""} /><div className="mt-auto">{attention.length ? <p className="text-3xl font-display font-semibold tabular-nums"><CountUp value={attention.length} /></p> : <p className="text-sm opacity-55">All in rhythm</p>}</div></div>
      </WidgetShell>

      {/* 1.5 IMPORTANT PEOPLE */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Important People" type="social" count={`${circle.length}`} />
          <div className="flex gap-3 mt-1 overflow-x-auto no-scrollbar">
            {people.length ? people.map((c) => { const ds = daysSince(c.last_contact_date); return (
              <button key={c.id} onClick={() => onOpenPerson?.(c)} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
                <Avatar src={c.avatar} name={c.name} size="md" />
                <span className="text-[10px] truncate w-full text-center">{c.name.split(" ")[0]}</span>
                <span className="text-[8px] opacity-50">{ds === Infinity ? "—" : `${ds}d`}</span>
              </button>
            ); }) : <p className="text-sm opacity-45 self-center">No close circle yet</p>}
          </div>
        </div>
      </WidgetShell>

      {/* 1.6 UPCOMING */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Upcoming" type="agenda" count={upcoming.length || ""} />
          <div className="mt-1 space-y-1.5 overflow-hidden">
            {upcoming.length ? upcoming.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm gap-2">
                <span className="truncate">{u.title}</span>
                <span className="text-[10px] opacity-50 tabular-nums shrink-0">{new Date(u.at).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}</span>
              </div>
            )) : <p className="text-sm opacity-45">Open week</p>}
          </div>
        </div>
      </WidgetShell>

      {/* 1.7 OPPORTUNITIES */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Opportunities" type="pulse" count={opps.length || ""} />
          {opps.length ? <div className="mt-1 overflow-hidden"><p className="text-sm font-medium truncate">{opps[0].title}</p><p className="text-[11px] opacity-55 mt-1 line-clamp-2">{opps[0].reasoning}</p></div> : <p className="text-sm opacity-45 mt-1">Quiet right now</p>}
        </div>
      </WidgetShell>
    </div>
  );
}