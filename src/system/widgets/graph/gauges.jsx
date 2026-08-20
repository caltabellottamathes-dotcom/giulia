import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A, useLiveValue, useMorph } from "./graphData";
import { polar, arcPath } from "./viz";

/* ── GAUGES & METERS — vormen die vloeiend meebewegen ────────── */

function RingGauge({ value, size = 96, thickness = 9, color = A.olive, center, label }) {
  const v = useMorph(value);
  const r = (size - thickness) / 2, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r, off = C * (1 - v / 100);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--foreground)/0.1)" strokeWidth={thickness} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cy})`} />
      </svg>
      {center !== undefined && <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-display font-semibold tabular-nums">{center}</span>{label && <span className="text-[8px] uppercase tracking-wider text-foreground/50">{label}</span>}</div>}
    </div>
  );
}

function CircularGauge() {
  const v = useLiveValue(68, { min: 20, max: 95, step: 4 });
  return <RingGauge value={v} center={Math.round(useMorph(v))} label="circulair" />;
}

function ProgressRing() {
  const v = useLiveValue(64, { min: 0, max: 100, step: 4 });
  const m = useMorph(v);
  const size = 96, th = 8, r = (size - th) / 2, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r, off = C * (1 - m / 100);
  const [kx, ky] = polar(cx, cy, r, (m / 100) * 360);
  return <div className="relative" style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--foreground)/0.1)" strokeWidth={th} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={A.olive} strokeWidth={th} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={kx} cy={ky} r={5} fill={A.ink} />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-display font-semibold tabular-nums">{Math.round(m)}%</span></div>
  </div>;
}

function DonutGauge() {
  const v = useLiveValue(72, { min: 30, max: 95, step: 4 });
  return <RingGauge value={v} size={96} thickness={16} color={A.olive} center={Math.round(useMorph(v))} label="donut" />;
}

function ArcGauge({ startDeg = 135, endDeg = 405, color = A.olive, center, label }) {
  const v = useLiveValue(60, { min: 10, max: 95, step: 4 });
  const m = useMorph(v);
  const size = 100, th = 9, r = (size - th) / 2, cx = size / 2, cy = size / 2;
  const span = endDeg - startDeg, L = (span / 360) * 2 * Math.PI * r, off = L * (1 - m / 100);
  return <div className="relative" style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={arcPath(cx, cy, r, startDeg, endDeg)} fill="none" stroke="hsl(var(--foreground)/0.1)" strokeWidth={th} strokeLinecap="round" />
      <path d={arcPath(cx, cy, r, startDeg, endDeg)} fill="none" stroke={color} strokeWidth={th} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={off} />
    </svg>
    {center !== undefined && <div className="absolute inset-0 flex flex-col items-center justify-center pt-3"><span className="text-xl font-display font-semibold tabular-nums">{center}</span>{label && <span className="text-[8px] uppercase tracking-wider text-foreground/50">{label}</span>}</div>}
  </div>;
}

function ArcG() { const v = useLiveValue(60, { min: 10, max: 95, step: 4 }); return <ArcGauge center={Math.round(useMorph(v))} label="arc" />; }
function SemiG() { const v = useLiveValue(60, { min: 10, max: 95, step: 4 }); return <ArcGauge startDeg={180} endDeg={360} color={A.ridge} center={Math.round(useMorph(v))} label="half" />; }

function LinearG({ vertical }) {
  const v = useMorph(useLiveValue(64, { min: 10, max: 95, step: 4 }));
  return <div className={vertical ? "h-28 w-3.5 rounded-full bg-foreground/10 relative" : "w-full max-w-[160px] h-3.5 rounded-full bg-foreground/10 relative"}>
    <div className="absolute rounded-full" style={{ background: A.olive, bottom: vertical ? 0 : undefined, left: vertical ? 0 : 0, height: vertical ? `${v}%` : "100%", width: vertical ? "100%" : `${v}%` }} />
  </div>;
}

function SegmentedGauge() {
  const v = useMorph(useLiveValue(70, { min: 0, max: 100, step: 5 }));
  const segs = 12, lit = Math.round((v / 100) * segs);
  return <div className="flex gap-1 w-full max-w-[170px]">{Array.from({ length: segs }, (_, i) => <div key={i} className="flex-1 h-7 rounded-sm transition-colors duration-300" style={{ background: i < lit ? A.olive : "hsl(var(--foreground)/0.1)" }} />)}</div>;
}

function BudgetGauge() {
  const spent = useMorph(useLiveValue(640, { min: 200, max: 1100, step: 40 }));
  const budget = 1000, pct = Math.min(100, (spent / budget) * 100), over = spent > budget;
  return <div className="w-full max-w-[170px]"><div className="flex justify-between text-[9px] mb-1"><span>Uitgaven</span><span className="tabular-nums">€{Math.round(spent)} / €{budget}</span></div><div className="relative h-3 rounded-full bg-foreground/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? A.urgent : A.olive }} /></div><p className="text-[8px] mt-1 text-foreground/50">{over ? "Over budget" : "Binnen budget"}</p></div>;
}

