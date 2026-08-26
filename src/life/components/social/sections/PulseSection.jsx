import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { intensitySeries } from "@/lib/domainUtils";

/** PulseSection — §6.2 intensity-tijdreeks + §9 'wat opvalt'-inzichten,
 *  in de lichte OS glass-stijl. */
export default function PulseSection({ data, mi, attention = [] }) {
  const series = useMemo(() => {
    const timestamps = [
      ...(data.whatsapps || []).filter((m) => m.direction === "sent").map((m) => m.timestamp),
      ...(data.emails || []).filter((e) => e.folder === "sent" || e.status === "sent").map((e) => e.timestamp),
    ];
    return intensitySeries(timestamps, 8).map((v, i) => ({ week: `W-${7 - i}`, value: v }));
  }, [data.whatsapps, data.emails]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
      <GlassPanel level={2} className="p-5 flex flex-col">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Social Intensity · 8 weeks</p>
        <p className="text-2xl font-display font-semibold text-foreground">{mi.total} <span className="text-muted-foreground text-sm font-normal">this week</span></p>
        <div className="flex-1 mt-3 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--olive))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--olive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--olive))" fill="url(#pulseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      <GlassPanel level={2} className="p-5 flex flex-col gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Needs attention</p>
          <div className="space-y-1.5">
            {attention.length ? attention.slice(0, 4).map((p) => (
              <div key={p.contact.id} className="flex items-center gap-2 text-[12px]">
                <span className="h-1.5 w-1.5 rounded-full bg-urgent shrink-0" />
                <span className="text-foreground/80 truncate">{p.contact.name}</span>
              </div>
            )) : <p className="text-muted-foreground text-[12px] italic">Nobody overdue.</p>}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">What stands out</p>
          <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1">
            {(data.insights || []).length ? data.insights.slice(0, 6).map((i) => (
              <div key={i.id} className="rounded-xl bg-muted/40 p-2.5">
                <p className="text-[12px] font-medium text-foreground/90">{i.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{i.content}</p>
              </div>
            )) : <p className="text-muted-foreground text-[12px] italic">Nothing has stood out yet.</p>}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}