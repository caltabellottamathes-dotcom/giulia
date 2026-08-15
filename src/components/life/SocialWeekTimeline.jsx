import React from "react";

const DOW = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];
const SAND = "hsl(var(--life-sand))";
const BLUE = "hsl(var(--life-blue))";
const BLUE_DEEP = "hsl(var(--life-blue-deep))";

const startOfWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
};

/** SocialWeekTimeline — horizontale week MON→ZO. Sociale plannen als grote
 *  visuele blocks, vrije dagen als rustige negative space, bezette dagen
 *  gedempt. De leegte ís informatie. */
export default function SocialWeekTimeline({ plans = [], events = [], compact = false, onDayClick }) {
  const start = startOfWeek();
  const days = DOW.map((label, i) => {
    const d = new Date(start.getTime() + i * 86400000);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d.getTime() + 86400000);
    const dayPlans = (plans || []).filter((p) => {
      const t = new Date(p.suggested_date || 0).getTime();
      return t >= d.getTime() && t < next && p.status !== "cancelled";
    });
    const socialBusy = (events || []).some((e) => {
      const s = new Date(e.start).getTime();
      const en = new Date(e.end || e.start).getTime();
      return s < next && en > d.getTime() && e.domain === "life" && e.status !== "cancelled";
    });
    const busy = (events || []).some((e) => {
      const s = new Date(e.start).getTime();
      const en = new Date(e.end || e.start).getTime();
      return s < next && en > d.getTime() && e.domain !== "life";
    });
    return { label, date: d, plans: dayPlans, busy, socialBusy, open: !busy && !socialBusy && dayPlans.length === 0 };
  });

  return (
    <div className={compact ? "grid grid-cols-7 gap-1.5" : "grid grid-cols-7 gap-2"}>
      {days.map((d, i) => {
        const hasPlan = d.plans.length > 0;
        const bodyStyle = hasPlan
          ? { background: SAND, color: "hsl(var(--charcoal))" }
          : d.open
          ? { border: `1px dashed ${BLUE}`, background: "hsl(var(--life-blue) / 0.06)" }
          : { border: "1px solid hsl(var(--foreground) / 0.12)", opacity: 0.55 };
        return (
          <button
            key={i}
            onClick={() => onDayClick?.(d)}
            disabled={!onDayClick}
            className={`flex flex-col gap-1.5 text-left ${onDayClick ? "cursor-pointer hover:opacity-90" : ""}`}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-foreground/55">{d.label}</span>
              <span className="text-[10px] tabular-nums text-foreground/40">{d.date.getDate()}</span>
            </div>
            <div
              className={compact ? "rounded-lg min-h-[64px] p-2 flex flex-col gap-1" : "rounded-2xl min-h-[120px] p-3 flex flex-col gap-1.5"}
              style={bodyStyle}
            >
              {hasPlan ? (
                d.plans.map((p) => (
                  <span key={p.id} className={compact ? "text-[10px] font-semibold uppercase leading-tight truncate" : "text-xs font-semibold uppercase tracking-wide leading-tight line-clamp-3"}>
                    {p.activity}
                  </span>
                ))
              ) : d.open ? (
                <span className={compact ? "text-[9px] text-foreground/45 uppercase tracking-wide" : "text-[10px] text-foreground/45 uppercase tracking-wide self-center mt-auto mb-auto"}>
                  {d.label === "ZA" || d.label === "ZO" ? "Open weekend" : "Open"}
                </span>
              ) : (
                <span className={compact ? "text-[9px] text-foreground/40" : "text-[10px] text-foreground/40 self-center mt-auto mb-auto"}>Bezet</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}