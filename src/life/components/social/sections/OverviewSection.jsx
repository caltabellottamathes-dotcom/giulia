import React from "react";
import { Link } from "react-router-dom";
import GlassPanel from "@/system/components/glass/GlassPanel";
import PhotoCard from "@/focus/components/projects/PhotoCard";
import StatusBadge from "@/system/components/glass/StatusBadge";
import Avatar from "@/system/components/glass/Avatar";
import SocialRing from "../SocialRing";
import { IMAGES } from "@/lib/images";
import { PULSE_LABEL, weeklyActivityBars, contactRecentTrend, daysSince } from "@/lib/domainUtils";
import { Heart, Sparkles, CalendarHeart, Users, ArrowUp, ArrowDown } from "lucide-react";

/** OverviewSection — the whole Social system at a glance, built entirely
 *  from real signals: actual close-circle contacts, actual weekly WhatsApp
 *  /email/calendar activity, and actual SocialPlans/CalendarEvents. */
export default function OverviewSection({ data, mi, circle, attention, activePlans, state, onNavigate }) {
  const moments = data.moments || [];
  const bars = weeklyActivityBars({ whatsapps: data.whatsapps, emails: data.emails, events: data.events });
  const maxBar = Math.max(1, ...bars.map((b) => b.count));

  const people = [...circle]
    .sort((a, b) => daysSince(a.last_contact_date) - daysSince(b.last_contact_date))
    .slice(0, 6);

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

      <GlassPanel level={2} className="p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Important People</p>
        {people.length ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {people.map((c) => {
              const since = daysSince(c.last_contact_date);
              const trend = contactRecentTrend(c.id, data.whatsapps);
              return (
                <Link key={c.id} to={`/people/${c.id}`} className="shrink-0 w-[132px] rounded-2xl bg-muted/40 p-3.5 hover:bg-muted/60 transition-colors">
                  <Avatar src={c.avatar} name={c.name} size="md" className="mb-2.5" />
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5 capitalize">{c.relationship_type || "Contact"}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">{since === Infinity ? "no contact yet" : `${since}d ago`}</span>
                    {trend === "up" && <ArrowUp className="h-2.5 w-2.5 text-olive" />}
                    {trend === "down" && <ArrowDown className="h-2.5 w-2.5 text-urgent" />}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : <p className="text-sm text-muted-foreground italic">Start adding people, or let Giulia discover relationships from WhatsApp and email context.</p>}
      </GlassPanel>

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
            )) : <p className="text-sm text-muted-foreground italic">Nothing planned yet. Your week has room.</p>}
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