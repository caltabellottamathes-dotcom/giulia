import React, { useEffect, useRef } from "react";

/* Blauwere sine-palette (licht / mid / diep) + bijpassende bloom. */
const BLOOM_LIGHT = "#c6d3de";
const BLOOM_DEEP = "#5d7388";
const LINE_LIGHT = "#c6d3de";
const LINE_MID = "#8fa3b6";
const LINE_DEEP = "#5f758a";

const MID_Y = 40;
const N = 40; // minder punten → minder, grotere golven
const FREQ = 0.25; // lage frequentie: ~1.5 golven over de volle breedte

/** AudioReactiveLife — bloom + volledige-breedte sinus, beide gecentreerd
 *  op het midden (lager in het midden). De sinus loopt exact door het
 *  midden van de bloom. Beweegt ENKEL als de muziek speelt, méé met de
 *  audio (WebAudio AnalyserNode). In rust: rechte lijnen + rustende
 *  bloom. Sinus is blauwer, groter, met minder maar grotere golven. */
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
      blob.current.style.transform = "translate(-50%,-50%) scale(0.72)";
      blob.current.style.opacity = "0.5";
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

      // bloom — schaalt mee met de lage band
      if (blob.current) {
        const s = 0.72 + low * 0.6;
        blob.current.style.transform = `translate(-50%,-50%) scale(${s})`;
        blob.current.style.opacity = String(0.5 + low * 0.4);
        blob.current.style.borderRadius = `${44 + low * 14}% ${56 - low * 14}% ${50 + low * 10}% ${50 - low * 10}% / ${50 + low * 10}% ${50 - low * 10}% ${56 - low * 14}% ${44 + low * 14}%`;
      }
      // sinus — drie blauwe lijnen, volledige breedte, minder & grotere golven
      const bands = [low, midB, high];
      [0, 1, 2].forEach((j) => {
        const amp = bands[j] * 34 + 3; // groter
        const pts = Array.from({ length: N })
          .map((_, i) => {
            const x = (i / (N - 1)) * 200;
            const y = MID_Y + Math.sin(i * FREQ + j * 0.9 + t * 1.1) * amp;
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
    <div className={className} style={{ pointerEvents: "none" }}>
      {/* bloom — lager in het midden */}
      <div
        ref={blob}
        className="absolute left-1/2 top-[52%] h-52 w-52"
        style={{
          background: `radial-gradient(circle at 40% 40%, ${BLOOM_LIGHT}, ${BLOOM_DEEP} 70%)`,
          filter: "blur(10px)",
          transform: "translate(-50%,-50%) scale(0.72)",
        }}
      />
      {/* sinus — volledige breedte, exact door het midden van de bloom (52%) */}
      <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="absolute inset-x-0 top-[52%] w-full -translate-y-1/2" style={{ height: "26%" }}>
        {[0, 1, 2].map((j) => (
          <polyline key={j} ref={(el) => (lines.current[j] = el)} fill="none" stroke={[LINE_LIGHT, LINE_MID, LINE_DEEP][j]} strokeWidth="2.5" strokeLinecap="round" opacity="0.9" points={`0,${MID_Y} 200,${MID_Y}`} />
        ))}
      </svg>
    </div>
  );
}