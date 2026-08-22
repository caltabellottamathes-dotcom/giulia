import React, { useEffect, useRef } from "react";

const DEEP = "hsl(var(--d-giulia-deep))";    // olijf
const LIGHT = "hsl(var(--d-giulia-light))";  // pistachio
const URGENT = "hsl(var(--d-giulia-urgent))"; // urgent

/** AudioReactiveGallery — bewegende visuals die op audio reageren. Omdat deze
 *  galerij geen live microfoon/ ElevenLabs-stroom heeft, simuleren we een
 *  spraak-achtige amplitude (bursts met rust) via rAF. Elke tile leest die
 *  gesimuleerde level en stuurt zijn vorm direct aan (refs, geen re-renders). */

function Card({ n, name, children }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-[188px] h-[188px] rounded-[24px] flex items-center justify-center p-4 mb-2"
        style={{ background: "rgba(48,50,55,0.30)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16)" }}
      >
        {children}
      </div>
      <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-foreground/45 text-center leading-tight">
        <span style={{ color: URGENT }}>{n}</span> · {name}
      </p>
    </div>
  );
}

// spraak-achtige envelope: bursts met rustperiodes
const env = (t, ph = 0) => {
  const burst = Math.max(0, Math.sin(t * 0.8 + ph));
  return 0.35 + 0.65 * burst * (0.45 + 0.55 * Math.abs(Math.sin(t * 3.1 + ph)));
};

function ReactiveBars() {
  const bars = useRef([]);
  useEffect(() => {
    let raf;
    const loop = () => {
      const t = performance.now() / 1000;
      bars.current.forEach((el, i) => {
        if (!el) return;
        const v = env(t, i * 0.4);
        el.style.transform = `scaleY(${0.12 + v * 0.88})`;
        el.style.opacity = String(0.35 + v * 0.65);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="flex items-end gap-1 h-16 w-full justify-center">
      {Array.from({ length: 13 }).map((_, i) => (
        <span key={i} ref={(el) => (bars.current[i] = el)} className="w-1.5 rounded-full origin-bottom"
          style={{ height: "100%", background: i % 2 ? LIGHT : DEEP, transform: "scaleY(0.12)" }} />
      ))}
    </div>
  );
}

function ReactiveRing() {
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const loop = () => {
      const t = performance.now() / 1000;
      const v = env(t);
      const el = ref.current;
      if (el) { el.style.transform = `scale(${0.65 + v * 0.6})`; el.style.opacity = String(0.35 + v * 0.55); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="relative h-20 w-20 flex items-center justify-center">
      <div ref={ref} className="absolute h-20 w-20 rounded-full" style={{ border: `3px solid ${URGENT}`, transform: "scale(0.65)" }} />
      <div className="absolute h-12 w-12 rounded-full" style={{ border: `2px solid ${LIGHT}`, opacity: 0.5 }} />
      <div className="h-3 w-3 rounded-full" style={{ background: URGENT }} />
    </div>
  );
}

function ReactiveWave() {
  const bars = useRef([]);
  useEffect(() => {
    let raf;
    const loop = () => {
      const t = performance.now() / 1000;
      bars.current.forEach((el, i) => {
        if (!el) return;
        const v = env(t, i * 0.35);
        el.style.transform = `scaleY(${0.12 + v * 0.88})`;
        el.style.opacity = String(0.4 + v * 0.6);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="flex items-center gap-1 h-16 w-full justify-center">
      {Array.from({ length: 13 }).map((_, i) => (
        <span key={i} ref={(el) => (bars.current[i] = el)} className="w-1.5 rounded-full origin-center"
          style={{ height: "100%", background: i % 3 === 0 ? URGENT : DEEP, transform: "scaleY(0.12)" }} />
      ))}
    </div>
  );
}

function ReactiveRadial() {
  const lines = useRef([]);
  useEffect(() => {
    let raf;
    const loop = () => {
      const t = performance.now() / 1000;
      lines.current.forEach((el, i) => {
        if (!el) return;
        const a = (i / 16) * Math.PI * 2;
        const v = env(t, i * 0.3);
        const r = 14 + v * 18;
        el.setAttribute("x2", (60 + Math.cos(a) * r).toFixed(1));
        el.setAttribute("y2", (60 + Math.sin(a) * r).toFixed(1));
        el.style.opacity = String(0.3 + v * 0.7);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <line key={i} ref={(el) => (lines.current[i] = el)} x1={60 + Math.cos(a) * 14} y1={60 + Math.sin(a) * 14}
          x2={60 + Math.cos(a) * 14} y2={60 + Math.sin(a) * 14} stroke={i % 4 === 0 ? URGENT : LIGHT} strokeWidth="2.5" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function ReactiveBlob() {
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const loop = () => {
      const t = performance.now() / 1000;
      const v = env(t);
      const el = ref.current;
      if (el) {
        el.style.transform = `scale(${0.75 + v * 0.5})`;
        el.style.opacity = String(0.45 + v * 0.5);
        el.style.borderRadius = `${42 + v * 12}% ${58 - v * 12}% ${50 + v * 10}% ${50 - v * 10}% / ${50 + v * 10}% ${50 - v * 10}% ${58 - v * 12}% ${42 + v * 12}%`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} className="h-20 w-20" style={{ background: `linear-gradient(135deg, ${DEEP}, ${LIGHT})`, filter: "blur(2px)", transform: "scale(0.75)" }} />
  );
}

function ReactiveGrid() {
  const dots = useRef([]);
  useEffect(() => {
    let raf;
    const loop = () => {
      const t = performance.now() / 1000;
      dots.current.forEach((el, i) => {
        if (!el) return;
        const row = Math.floor(i / 6), col = i % 6;
        const d = Math.sqrt((row - 2.5) ** 2 + (col - 2.5) ** 2);
        const v = env(t, d * 0.5);
        el.style.opacity = String(0.2 + v * 0.8);
        el.style.transform = `scale(${0.6 + v * 0.7})`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {Array.from({ length: 36 }).map((_, i) => (
        <span key={i} ref={(el) => (dots.current[i] = el)} className="h-1.5 w-1.5 rounded-full" style={{ background: i % 5 === 0 ? URGENT : LIGHT, opacity: 0.2, transform: "scale(0.6)" }} />
      ))}
    </div>
  );
}

const ITEMS = [
  { n: "01", name: "Reactive Bars", C: ReactiveBars },
  { n: "02", name: "Reactive Ring", C: ReactiveRing },
  { n: "03", name: "Reactive Wave", C: ReactiveWave },
  { n: "04", name: "Reactive Radial", C: ReactiveRadial },
  { n: "05", name: "Reactive Blob", C: ReactiveBlob },
  { n: "06", name: "Reactive Grid", C: ReactiveGrid },
];

export default function AudioReactiveGallery() {
  return (
    <div className="flex flex-wrap gap-5">
      {ITEMS.map(({ n, name, C }) => (
        <Card key={n} n={n} name={name}><C /></Card>
      ))}
    </div>
  );
}