import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export function AnimatedRing({ pct, size = 200, stroke = 12, color = "#301728", track = "rgba(255,255,255,0.08)", label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);
  useEffect(() => {
    const t = setTimeout(() => setOffset(c - (pct / 100) * c), 80);
    return () => clearTimeout(t);
  }, [pct, c]);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.1, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label != null && <span className="text-storm text-4xl font-bold tabular-nums leading-none">{label}</span>}
        {sub && <span className="text-storm/50 text-[10px] tracking-[0.25em] mt-1.5">{sub}</span>}
      </div>
    </div>
  );
}

export function BarGrow({ value, max = 100, color = "#301728", height = 12, delay = 0 }) {
  const pct = Math.min(100, max ? (value / max) * 100 : 0);
  return (
    <div className="w-full rounded-full bg-marble/10 overflow-hidden" style={{ height }}>
      <motion.div className="h-full rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay, ease: "easeOut" }} />
    </div>
  );
}

export function LiveSparkline({ color = "#301728", max = 20, intervalMs = 2000, points = 22, height = 48 }) {
  const [data, setData] = useState(() => Array.from({ length: points }, () => Math.random() * max * 0.55 + 2));
  useEffect(() => {
    const id = setInterval(() => setData(d => [...d.slice(1), Math.random() * max * 0.7 + 2]), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, max, points]);
  const w = 240, h = height, step = w / (points - 1);
  const d = data.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <polyline points={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - (data[data.length - 1] / max) * h} r="3.5" fill={color} />
    </svg>
  );
}

export function PulseWave({ color = "#d5e24a", bars = 28, height = 44 }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(x => x + 1), 130);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => {
        const s = Math.abs(Math.sin((i + t) * 0.5));
        return <div key={i} className="flex-1 rounded-sm transition-all duration-150" style={{ height: `${20 + s * 70}%`, background: color, opacity: 0.35 + s * 0.65 }} />;
      })}
    </div>
  );
}

export function CountUp({ to, duration = 0.8, className }) {
  const [n, setN] = useState(to);
  const fromRef = useRef(to);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      setN(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick); else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span className={className}>{n}</span>;
}