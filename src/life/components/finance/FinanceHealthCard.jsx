import React, { useMemo } from "react";
import { useEntityList } from "@/hooks/useEntity";

/**
 * FinanceHealthCard — blauwe shell (#b1bfc7) met een grote zwarte bounce-dot in
 * het midden. Een glazen kaart met 4 ronde hoeken, flush tegen de zijden, waarvan
 * de hoogte = het % overall health van je financiën. Het percentage staat als
 * grote ghost-number op de glazen kaart.
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

  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden" style={{ background: "#b1bfc7" }}>
      {/* Glazen kaart — flush tegen de zijden, hoogte = health % */}
      <div
        className="absolute left-0 right-0 bottom-0 overflow-hidden"
        style={{
          height: `${health}%`,
          background: "rgba(255,255,255,0.22)",
          backdropFilter: "blur(12px) saturate(1.3)",
          WebkitBackdropFilter: "blur(12px) saturate(1.3)",
          border: "1px solid rgba(255,255,255,0.45)",
          borderRadius: "18px",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
        }}
      >
        {/* Ghost number */}
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-bold leading-none select-none"
          style={{ fontSize: "clamp(64px, 9vw, 150px)", color: "rgba(0,0,0,0.14)", letterSpacing: "-0.05em" }}
        >
          {health}
        </span>
      </div>

      {/* Grote zwarte bounce-dot in het midden */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <span
          className="ontwerp-dot-bounce rounded-full bg-black"
          style={{ width: "clamp(26px, 2.6vw, 46px)", height: "clamp(26px, 2.6vw, 46px)", boxShadow: "0 10px 26px -8px rgba(0,0,0,0.45)" }}
        />
      </div>
    </div>
  );
}