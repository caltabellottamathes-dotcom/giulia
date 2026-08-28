import React, { useMemo } from "react";
import { useEntityList } from "@/hooks/useEntity";

const NAME_COLOR = {
  wonen: "#d8dab3",
  gezondheid: "#301728",
  communicatie: "#595c64",
  "dagelijks leven": "#abab69",
  mobiliteit: "#8b8471",
  voorzorg: "#d0d9dd",
};
const colorFor = (name) => {
  const k = String(name || "").toLowerCase();
  for (const key of Object.keys(NAME_COLOR)) if (k.includes(key)) return NAME_COLOR[key];
  return "#9c9c9c";
};

/**
 * FinanceHealthCard — vierkante meter. Blauwe shell met 4 ronde hoeken; grote
 * BOUNCE-dot in het midden (kleur = portefeuille die aandacht nodig heeft);
 * glazen kaart flush tegen de randen met 4 ronde hoeken + schaduw op het blauw,
 * hoogte = health %; grote asymmetrische, half afgekopte ghost-number rechtsonder.
 */
export default function FinanceHealthCard() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });

  const { health, attention } = useMemo(() => {
    const pots = (portfolios || []).filter((p) => p.active !== false && !p.archived);
    if (!pots.length) return { health: 0, attention: "#0a0a0a" };
    let sum = 0;
    let worst = null;
    let worstRatio = 2;
    for (const p of pots) {
      const target = p.target_balance || p.desired_buffer || p.current_balance || 0;
      const fill = target > 0 ? Math.min(100, ((p.current_balance || 0) / target) * 100) : 100;
      sum += fill;
      const ratio = target > 0 ? (p.current_balance || 0) / target : 1;
      if (ratio < worstRatio && ratio < 1) {
        worstRatio = ratio;
        worst = p;
      }
    }
    return {
      health: Math.round(sum / pots.length),
      attention: worst ? worst.color || colorFor(worst.name) : "#0a0a0a",
    };
  }, [portfolios]);

  const message =
    health >= 90 ? "Fully covered" : health >= 70 ? "Strong shape" : health >= 40 ? "You're almost there..." : "Just getting started";

  return (
    <div className="relative w-full h-full rounded-[20px] overflow-hidden" style={{ background: "#b1bfc7" }}>
      {/* Header linksboven (op blauw, boven het glas) */}
      <p className="absolute top-3 left-3 z-30 text-white text-[10px] uppercase tracking-[0.2em] font-light">Financial Health</p>

      {/* Grote BOUNCE-dot in het midden — kleur = aandachtsportefeuille */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div
          className="ontwerp-dot-bounce rounded-full"
          style={{ width: "58%", aspectRatio: "1 / 1", background: attention, boxShadow: "0 10px 30px -8px rgba(0,0,0,0.4)" }}
        />
      </div>

      {/* Glazen kaart — flush, 4 ronde hoeken, donkerder, schaduw op blauw, hoogte = health % */}
      <div
        className="absolute z-10 overflow-hidden"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          top: `${100 - health}%`,
          borderRadius: 16,
          background: "rgba(60,66,74,0.38)",
          backdropFilter: "blur(14px) saturate(1.3)",
          WebkitBackdropFilter: "blur(14px) saturate(1.3)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 -16px 34px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        {/* Bericht linksboven op het glas */}
        <p className="absolute top-3 left-3 text-white/90 text-[11px] font-light" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
          {message}
        </p>

        {/* Grote asymmetrische, half afgekopte ghost-number rechtsonder */}
        <span
          className="absolute font-display font-bold leading-none select-none"
          style={{
            fontSize: "clamp(120px, 22vw, 300px)",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "-0.06em",
            right: "-4%",
            bottom: "-26%",
          }}
        >
          {health}
        </span>
      </div>
    </div>
  );
}