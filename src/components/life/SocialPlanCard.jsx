import React from "react";
import { Clock, MapPin, Users, Check, X, CalendarHeart, CheckCircle2 } from "lucide-react";

const SAND = "hsl(var(--life-sand))";
const SAND_DEEP = "hsl(var(--life-sand-deep))";
const BLUE_DEEP = "hsl(var(--life-blue-deep))";

const STATUS = {
  confirmed: { label: "Bevestigd", bg: SAND, color: "hsl(var(--charcoal))" },
  planned: { label: "Uitgenodigd", bg: "hsl(var(--life-blue) / 0.16)", color: BLUE_DEEP },
  tentative: { label: "Voorlopig", bg: "transparent", color: "hsl(var(--foreground) / 0.7)", border: true },
  done: { label: "Voltooid", bg: "hsl(var(--foreground) / 0.06)", color: "hsl(var(--muted-foreground))" },
  cancelled: { label: "Geannuleerd", bg: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))" },
};

/** SocialPlanCard — grote datum, activiteit, personen, tijd, status. Editorial. */
export default function SocialPlanCard({ plan, contactName, onOpen, onConfirm, onCancel, onDone, selected, compact }) {
  if (!plan) return null;
  const d = new Date(plan.suggested_date);
  const day = d.toLocaleDateString("nl-NL", { weekday: "long" });
  const dayN = d.getDate();
  const time = d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  const people = (plan.contact_ids || []).map(contactName).filter((x) => x && x !== "—");
  const st = STATUS[plan.status] || STATUS.planned;

  return (
    <button
      onClick={onOpen}
      className={`w-full text-left rounded-2xl p-5 transition-all ${selected ? "ring-2" : "ring-0"} hover:-translate-y-0.5`}
      style={{
        background: compact ? "hsl(var(--card))" : "hsl(var(--card))",
        boxShadow: "0 18px 44px -28px rgba(0,0,0,0.30)",
        ...(selected ? { boxShadow: `0 18px 44px -22px rgba(0,0,0,0.30), 0 0 0 2px ${BLUE_DEEP}` } : {}),
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-foreground/45">{day}</p>
          <p className="text-[56px] leading-[0.85] font-display font-semibold tracking-[-0.04em] text-foreground tabular-nums mt-1">{dayN}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-wide font-semibold" style={{ background: st.bg, color: st.color, border: st.border ? `1px solid ${SAND_DEEP}` : "none" }}>{st.label}</span>
        </div>
      </div>

      <h3 className="text-2xl font-display font-semibold tracking-tight text-foreground mt-4 uppercase">{plan.activity}</h3>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-sm text-foreground/65">
        {people.length > 0 && <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" style={{ color: BLUE_DEEP }} /> {people.join(" · ")}</span>}
        <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" style={{ color: BLUE_DEEP }} /> {time}</span>
        {plan.notes && <span className="inline-flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5" style={{ color: BLUE_DEEP }} /> {plan.notes}</span>}
      </div>

      {onConfirm || onCancel || onDone ? (
        <div className="flex gap-2 mt-4 pt-4 border-t border-foreground/8">
          {plan.status === "planned" && onConfirm && <span onClick={(e) => { e.stopPropagation(); onConfirm(plan); }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition" style={{ background: SAND, color: "hsl(var(--charcoal))" }}><Check className="w-3.5 h-3.5" /> Bevestig</span>}
          {plan.status !== "done" && plan.status !== "cancelled" && onDone && <span onClick={(e) => { e.stopPropagation(); onDone(plan); }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-foreground/15 text-foreground/70 hover:bg-foreground/5 transition"><CheckCircle2 className="w-3.5 h-3.5" /> Voltooid</span>}
          {onCancel && <span onClick={(e) => { e.stopPropagation(); onCancel(plan); }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/50 hover:text-destructive transition"><X className="w-3.5 h-3.5" /> Annuleer</span>}
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-foreground/40"><CalendarHeart className="w-3.5 h-3.5" /> Details</span>
        </div>
      ) : null}
    </button>
  );
}