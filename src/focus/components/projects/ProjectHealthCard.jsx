import React, { useEffect, useState } from "react";

const pad2 = (n) => String(n).padStart(2, "0");

/** ProjectHealthCard — adaptatie van FinanceHealthCard. Toont de
 *  projectvoortgang als een groot ghost-cijfer op een glaskaart, met een
 *  stuiterende aandachts-kleur erachter en een Giulia-insight linksboven.
 *  Vierkante meter, zelfde visuele taal als het financiële health-widget. */
export default function ProjectHealthCard({ progress = 0, insight = "", accent = "hsl(var(--olive))" }) {
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

  return (
    <div className="relative w-full h-full rounded-[20px] overflow-hidden" style={{ background: "rgba(176,188,194,0.92)" }}>
      <p className="absolute top-3 left-3 z-30 text-white/80 text-[10px] uppercase tracking-[0.2em] font-light" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
        Project Voortgang
      </p>

      {/* BounceDot — achter het glas, stuitert harder */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div
          className="bounce-hard rounded-full"
          style={{ width: "58%", aspectRatio: "1 / 1", background: accent, boxShadow: "0 10px 30px -8px rgba(0,0,0,0.4)" }}
        />
      </div>

      {/* Glaskaart — statisch, bedekt onderste 2/3 */}
      <div
        className="absolute left-0 right-0 bottom-0 z-10 overflow-hidden rounded-b-[20px]"
        style={{
          top: "33.33%",
          background: "rgba(118,118,118,0.30)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow: "0 -18px 40px -16px rgba(0,0,0,0.45)",
        }}
      >
        <p className="absolute top-3 left-3 right-3 text-white/85 text-[11px] font-light leading-snug" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
          {insight || "…"}
        </p>
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
          {pad2(display)}
        </span>
      </div>
    </div>
  );
}