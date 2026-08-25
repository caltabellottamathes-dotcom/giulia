import React, { useEffect, useRef } from "react";

const DEEP = "hsl(var(--d-life-deep))";
const MID = "hsl(var(--d-life-mid))";
const LIGHT = "hsl(var(--d-life-light))";
const URGENT = "hsl(var(--d-life-urgent))";
const MID_Y = 40;
const N = 48;

/** AudioReactiveLife — bloom + volledige-breedte sinus in LIFE-kleuren.
 *  Beweegt ENKEL als de muziek speelt, en dan méé met de audio (WebAudio
 *  AnalyserNode). In rust: rechte lijnen + rustende bloom. */
export default function AudioReactiveLife({ analyserRef, isPlaying, className }) {
  const blob = useRef(null);
  const lines = useRef([]);
  const freq = useRef(null);

  const setRest = () => {
    [0, 1, 2].forEach((j) => {
      const el = lines.current[j];
      if (el) el.setAttribute("points", `0,${MID_Y} 200,${MID_Y}`);
    });
    if (blob.current) {
      blob.current.style.transform = "translate(-50%,-50%) scale(0.7)";
      blob.current.style.opacity = "0.45";
    }
  };

  useEffect(() => {
    if (!isPlaying) { setRest(); return; }
    let raf;
    const loop = () => {
      const an = analyserRef?.current;
      let data = null;
      if (an) {
        if (!freq.current || freq.current.length !== an.frequencyBinCount) {
          freq.current = new Uint8Array(an.frequencyBinCount);
        }
        an.getByteFrequencyData(freq.current);
        data = freq.current;
      }
      const t = performance.now() / 1000;
      const bandAvg = (start, len) => {
        if (!data) return 0;
        let s = 0;
        for (let k = start; k < start + len; k++) s += data[k] || 0;
        return s / len / 255;
      };
      const low = data ? bandAvg(1, 20) : 0.25 + 0.15 * Math.abs(Math.sin(t * 1.5));
      const midB = data ? bandAvg(20, 20) : 0.2 + 0.12 * Math.abs(Math.sin(t * 1.3 + 1));
      const high = data ? bandAvg(44, 20) : 0.18 + 0.1 * Math.abs(Math.sin(t * 1.7 + 2));

      if (blob.current) {
        const s = 0.7 + low * 0.7;
        blob.current.style.transform = `translate(-50%,-50%) scale(${s})`;
        blob.current.style.opacity = String(0.45 + low * 0.45);
        blob.current.style.borderRadius = `${42 + low * 16}% ${58 - low * 16}% ${50 + low * 12}% ${50 - low * 12}% / ${50 + low * 12}% ${50 - low * 12}% ${58 - low * 16}% ${42 + low * 16}%`;
      }
      const bands = [low, midB, high];
      [0, 1, 2].forEach((j) => {
        const amp = bands[j] * 32 + 2;
        const pts = Array.from({ length: N })
          .map((_, i) => {
            const x = (i / (N - 1)) * 200;
            const y = MID_Y + Math.sin(i * 0.5 + j + t * 1.4) * amp;
            return `${x},${y}`;
          })
          .join(" ");
        const el = lines.current[j];
        if (el) el.setAttribute("points", pts);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, analyserRef]);

  return (
    <div className={className}>
      <div
        ref={blob}
        className="absolute left-1/2 top-[36%] h-24 w-24"
        style={{
          background: `radial-gradient(circle at 40% 40%, ${LIGHT}, ${DEEP} 70%)`,
          filter: "blur(8px)",
          transform: "translate(-50%,-50%) scale(0.7)",
        }}
      />
      <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 w-full" style={{ height: "48%" }}>
        {[0, 1, 2].map((j) => (
          <polyline key={j} ref={(el) => (lines.current[j] = el)} fill="none" stroke={[URGENT, MID, LIGHT][j]} strokeWidth="1.5" opacity="0.85" points={`0,${MID_Y} 200,${MID_Y}`} />
        ))}
      </svg>
    </div>
  );
}