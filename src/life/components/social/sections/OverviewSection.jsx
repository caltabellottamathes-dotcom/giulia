import React from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import PhotoCard from "@/focus/components/projects/PhotoCard";
import StatusBadge from "@/system/components/glass/StatusBadge";
import Avatar from "@/system/components/glass/Avatar";
import SocialRing from "../SocialRing";
import TimeField from "../TimeField";
import QuickAddBar from "../QuickAddBar";
import { IMAGES } from "@/lib/images";
import { PULSE_LABEL, weeklyActivityBars, personalBaseline, contactRecentTrend, daysSince } from "@/lib/domainUtils";
import { Heart, Sparkles, CalendarHeart, Users, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

/** OverviewSection — the whole Social system at a glance, built entirely
 *  from real signals: close-circle contacts, actual weekly activity,
 *  personal baseline, today's time composition, and real plans/moments. */
export default function OverviewSection({ data, mi, circle, attention, activePlans, state, onNavigate, onOpenPerson, reload }) {
  const moments = data.moments || [];
  const bars = weeklyActivityBars({ whatsapps: data.whatsapps, emails: data.emails, events: data.events });
  const maxBar = Math.max(1, ...bars.map((b) => b.count));
  const baseline = personalBaseline({ whatsapps: data.whatsapps, emails: data.emails, events: data.events });
  const baselineVerdict = baseline.current >= baseline.baseline * 1.15 ? "MORE ACTIVE THAN USUAL" : baseline.current <= baseline.baseline * 0.7 ? "QUIETER THAN USUAL" : "ON PACE";

  const todayBlocks = (data.blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === new Date().toDateString() && b.status !== "cancelled");

  const people = [...circle].sort((a, b) => daysSince(a.last_contact_date) - daysSince(b.last_contact_date)).slice(0, 6);
  const changes = people
    .map((c) => ({ c, trend: contactRecentTrend(c.id, data.whatsapps) }))
    .filter((x) => x.trend !== "steady").slice(0, 3);

  const upcoming = [
    ...activePlans.map((p) => ({ id: p.id, title: p.activity, at: p.suggested_date, kind: "plan", status: p.status })),
    ...(data.events || []).filter((e) => e.domain === "life" && new Date(e.start) >= new Date()).map((e) => ({ id: e.id, title: e.title, at: e.start, kind: "event" })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at)).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <GlassPanel level={2} className="lg:col-span-4 p-6 flex flex-col items-center justify-center">
          <SocialRing pct={Math.min(100, mi.total * 10)} size={140} label={mi.total} sub="Meaningful · 7d" />
          <StatusBadge variant={attention.length ? "urgent" : "active"} className="mt-4">{PULSE_LABEL[state] || "Unknown"}</StatusBadge>
        </GlassPanel>

        <GlassPanel level={2} className="lg:col-span-8 p-6 flex flex-col">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <Metric icon={Users} value={circle.length} label="Close circle" onClick={() => onNavigate?.("Relationships")} />
            <Metric icon={CalendarHeart} value={activePlans.length} label="Active plans" onClick={() => onNavigate?.("Planner")} />
            <Metric icon={Sparkles} value={(data.opportunities || []).length} label="Opportunities" onClick={() => onNavigate?.("Planner")} />
            <Metric icon={Heart} value={attention.length} label="Need attention" urgent={attention.length > 0} onClick={() => onNavigate?.("Pulse")} />
          </div>
          <div className="pt-4 border-t border-border/40">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">This week</p>
            <div className="flex items-end gap-2 h-16">
              {bars.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-md bg-muted overflow-hidden flex items-end" style={{ height: 44 }}>
                    <div className={`w-full rounded-md ${b.isToday ? "bg-olive" : "bg-olive/45"}`} style={{ height: `${Math.max(6, (b.count / maxBar) * 100)}%` }} />
                  </div>
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Personal Baseline</p>
          <div className="space-y-2.5">
            <BaselineBar label="Current" value={baseline.current} max={Math.max(baseline.current, baseline.baseline, 1)} color="bg-olive" />
            <BaselineBar label="Baseline" value={baseline.baseline} max={Math.max(baseline.current, baseline.baseline, 1)} color="bg-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground mt-3">{baselineVerdict}</p>
        </GlassPanel>

        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Social Space · Today</p>
          <TimeField blocks={todayBlocks} />
        </GlassPanel>
      </div>

      <GlassPanel level={2} className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Important People</p>
          <QuickAddBar reload={reload} />
        </div>
        {people.length ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {people.map((c) => {
              const since = daysSince(c.last_contact_date);
              const trend = contactRecentTrend(c.id, data.whatsapps);
              return (
                <button key={c.id} onClick={() => onOpenPerson?.(c)} className="shrink-0 w-[132px] text-left rounded-2xl bg-muted/40 p-3.5 hover:bg-muted/60 transition-colors">
                  <Avatar src={c.avatar} name={c.name} size="md" className="mb-2.5" />
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5 capitalize">{c.relationship_type || "Contact"}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{since === Infinity ? "no contact yet" : `${since}d ago`}</span>
                    {trend === "up" && <ArrowUp className="h-2.5 w-2.5 text-olive" />}
                    {trend === "down" && <ArrowDown className="h-2.5 w-2.5 text-urgent" />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : <p className="text-sm text-muted-foreground italic">Start adding people, or let Giulia discover relationships from WhatsApp and email context.</p>}
      </GlassPanel>

      {changes.length > 0 && (
        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Notable Changes</p>
          <div className="flex flex-wrap gap-2">
            {changes.map(({ c, trend }) => (
              <button key={c.id} onClick={() => onOpenPerson?.(c)} className="inline-flex items-center gap-1.5 text-[12px] rounded-full px-3 py-1.5 bg-muted/40 hover:bg-muted/60">
                {trend === "up" ? <ArrowUp className="h-3 w-3 text-olive" /> : <ArrowDown className="h-3 w-3 text-urgent" />}
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground">{trend === "up" ? "more active than usual" : "quieter than usual"}</span>
              </button>
            ))}
          </div>
        </GlassPanel>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Upcoming Social</p>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {upcoming.length ? upcoming.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3.5 py-2.5">
                <CalendarHeart className="h-3.5 w-3.5 text-olive shrink-0" />
                <span className="text-sm flex-1 truncate">{u.title}</span>
                {u.status && <StatusBadge variant={u.status === "confirmed" ? "active" : "waiting"}>{u.status}</StatusBadge>}
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{u.at ? new Date(u.at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</span>
              </div>
            )) : (
              <div className="text-center py-6">
                <p className="text-sm font-medium text-foreground/70">OPEN SPACE</p>
                <div className="h-px w-10 bg-border mx-auto my-2" />
                <p className="text-sm text-muted-foreground italic">Nothing planned yet. Your week has room.</p>
              </div>
            )}
          </div>
        </GlassPanel>

        <PhotoCard src={IMAGES.lifeSocialPulse}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Social Moments</p>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {moments.length ? moments.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3">
                <Heart className="h-3.5 w-3.5 text-olive mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{m.significance} significance · {m.occurred_at ? new Date(m.occurred_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</p>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground italic">Nothing meaningful detected recently.</p>}
          </div>
        </PhotoCard>
      </div>

      {(data.opportunities || []).length > 0 && (
        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Opportunities</p>
          <div className="space-y-2">
            {data.opportunities.map((o) => (
              <div key={o.id} className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-olive shrink-0" /><p className="text-sm font-medium truncate">{o.title}</p></div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{o.reasoning}</p>
                <button onClick={() => onNavigate?.("Planner")} className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold text-olive mt-2">Plan something <ArrowRight className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

function Metric({ icon: Icon, value, label, onClick, urgent }) {
  return (
    <button onClick={onClick} className="text-left group">
      <Icon className={`h-4 w-4 mb-1.5 ${urgent ? "text-urgent" : "text-muted-foreground"}`} strokeWidth={1.7} />
      <p className={`text-3xl font-display font-bold tabular-nums leading-none ${urgent ? "text-urgent" : "group-hover:text-olive transition-colors"}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">{label}</p>
    </button>
  );
}

function BaselineBar({ label, value, max, color }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground uppercase tracking-wide">{label}</span><span className="tabular-nums text-foreground/80">{value}</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(4, (value / max) * 100)}%` }} /></div>
    </div>
  );
}