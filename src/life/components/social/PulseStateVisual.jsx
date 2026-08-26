import React from "react";

/**
 * PulseOrb — §3.1 de levende hartslag van de sociale pulse.
 * Een centrale ademende orb met concentrische ringen die naar buiten stralen.
 * Intensiteit (meaningful moments) stuurt het aantal stralen en hun helderheid.
 * Dit is het handtekeningsobject van het hele Social-systeem.
 */
export default function PulseStateVisual({ state = "UNKNOWN", mi = { total: 0 }, invitationsCount = 0, plansCount = 0 }) {
  const label = state.replace(/_/g, " ");
  const intensity = Math.min(1, mi.total / 7);
  const rings = [0, 1, 2, 3];
  const straal = Math.min(5, Math.max(1, Math.round(intensity * 5)));

  return (
    <div className="relative flex flex-col items-center justify-center py-10 overflow-hidden">
      {/* concentrische straal-ringen — ademen naar buiten */}
      <div className="relative h-44 w-44 flex items-center justify-center">
        {rings.map((i) => (
          <span
            key={i}
            className="absolute rounded-full border border-olive/30"
            style={{
              width: `${60 + i * 28}px`,
              height: `${60 + i * 28}px`,
              animation: `pulse-straal 3.2s ease-out infinite`,
              animationDelay: `${i * 0.6}s`,
              opacity: intensity > 0.15 ? 1 : 0.15,
            }}
          />
        ))}

        {/* centrale orb — subtiele radiale gloed */}
        <div
          className="relative h-20 w-20 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 35% 30%, hsl(var(--olive) / 0.85), hsl(var(--olive) / 0.45) 60%, hsl(var(--olive) / 0.15) 100%)`,
            boxShadow: `0 0 40px hsl(var(--olive) / ${0.25 + intensity * 0.35}), inset 0 2px 8px rgba(255,255,255,0.25)`,
          }}
        >
          {/* binnenste kern */}
          <div className="h-3 w-3 rounded-full bg-white/80" style={{ animation: "klop 2.4s ease-in-out infinite" }} />
        </div>
      </div>

      {/* label */}
      <p className="mt-7 font-display text-2xl font-bold tracking-tight text-foreground">{label}</p>

      {/* intensiteit-reeks — vijf stralen ipv zeven platte stippen */}
      <div className="mt-4 flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i < straal ? `${6 + i * 2}px` : "5px",
              height: i < straal ? `${6 + i * 2}px` : "5px",
              background: i < straal ? "hsl(var(--olive))" : "hsl(var(--muted))",
              opacity: i < straal ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      {/* context-regels */}
      <div className="mt-5 flex items-center gap-5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-olive" />{mi.total} moments</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-powder" />{invitationsCount} open</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-steel" />{plansCount} planned</span>
      </div>

      <style>{`
        @keyframes pulse-straal {
          0% { transform: scale(0.6); opacity: 0.55; }
          70% { opacity: 0; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes klop {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}