function ThresholdGauge() {
  const v = useMorph(useLiveValue(70, { min: 0, max: 100, step: 4 }));
  const zone = v < 40 ? A.olive : v < 75 ? A.sand : A.urgent;
  return <RingGauge value={v} size={88} color={zone} center={Math.round(v)} label={v < 40 ? "rustig" : v < 75 ? "actief" : "hoog"} />;
}

function MultiValueGauge() {
  const a = useMorph(useLiveValue(70, { min: 40, max: 95, step: 3 }));
  const b = useMorph(useLiveValue(50, { min: 20, max: 80, step: 3 }));
  const size = 96, t1 = 8, t2 = 8, cx = size / 2, cy = size / 2, r1 = (size - t1) / 2, r2 = r1 - t1 - 2;
  const C1 = 2 * Math.PI * r1, C2 = 2 * Math.PI * r2;
  return <div className="relative" style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r1} fill="none" stroke="hsl(var(--foreground)/0.1)" strokeWidth={t1} />
      <circle cx={cx} cy={cy} r={r1} fill="none" stroke={A.olive} strokeWidth={t1} strokeLinecap="round" strokeDasharray={C1} strokeDashoffset={C1 * (1 - a / 100)} transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke="hsl(var(--foreground)/0.1)" strokeWidth={t2} />
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke={A.ridge} strokeWidth={t2} strokeLinecap="round" strokeDasharray={C2} strokeDashoffset={C2 * (1 - b / 100)} transform={`rotate(-90 ${cx} ${cy})`} />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-display font-semibold tabular-nums">{Math.round(a)}<span className="text-foreground/40">/</span>{Math.round(b)}</span></div>
  </div>;
}

function Bar({ label, value, color }) {
  const m = useMorph(value);
  return <div className="w-full"><div className="flex justify-between text-[9px] mb-1"><span>{label}</span><span className="tabular-nums">{Math.round(m)}%</span></div><div className="h-2.5 rounded-full bg-foreground/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${m}%`, background: color }} /></div></div>;
}
function ComparisonGauge() {
  const cur = useLiveValue(64, { min: 30, max: 95, step: 3 });
  return <div className="w-full max-w-[170px] flex flex-col gap-2.5"><Bar label="Nu" value={cur} color={A.olive} /><Bar label="Vorige" value={58} color={A.ridge} /></div>;
}

function CapacityGauge() {
  const v = useLiveValue(82, { min: 40, max: 99, step: 3 });
  return <RingGauge value={v} size={92} thickness={12} color={A.ridge} center={Math.round(useMorph(v)) + "%"} label="capaciteit" />;
}
function CompletionGauge() {
  const v = useLiveValue(45, { min: 10, max: 100, step: 5 });
  return <RingGauge value={v} size={92} thickness={9} color={A.sand} center={Math.round(useMorph(v)) + "%"} label="voltooid" />;
}
function ScoreGauge() {
  const v = useLiveValue(7.4, { min: 1, max: 10, step: 0.4, ms: 2200 });
  const m = useMorph(v);
  return <RingGauge value={(m / 10) * 100} size={92} thickness={9} color={A.olive} center={m.toFixed(1)} label="score" />;
}

const accent = A.olive;
const GaugeItems = [
  <GraphShell label="Circular Gauge" accent={accent}><CircularGauge /></GraphShell>,
  <GraphShell label="Progress Ring" accent={accent}><ProgressRing /></GraphShell>,
  <GraphShell label="Donut Gauge" accent={accent}><DonutGauge /></GraphShell>,
  <GraphShell label="Arc Gauge" accent={accent}><ArcG /></GraphShell>,
  <GraphShell label="Semi-Circle Gauge" accent={accent}><SemiG /></GraphShell>,
  <GraphShell label="Linear Gauge" accent={accent}><LinearG /></GraphShell>,
  <GraphShell label="Vertical Gauge" accent={accent}><LinearG vertical /></GraphShell>,
  <GraphShell label="Segmented Gauge" accent={accent}><SegmentedGauge /></GraphShell>,
  <GraphShell label="Budget Gauge" accent={accent}><BudgetGauge /></GraphShell>,
  <GraphShell label="Threshold Gauge" accent={accent}><ThresholdGauge /></GraphShell>,
  <GraphShell label="Multi-value Gauge" accent={accent}><MultiValueGauge /></GraphShell>,
  <GraphShell label="Comparison Gauge" accent={accent}><ComparisonGauge /></GraphShell>,
  <GraphShell label="Capacity Gauge" accent={accent}><CapacityGauge /></GraphShell>,
  <GraphShell label="Completion Gauge" accent={accent}><CompletionGauge /></GraphShell>,
  <GraphShell label="Score Gauge" accent={accent}><ScoreGauge /></GraphShell>,
];
export default GaugeItems;