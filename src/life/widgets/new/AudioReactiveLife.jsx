import React, { useEffect, useRef } from "react";

/* Blauwe sine + Whipped-Pistachio glow in de bloom. */
const BLOOM = "radial-gradient(circle at 38% 36%, #e6e8c6, #d8dab3 26%, #aebccc 56%, #5d7388 100%)";
const LINE_LIGHT = "#c6d3de";
const LINE_MID = "#8fa3b6";
const LINE_DEEP = "#5f758a";

const MID_Y = 40;
const N = 36; // minder punten → minder, grotere golven
const FREQ = 0.24; // lage frequentie: ~1.4 golven over de volle breedte

/** AudioReactiveLife — bloom + volledige-breedte sinus, beide gecentreerd in
 *  het midden van de parent (het bovenste gedeelte). De sinus loopt exact
 *  door het midden van de bloom. Beweegt ENKEL als de muziek speelt, en dan
 *  écht méé met de audio (WebAudio AnalyserNode). In rust: rechte lijnen +
 *  rustende bloom. Bloom is veel groter, met Whipped Pistachio erin. */
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
      blob.current.style.transform = "translate(-50%,-50%) scale(0.74)";
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

      // bloom — schaalt flink mee met de lage band
      if (blob.current) {
        const s = 0.74 + low * 0.9;
        blob.current.style.transform = `translate(-50%,-50%) scale(${s})`;
        blob.current.style.opacity = String(0.5 + low * 0.4);
        blob.current.style.borderRadius = `${44 + low * 16}% ${56 - low * 16}% ${50 + low * 12}% ${50 - low * 12}% / ${50 + low * 12}% ${50 - low * 12}% ${56 - low * 16}% ${44 + low * 16}%`;
      }
      // sinus — blauw, volledige breedte, minder & grotere golven
      const bands = [low, midB, high];
      [0, 1, 2].forEach((j) => {
        const amp = bands[j] * 38 + 3;
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
      {/* bloom — veel groter, midden van het bovenste gedeelte, pistache+blauw */}
      <div
        ref={blob}
        className="absolute left-1/2 top-1/2 h-[90%] aspect-square max-w-[94%]"
        style={{ background: BLOOM, filter: "blur(14px)", transform: "translate(-50%,-50%) scale(0.74)" }}
      />
      {/* sinus — volledige breedte, exact door het midden van de bloom */}
      <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2" style={{ height: "32%" }}>
        {[0, 1, 2].map((j) => (
          <polyline key={j} ref={(el) => (lines.current[j] = el)} fill="none" stroke={[LINE_LIGHT, LINE_MID, LINE_DEEP][j]} strokeWidth="2.5" strokeLinecap="round" opacity="0.9" points={`0,${MID_Y} 200,${MID_Y}`} />
        ))}
      </svg>
    </div>
  );
}