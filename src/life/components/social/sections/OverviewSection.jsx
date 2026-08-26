import React from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import PhotoCard from "@/focus/components/projects/PhotoCard";
import StatusBadge from "@/system/components/glass/StatusBadge";
import SocialRing from "../SocialRing";
import { IMAGES } from "@/lib/images";
import { PULSE_LABEL } from "@/lib/domainUtils";
import { Heart, Sparkles, CalendarHeart, Users } from "lucide-react";

/** OverviewSection — the whole Social system at a glance: pulse ring, key
 *  metrics (each linking to its own tab), auto-promoted Social Moments and
 *  detected Opportunities. */
export default function OverviewSection({ data, mi, circle, attention, activePlans, state, onNavigate }) {
  const moments = data.moments || [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <GlassPanel level={2} className="lg:col-span-4 p-6 flex flex-col items-center justify-center">
          <SocialRing pct={Math.min(100, mi.total * 10)} size={140} label={mi.total} sub="Meaningful · 7d" />
          <StatusBadge variant={attention.length ? "urgent" : "active"} className="mt-4">{PULSE_LABEL[state] || "Unknown"}</StatusBadge>
        </GlassPanel>
        <GlassPanel level={2} className="lg:col-span-8 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Metric icon={Users} value={circle.length} label="Close circle" onClick={() => onNavigate?.("Relationships")} />
          <Metric icon={CalendarHeart} value={activePlans.length} label="Active plans" onClick={() => onNavigate?.("Planner")} />
          <Metric icon={Sparkles} value={(data.opportunities || []).length} label="Opportunities" onClick={() => onNavigate?.("Planner")} />
          <Metric icon={Heart} value={attention.length} label="Need attention" urgent={attention.length > 0} onClick={() => onNavigate?.("Pulse")} />
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PhotoCard src={IMAGES.lifeSocialPulse}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Social Moments</p>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {moments.length ? moments.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3">
                <Heart className="h-3.5 w-3.5 text-olive mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.title}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{m.significance} significance · {m.occurred_at ? new Date(m.occurred_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</p>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground italic">No moments captured yet.</p>}
          </div>
        </PhotoCard>

        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Opportunities</p>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {(data.opportunities || []).length ? data.opportunities.map((o) => (
              <div key={o.id} className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-olive shrink-0" /><p className="text-sm font-medium truncate">{o.title}</p></div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{o.reasoning}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground italic">Nothing surfaced — that's fine.</p>}
          </div>
        </GlassPanel>
      </div>
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