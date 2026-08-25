import React, { useEffect, useRef } from "react";

const DEEP = "hsl(var(--d-life-deep))";
const MID = "hsl(var(--d-life-mid))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "hsl(var(--d-life-urgent))";

const env = (t, ph = 0) => {
  const b = Math.max(0, Math.sin(t * 0.8 + ph));
  return 0.35 + 0.65 * b * (0.45 + 0.55 * Math.abs(Math.sin(t * 3.1 + ph)));
};

/** AudioReactiveLife — een audio-reactieve bloom + gelaagde sinus in
 *  LIFE-kleuren (deep / mid / light / urgent). Beweging is gesimuleerd
 *  (ademende envelope); `playing` maakt de beweging energieker. */
export default function AudioReactiveLife({ playing = true, className }) {
  const blob = useRef(null);
  const lines = useRef([]);

  useEffect(() => {
    let raf;
    const loop = () => {
      const t = performance.now() / 1000;
      const boost = playing ? 1.35 : 1;
      const v = env(t) * boost;
      if (blob.current) {
        blob.current.style.transform = `translate(-50%, -50%) scale(${0.7 + v * 0.55})`;
        blob.current.style.opacity = String(0.4 + v * 0.5);
        blob.current.style.borderRadius = `${42 + v * 12}% ${58 - v * 12}% ${50 + v * 10}% ${50 - v * 10}% / ${50 + v * 10}% ${50 - v * 10}% ${58 - v * 12}% ${42 + v * 12}%`;
      }
      [0, 1, 2].forEach((j) => {
        const amp = env(t, j * 0.7) * boost * 26 + 5;
        const pts = Array.from({ length: 40 })
          .map((_, i) => `${(i / 39) * 200},${40 + Math.sin(i / 3 + j + t * 0.6) * amp}`)
          .join(" ");
        const el = lines.current[j];
        if (el) el.setAttribute("points", pts);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <div className={className}>
      <div
        ref={blob}
        className="absolute left-1/2 top-[42%] h-28 w-28"
        style={{
          background: `radial-gradient(circle at 40% 40%, ${LIGHT}, ${DEEP} 70%)`,
          filter: "blur(8px)",
          transform: "translate(-50%,-50%) scale(0.7)",
        }}
      />
      <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 w-full" style={{ height: "46%" }}>
        {[0, 1, 2].map((j) => (
          <polyline key={j} ref={(el) => (lines.current[j] = el)} fill="none" stroke={[URGENT, MID, LIGHT][j]} strokeWidth="1.5" opacity="0.85" />
        ))}
      </svg>
    </div>
  );
}