import React, { useEffect, useRef } from "react";

const URG = "#d5e24a", SAND = "#94925d", OLIVE = "#d8dab3";

/** SineLayers — drie gelaagde SVG-polylines (urgent / sand / olive) die
 *  audio-reactief meebewegen. Leest band-amplitudes uit een bandsRef (van
 *  useAudio) en updatet de polyline-points direct via refs (geen re-renders). */
export default function SineLayers({ bandsRef, className }) {
  const lines = useRef([]);

  useEffect(() => {
    let raf;
    const loop = () => {
      const bands = bandsRef.current;
      [0, 1, 2].forEach((j) => {
        const amp = (bands[j * 4] || 0.3) * 30 + 6;
        const pts = Array.from({ length: 40 })
          .map((_, i) => `${(i / 39) * 200},${40 + Math.sin(i / 3 + j) * amp}`)
          .join(" ");
        const el = lines.current[j];
        if (el) el.setAttribute("points", pts);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [bandsRef]);

  return (
    <svg viewBox="0 0 200 80" preserveAspectRatio="none" className={className} style={{ height: 90 }}>
      {[0, 1, 2].map((j) => (
        <polyline
          key={j}
          ref={(el) => (lines.current[j] = el)}
          fill="none"
          stroke={[URG, SAND, OLIVE][j]}
          strokeWidth="1.5"
          opacity="0.8"
        />
      ))}
    </svg>
  );
}