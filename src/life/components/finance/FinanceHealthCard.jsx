import React, { useMemo } from "react";
import { useEntityList } from "@/hooks/useEntity";

/**
 * FinanceHealthCard — vierkante meter (blauwe shell #b1bfc7) conform referentie:
 * "FINANCIAL HEALTH" header linksboven; grote zwarte cirkel centraal, deels
 * bedekt door het glazen paneel; glazen paneel onderaan met hoogte = health %,
 * bovensnede snijdt de cirkel; bericht linksboven + grote ghost-number
 * rechtsonder. Geen bounce — statische cirkel zoals de referentie.
 */
export default function FinanceHealthCard() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });

  const health = useMemo(() => {
    const pots = (portfolios || []).filter((p) => p.active !== false && !p.archived);
    if (pots.length === 0) return 0;
    const fills = pots.map((p) => {
      const target = p.target_balance || p.desired_buffer || p.current_balance || 0;
      return target > 0 ? Math.min(100, ((p.current_balance || 0) / target) * 100) : 100;
    });
    return Math.round(fills.reduce((s, x) => s + x, 0) / fills.length);
  }, [portfolios]);

  const message =
    health >= 90 ? "Fully covered" : health >= 70 ? "Strong shape" : health >= 40 ? "You're almost there..." : "Just getting started";

  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden" style={{ background: "#b1bfc7" }}>
      {/* Header linksboven (op blauw, boven het glas) */}
      <p className="absolute top-3 left-3 z-20 text-white text-[10px] uppercase tracking-[0.2em] font-light">Financial Health</p>

      {/* Grote zwarte cirkel centraal, achter het glazen paneel */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="rounded-full bg-black" style={{ width: "62%", aspectRatio: "1 / 1" }} />
      </div>

      {/* Glazen paneel — onderaan, hoogte = health %, rechte bovenrand snijdt de cirkel */}
      <div
        className="absolute left-0 right-0 bottom-0 z-10 overflow-hidden"
        style={{
          height: `${health}%`,
          background: "rgba(255,255,255,0.22)",
          backdropFilter: "blur(12px) saturate(1.3)",
          WebkitBackdropFilter: "blur(12px) saturate(1.3)",
          borderTop: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
        }}
      >
        {/* Bericht linksboven op het glas */}
        <p className="absolute top-3 left-3 text-white/90 text-[11px] font-light" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
          {message}
        </p>

        {/* Grote ghost-number rechtsonder */}
        <span
          className="absolute bottom-[-6%] right-2 font-display font-bold leading-none select-none"
          style={{ fontSize: "clamp(54px, 7vw, 120px)", color: "rgba(255,255,255,0.55)", letterSpacing: "-0.05em" }}
        >
          {health}
        </span>
      </div>
    </div>
  );
}