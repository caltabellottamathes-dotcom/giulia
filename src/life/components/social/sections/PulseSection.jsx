import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import GlassPanel from "@/system/components/glass/GlassPanel";
import PulseStateVisual from "../PulseStateVisual";
import RhythmGrid from "../RhythmGrid";
import { intensitySeries, socialHeatmap, socialChangeCompare } from "@/lib/domainUtils";
import { MessageCircle, Mail, CalendarHeart, ArrowUp, ArrowDown } from "lucide-react";

const SOURCE_ICON = { whatsapp: MessageCircle, email: Mail, calendar: CalendarHeart };

/** PulseSection — §3 what's happening right now: central state, activity
 *  timeline, intensity chart, heatmap, invitations and week-over-week change. */
export default function PulseSection({ data, mi, attention = [], state }) {
  const series = useMemo(() => {
    const timestamps = [
      ...(data.whatsapps || []).filter((m) => m.direction === "sent").map((m) => m.timestamp),
      ...(data.emails || []).filter((e) => e.folder === "sent" || e.status === "sent").map((e) => e.timestamp),
    ];
    return intensitySeries(timestamps, 8).map((v, i) => ({ week: `W-${7 - i}`, value: v }));
  }, [data.whatsapps, data.emails]);

  const grid = useMemo(() => socialHeatmap({ whatsapps: data.whatsapps, emails: data.emails, events: data.events }), [data.whatsapps, data.emails, data.events]);
  const change = useMemo(() => socialChangeCompare({ whatsapps: data.whatsapps, emails: data.emails, events: data.events }), [data.whatsapps, data.emails, data.events]);

  const timeline = useMemo(() => {
    const items = [
      ...(data.whatsapps || []).slice(0, 20).map((m) => ({ id: `w-${m.id}`, source: "whatsapp", label: m.direction === "sent" ? "WhatsApp sent" : "WhatsApp received", at: m.timestamp })),
      ...(data.emails || []).filter((e) => e.folder === "sent").slice(0, 10).map((e) => ({ id: `e-${e.id}`, source: "email", label: e.subject, at: e.timestamp })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 10);
    return items;
  }, [data.whatsapps, data.emails]);

  const invitations = (data.intentions || []).filter((i) => i.kind === "respond_invitation");

  return (
    <div className="space-y-4">
      <GlassPanel level={2} className="p-2"><PulseStateVisual state={state} mi={mi} invitationsCount={invitations.length} plansCount={data.plans.filter((p) => ["proposed", "planned", "confirmed"].includes(p.status)).length} /></GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <GlassPanel level={2} className="p-5 flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Activity timeline</p>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 mb-4">
            {timeline.length ? timeline.map((t) => {
              const Icon = SOURCE_ICON[t.source] || MessageCircle;
              return (
                <div key={t.id} className="flex items-center gap-2.5 text-[12px]">
                  <Icon className="h-3 w-3 text-olive shrink-0" />
                  <span className="text-foreground/80 truncate flex-1">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{new Date(t.at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground italic">Nothing recorded yet.</p>}
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Social Intensity · 8 weeks</p>
          <div className="flex-1 min-h-[160px]">
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

        <div className="flex flex-col gap-4">
          <GlassPanel level={2} className="p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Rhythm Grid · 3 weeks</p>
            <RhythmGrid grid={grid} />
          </GlassPanel>

          <GlassPanel level={2} className="p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Social Change</p>
            <div className="flex items-center gap-3">
              <div className="flex-1"><p className="text-[10px] text-muted-foreground">Last week</p><p className="text-lg font-display font-semibold tabular-nums">{change.lastWeek}</p></div>
              <div className="flex-1"><p className="text-[10px] text-muted-foreground">This week</p><p className="text-lg font-display font-semibold tabular-nums">{change.thisWeek}</p></div>
              <span className={`inline-flex items-center gap-1 text-sm font-semibold ${change.deltaPct >= 0 ? "text-olive" : "text-urgent"}`}>
                {change.deltaPct >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}{Math.abs(change.deltaPct)}%
              </span>
            </div>
          </GlassPanel>

          <GlassPanel level={2} className="p-5 flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Needs attention</p>
            <div className="space-y-1.5 mb-3">
              {attention.length ? attention.slice(0, 4).map((p) => (
                <div key={p.contact.id} className="flex items-center gap-2 text-[12px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-urgent shrink-0" />
                  <span className="text-foreground/80 truncate">{p.contact.name}</span>
                </div>
              )) : <p className="text-muted-foreground text-[12px] italic">Nobody overdue.</p>}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Invitations</p>
            <div className="space-y-1.5">
              {invitations.length ? invitations.map((i) => (
                <div key={i.id} className="rounded-lg bg-muted/40 p-2 text-[12px]">{i.description}</div>
              )) : <p className="text-muted-foreground text-[12px] italic">None open right now.</p>}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}