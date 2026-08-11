import React, { useEffect, useState } from "react";
import CountUp from "./CountUp";

/**
 * DialGauge — bespoke radial dial (StorageGauge heritage). Stroke + knob use
 * currentColor so it reads on any tile. The ring fills and the knob rotates on
 * mount (one purposeful motion); the centre shows a CountUp percentage.
 */
export default function DialGauge({ percent = 0, size = 160, stroke = 14, className }) {
  const [on, setOn] = useState(false);
  const pct = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = on ? c * (1 - pct / 100) : c;
  const rot = on ? pct * 3.6 : 0;

  useEffect(() => {
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={"relative shrink-0 " + (className || "")} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="opacity-15" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "repeating-conic-gradient(from 0deg, currentColor 0deg 0.6deg, transparent 0.6deg 6deg)",
          opacity: 0.12,
          WebkitMask: `radial-gradient(circle, transparent 0 64%, #000 64% 84%, transparent 84%)`,
          mask: `radial-gradient(circle, transparent 0 64%, #000 64% 84%, transparent 84%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ transform: `rotate(${rot}deg)`, transition: "transform 1.6s cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-current shadow-md" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp value={pct} duration={1600} className="text-2xl font-display font-semibold tabular-nums leading-none" />
        <span className="text-[9px] uppercase tracking-wider opacity-50 mt-1">voltooid</span>
      </div>
    </div>
  );
}