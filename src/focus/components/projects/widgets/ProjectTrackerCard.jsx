import React, { useEffect, useState } from "react";

const PLUM = "#301728";
const PISTACHIO = "#d8dab3";
const URGENT = "#d5e24a";
const pad2 = (n) => String(n).padStart(2, "0");

/** ProjectTrackerCard — Focus-versie van FinanceHealthCard. Toont de
 *  algehele projectvoortgang als groot ghost-cijfer op een glaskaart, met een
 *  stuiterende dot (Plum, of Urgent-geel wanneer het project aandacht vraagt)
 *  en de Giulia-insight linksboven. */
export default function ProjectTrackerCard({ progress = 0, insight = "", urgent = false }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 1300;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(progress * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const attention = urgent ? URGENT : PLUM;

  return (
    <div className="relative w-full h-full rounded-[20px] overflow-hidden" style={{ background: "rgba(216,218,179,0.85)" }}>
      <p className="absolute top-3 left-3 z-30 text-[10px] uppercase tracking-[0.2em] font-light" style={{ color: PLUM, opacity: 0.7, textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
        Project Tracker
      </p>

      {/* BounceDot — achter het glas */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="bounce-hard rounded-full" style={{ width: "58%", aspectRatio: "1 / 1", background: attention, boxShadow: "0 10px 30px -8px rgba(0,0,0,0.4)" }} />
      </div>

      {/* Glaskaart — onderste 2/3 */}
      <div
        className="absolute left-0 right-0 bottom-0 z-10 overflow-hidden rounded-b-[20px]"
        style={{ top: "33.33%", background: "rgba(48,23,40,0.34)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 -18px 40px -16px rgba(0,0,0,0.45)" }}
      >
        <p className="absolute top-3 left-3 right-3 text-[11px] font-light leading-snug" style={{ color: "rgba(255,255,255,0.88)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
          {insight || "…"}
        </p>
        <span className="absolute font-display font-bold leading-none select-none" style={{ fontSize: "clamp(120px, 22vw, 300px)", color: "rgba(255,255,255,0.5)", letterSpacing: "-0.06em", right: "-4%", bottom: "-26%" }}>
          {pad2(display)}
        </span>
      </div>
    </div>
  );
}