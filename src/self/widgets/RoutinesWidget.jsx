import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { todayRoutines, completedToday } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Routines widget — grote visuele informatiekaart (2×2).
 *  Split-layout: links groot voortgangscijfer + dynamische headline,
 *  rechts verticale routine-bars (voltooid = sage, open = outline),
 *  onderaan SELF-foto strip met streak. Verandert visueel op basis
 *  van hoeveel routines vandaag al voltooid zijn. */
export default function RoutinesWidget() {
  const { openModule } = usePanel();
  const { data: routines, loading } = useEntityList("SelfRoutine", { realtime: true });

  const today = useMemo(() => todayRoutines(routines || []), [routines]);
  const done = useMemo(() => completedToday(routines || []), [routines]);
  const total = today.length;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  const bestStreak = useMemo(() => (routines || []).reduce((m, r) => Math.max(m, r.streak_count || 0), 0), [routines]);

  // ── Dynamische headline
  const headline = !total ? "NO RHYTHM"
    : pct === 100 ? "COMPLETE"
    : pct >= 60 ? "IN FLOW"
    : pct >= 30 ? "BUILDING"
    : "JUST STARTED";
  const sub = !total ? "Nog geen routines ingesteld"
    : pct === 100 ? "Alles vandaag voltooid"
    : `${done.length} van ${total} gedaan`;

  return (
    <WidgetShell size="2x2" radius="xl" interactive onClick={() => openModule("selfroutines")} className="min-h-[280px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden rounded-[inherit]">
        <img src={IMAGES.selfRoutines} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" draggable={false} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, hsl(var(--self-primary) / 0.90) 0%, hsl(var(--self-primary) / 0.58) 45%, hsl(var(--self-primary) / 0.92) 100%)` }} />

        <div className="relative z-10 grid grid-cols-[0.82fr_1.18fr] h-full">
          {/* Links — groot cijfer + headline */}
          <div className="p-6 flex flex-col text-ivory border-r border-ivory/10">
            <WidgetHeader label="Routines" count={total ? `${done.length}/${total}` : "—"} />
            <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-2">{headline}</h3>
            <p className="text-[11px] uppercase tracking-[0.18em] opacity-55 mt-1.5">{sub}</p>
            <div className="flex-1" />
            <div className="flex items-end gap-3">
              <span className="text-[56px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" style={{ color: pct === 100 ? SAGE : "hsl(var(--self-accent))" }}>{pct}<span className="text-[28px]">%</span></span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1">voltooid vandaag</p>
          </div>

          {/* Rechts — verticale routine-bars (visueel data-element) */}
          <div className="p-6 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/45 font-semibold mb-4">Vandaag</p>
            {loading ? (
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            ) : total ? (
              <div className="flex items-end gap-2 h-32">
                {today.slice(0, 8).map((r) => {
                  const isDone = r.status === "completed";
                  return (
                    <div key={r.id} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                      <div className="w-full rounded-full flex items-end overflow-hidden" style={{ height: "100%" }}>
                        <div className="w-full rounded-full transition-all duration-700" style={{
                          height: isDone ? "100%" : "28%",
                          background: isDone ? SAGE : "rgba(255,255,255,0.14)",
                          border: isDone ? "none" : "1px solid rgba(255,255,255,0.18)",
                        }} />
                      </div>
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: isDone ? SAGE : "transparent", border: isDone ? "none" : "1px solid rgba(255,255,255,0.25)" }} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm italic text-ivory/45">Geen routines vandaag.</p>
            )}
          </div>
        </div>

        {/* Onderaan — streak strip over foto */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-4 border-t border-ivory/10 flex items-center justify-between" style={{ background: `linear-gradient(to top, hsl(var(--self-primary) / 0.92), transparent)` }}>
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Beste streak</p>
            <p className="text-sm font-semibold text-ivory">{bestStreak > 0 ? `${bestStreak} dagen` : "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Resterend</p>
            <p className="text-sm font-semibold tabular-nums" style={{ color: total - done.length > 0 ? URGENT : SAGE }}>{total - done.length}</p>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}