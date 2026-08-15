import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { stateColor, stateLabel, energyColor, levelLabel, fmtAgo } from "@/lib/selfUtils";

const PLUM = "hsl(var(--self-primary))";
const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Daily State widget — grote visuele informatiekaart (2×2).
 *  Full-bleed SELF-foto + donkerplum gradient + dynamische state-headline +
 *  groot energiecijfer + state-ring + 8-punts check-in timeline +
 *  need/capacity strip onderaan. De widget verandert visueel op basis van
 *  de actuele state (calm / charged / low / overwhelmed / neutral). */
export default function DailyStateWidget() {
  const { openModule } = usePanel();
  const { data: checkIns, loading } = useEntityList("SelfCheckIn", { realtime: true, sort: "-timestamp", limit: 20 });

  const latest = useMemo(() => (checkIns || [])[0], [checkIns]);
  const state = latest?.state || "neutral";
  const energy = latest?.energy;
  const capacity = latest?.capacity;
  const need = latest?.needs?.[0];

  // ── Dynamische headline — verandert op basis van de actuele state
  const headline = !latest
    ? "CHECK IN"
    : state === "calm" ? "IN RHYTHM"
    : state === "charged" ? "CHARGED"
    : state === "overwhelmed" ? "OVERLOAD"
    : state === "low" ? "DEPLETED"
    : "STEADY";
  const sub = !latest
    ? "Nog geen meting vandaag"
    : state === "calm" ? "Je bent in een rustige flow"
    : state === "charged" ? "Energie is hoog — maak er gebruik van"
    : state === "overwhelmed" ? "Tijd om terug te trekken"
    : state === "low" ? "Energie is laag — plan rust"
    : "Gebalanceerd moment";

  // ── 8-punts energy timeline (recente check-ins)
  const recent = useMemo(() => {
    const arr = Array.from({ length: 8 }, () => null);
    (checkIns || []).slice(0, 8).forEach((c, i) => { arr[7 - i] = c.energy ?? 0; });
    return arr;
  }, [checkIns]);

  const accent = stateColor(state);
  const lowState = state === "low" || state === "overwhelmed";

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfdailystate")} className="min-h-[280px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden rounded-[inherit]">
        {/* Full-bleed SELF foto */}
        <img src={IMAGES.selfDailyState} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" draggable={false} />
        {/* Donkerplum gradient laag */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, hsl(var(--self-primary) / 0.88) 0%, hsl(var(--self-primary) / 0.58) 45%, hsl(var(--self-primary) / 0.92) 100%)` }} />
        {/* Subtiele ademende achtergrondanimatie */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full animate-pulse-soft pointer-events-none" style={{ background: `radial-gradient(circle, ${lowState ? URGENT : SAGE}22 0%, transparent 70%)` }} />

        <div className="relative z-10 h-full p-6 flex flex-col text-ivory">
          <WidgetHeader label="Daily State" count={latest ? fmtAgo(latest.timestamp) : "—"} />

          {/* Grote state-headline */}
          <h3 className="text-[30px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-2">{headline}</h3>
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-55 mt-1.5">{sub}</p>

          {/* Groot energiecijfer + state-dot */}
          <div className="mt-5 flex items-end gap-4">
            <span className="text-[64px] leading-[0.82] font-display font-semibold tabular-nums tracking-[-0.04em] transition-colors" style={{ color: energyColor(energy) }}>
              {energy != null ? energy : "—"}
            </span>
            <div className="mb-2.5">
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 leading-tight">energy %</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: accent }} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">{stateLabel(state)}</span>
              </div>
            </div>
          </div>

          {/* 8-punts energy timeline */}
          <div className="mt-4 flex items-end gap-1.5 h-10">
            {recent.map((v, i) => (
              <span key={i} className="flex-1 rounded-full transition-all duration-700" style={{
                height: v != null ? `${Math.max(10, (v / 100) * 100)}%` : "10%",
                background: v != null ? energyColor(v) : "currentColor",
                opacity: v != null ? 0.85 : 0.10,
              }} />
            ))}
          </div>

          <div className="flex-1" />
        </div>

        {/* Need + Capacity strip onderaan */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-4 border-t border-ivory/10 flex items-center justify-between" style={{ background: `linear-gradient(to top, hsl(var(--self-primary) / 0.92), transparent)` }}>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Need</p>
            <p className="text-sm font-semibold text-ivory truncate" style={{ color: need ? URGENT : "rgba(255,255,255,0.5)" }}>{need || "Geen specifieke behoefte"}</p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Capacity</p>
            <p className="text-sm font-semibold tabular-nums" style={{ color: energyColor(capacity) }}>{capacity != null ? `${capacity}%` : "—"}</p>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}