import React, { useMemo, useState, useEffect } from "react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { adminWeather, comingUp, overdueList, daysUntil, fmtDate } from "@/lib/adminUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0a68f996a_ADMIN.jpeg";
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "#d5e24a";
const IVORY = "hsl(var(--ivory))";

const LIFE_COLORS = ["#b1bec6", "#cfd9dd", "#d8dab3", "#94925d"];
const DAY = 86400000, HOUR = 3600000, MIN = 60000;

const isUrgent = (o) => {
  const d = daysUntil(o.due_date);
  return d != null && (d < 0 || d <= 1);
};

/** ThingsHandleWidget — P·2x3·B·SIDE · "Things to Handle!"
 *  Admin-foto + glas met verticale tijdlijn: komende verplichtingen op volgorde
 *  van deadline (binnenst boven), met naam + aftelklok (dagen/uren/minuten).
 *  LIFE-kleuren per item; Urgent #d5e24a verschijnt (en pulstert) zodra iets
 *  urgent wordt. Data: AdminObligation. */
export default function ThingsHandleWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: obs } = useEntityList("AdminObligation", { realtime: true, externalTick: learnTick });

  const weather = useMemo(() => adminWeather(obs || []), [obs]);
  const coming = useMemo(() => comingUp(obs || []).slice(0, 5), [obs]);
  const overdue = useMemo(() => overdueList(obs || []), [obs]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const countdown = (dueDate) => {
    if (!dueDate) return "—";
    const diff = new Date(dueDate).getTime() - now;
    if (diff <= 0) return `${Math.abs(Math.floor(diff / DAY))}d te laat`;
    const d = Math.floor(diff / DAY);
    const h = Math.floor((diff % DAY) / HOUR);
    const m = Math.floor((diff % HOUR) / MIN);
    return `${d}d ${h}u ${m}m`;
  };

  return (
    <div className="relative w-full aspect-[2/3] rounded-[28px] overflow-hidden" onClick={() => openModule("personaladmin")} style={{ cursor: "pointer" }}>
      <img src={PHOTO} alt="Things to Handle" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-3 flex flex-col" style={{ color: IVORY, height: "34%", background: "linear-gradient(to bottom, rgba(0,0,0,0.42), rgba(0,0,0,0))" }}>
        <WidgetHeader type="briefing" label="Things to Handle!" count={weather.counts.coming ? String(weather.counts.coming) : "—"} />
        <h3 className="text-[18px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{weather.headline}</h3>
        <p className="text-[10px] uppercase tracking-[0.16em] mt-1" style={{ color: LIGHT }}>{weather.sub}</p>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[66%] bg-gradient-to-t from-black/52 via-black/24 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 h-[66%] rounded-t-[28px] flex flex-col p-3.5 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[9px] uppercase tracking-[0.22em] font-bold" style={{ color: LIGHT }}>Tijdlijn</span>
          {overdue.length > 0 && <span className="text-[8px] uppercase tracking-[0.14em] font-bold px-2 py-0.5 rounded-full" style={{ background: URGENT + "22", color: URGENT, border: `1px solid ${URGENT}55` }}>{overdue.length} te laat</span>}
        </div>

        {/* verticale tijdlijn — binnenst boven, met aftelklok per item */}
        <div className="relative flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: "rgba(255,255,255,0.18)" }} />
          {coming.length === 0 ? (
            <p className="text-[11px] py-2" style={{ color: "rgba(255,255,255,0.6)" }}>Alles is bij — niets op komst.</p>
          ) : (
            <div className="space-y-2.5">
              {coming.map((o, i) => {
                const urgent = isUrgent(o);
                const color = urgent ? URGENT : LIFE_COLORS[i % LIFE_COLORS.length];
                return (
                  <div key={o.id} className="flex items-start gap-2.5">
                    <span className={`relative z-10 mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${urgent ? "animate-pulse-soft" : ""}`} style={{ background: color, boxShadow: urgent ? `0 0 10px ${color}` : "none" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] truncate" style={{ color: IVORY }}>{o.title}</span>
                        <span className="text-[9px] tabular-nums shrink-0 font-semibold" style={{ color: urgent ? URGENT : "rgba(255,255,255,0.78)" }}>{countdown(o.due_date)}</span>
                      </div>
                      <span className="text-[8px] uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.45)" }}>{fmtDate(o.due_date)}{o.recurrence && o.recurrence !== "none" ? ` · ${o.recurrence}` : ""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}