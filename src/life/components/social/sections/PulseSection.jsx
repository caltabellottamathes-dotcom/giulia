import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { LIFE, DARK } from "../socialColors";
import { intensitySeries } from "@/lib/domainUtils";

/** PulseSection — §6.2 intensity-tijdreeks + §9 'wat opvalt'-inzichten-rail. */
export default function PulseSection({ data, mi, attention = [] }) {
  const series = useMemo(() => {
    const timestamps = [
      ...(data.whatsapps || []).filter((m) => m.direction === "sent").map((m) => m.timestamp),
      ...(data.emails || []).filter((e) => e.folder === "sent" || e.status === "sent").map((e) => e.timestamp),
    ];
    return intensitySeries(timestamps, 8).map((v, i) => ({ week: `W-${7 - i}`, value: v }));
  }, [data.whatsapps, data.emails]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 h-full">
      <div className="rounded-[24px] p-5 flex flex-col" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        <p className="text-[10px] uppercase tracking-[0.24em] mb-1" style={{ color: LIFE.morningDew }}>Social Intensity · 8 weeks</p>
        <p className="text-white text-2xl font-display font-semibold">{mi.total} <span className="text-white/40 text-sm font-normal">this week</span></p>
        <div className="flex-1 mt-3 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LIFE.pistachio} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={LIFE.pistachio} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "rgba(255,255,255,0.6)" }} />
              <Area type="monotone" dataKey="value" stroke={LIFE.pistachio} fill="url(#pulseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[24px] p-5 flex flex-col gap-4" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] mb-2" style={{ color: LIFE.morningDew }}>Needs attention</p>
          <div className="space-y-1.5">
            {attention.length ? attention.slice(0, 4).map((p) => (
              <div key={p.contact.id} className="flex items-center gap-2 text-[12px]">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: LIFE.urgent }} />
                <span className="text-white/80 truncate">{p.contact.name}</span>
              </div>
            )) : <p className="text-white/35 text-[12px] italic">Nobody overdue.</p>}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <p className="text-[10px] uppercase tracking-[0.24em] mb-2" style={{ color: LIFE.morningDew }}>What stands out</p>
          <div className="space-y-1.5 overflow-auto max-h-[220px] pr-1">
            {(data.insights || []).length ? data.insights.slice(0, 6).map((i) => (
              <div key={i.id} className="rounded-xl p-2.5" style={{ background: DARK.cardSoft }}>
                <p className="text-white/85 text-[12px] font-medium">{i.title}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{i.content}</p>
              </div>
            )) : <p className="text-white/35 text-[12px] italic">Nothing has stood out yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}