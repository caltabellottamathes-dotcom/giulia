import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { fmtDate, fmtTime } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Therapy widget — grote visuele informatiekaart (1×2, hoog/smal).
 *  Full-bleed introspectiefoto + donkerplum gradient + grote SVG
 *  voortgangsring als dominant visueel element + dynamische headline +
 *  volgende afspraak onderaan. Verticale compositie voor een contemplatief
 *  onderwerp. */
export default function TherapyWidget() {
  const { openModule } = usePanel();
  const { data: trajectories, loading } = useEntityList("TherapyTrajectory", { realtime: true });

  const active = useMemo(() => (trajectories || []).filter((t) => t.status === "active"), [trajectories]);
  const avgProgress = useMemo(() => {
    if (!active.length) return 0;
    const total = active.reduce((s, t) => s + (t.progress || 0), 0);
    return Math.round(total / active.length);
  }, [active]);
  const openGoals = useMemo(() => active.reduce((n, t) => n + (t.goals?.length || 0), 0), [active]);
  const next = useMemo(() => active.filter((t) => t.next_appointment).sort((a, b) => new Date(a.next_appointment) - new Date(b.next_appointment))[0], [active]);

  // ── Dynamische headline
  const headline = !active.length ? "NO PATH" : next ? "IN SESSION" : avgProgress > 50 ? "PROGRESSING" : "EARLY DAYS";
  const sub = !active.length ? "Geen actief traject"
    : next ? `Volgende: ${fmtDate(next.next_appointment)}`
    : `${active.length} traject${active.length > 1 ? "en" : ""} lopen`;

  // SVG ring berekening
  const R = 52, C = 2 * Math.PI * R;
  const offset = C - (avgProgress / 100) * C;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selftherapy")} className="min-h-[340px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden rounded-[inherit]">
        <img src={IMAGES.selfTherapy} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" draggable={false} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, hsl(var(--self-primary) / 0.82) 0%, hsl(var(--self-primary) / 0.55) 40%, hsl(var(--self-primary) / 0.92) 100%)` }} />

        <div className="relative z-10 h-full p-6 flex flex-col text-ivory">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Therapy</h3>
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold tabular-nums" style={{ color: SAGE }}>{active.length} actief</span>
          </div>

          {/* ── Grote voortgangsring — dominant visueel data-element */}
          <div className="flex-1 flex items-center justify-center py-4">
            <div className="relative w-[140px] h-[140px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="8" />
                <circle cx="60" cy="60" r={R} fill="none" stroke={SAGE} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]">{avgProgress}<span className="text-[22px]">%</span></span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-ivory/50 mt-1.5">voortgang</span>
              </div>
            </div>
          </div>

          {/* Headline */}
          <h3 className="text-[24px] leading-[1.0] font-display font-semibold tracking-[-0.02em]">{headline}</h3>
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-55 mt-1.5">{sub}</p>
        </div>

        {/* Onderaan — volgende afspraak + goals */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-4 border-t border-ivory/10" style={{ background: `linear-gradient(to top, hsl(var(--self-primary) / 0.92), transparent)` }}>
          {next ? (
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Volgende sessie</p>
              <p className="text-sm font-semibold text-ivory truncate">{next.title}</p>
              <p className="text-[11px] text-ivory/60">{fmtDate(next.next_appointment)} · {fmtTime(next.next_appointment)}</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Open doelen</p>
                <p className="text-sm font-semibold text-ivory">{openGoals}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Trajecten</p>
                <p className="text-sm font-semibold tabular-nums" style={{ color: SAGE }}>{active.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}