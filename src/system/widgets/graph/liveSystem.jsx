import React from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A, useLiveValue, useMorph, useLiveSeries } from "./graphData";
import { ECG, Ripple } from "./shapes";
import { pts, linePath } from "./viz";

const accent = A.ridge;

function MultiMonitor() {
  const a = useLiveSeries(28, { min: 20, max: 80, vol: 14, ms: 900, seed: 50 });
  const b = useLiveSeries(28, { min: 20, max: 80, vol: 10, ms: 900, seed: 40 });
  const c = useLiveSeries(28, { min: 20, max: 80, vol: 18, ms: 900, seed: 60 });
  const series = [a, b, c];
  const cols = [accent, A.olive, A.sand];
  return (
    <svg width={150} height={86} viewBox="0 0 150 86">
      {series.map((s, i) => { const p = pts(s.map((d) => d.v), 150, 24, 2); return <path key={i} d={linePath(p)} fill="none" stroke={cols[i]} strokeWidth={1.6} transform={`translate(0 ${i * 28})`} />; })}
    </svg>
  );
}
function ActivityRiver() {
  const data = useLiveSeries(30, { min: 10, max: 90, vol: 20, ms: 700 });
  return (
    <svg width={150} height={72} viewBox="0 0 150 72">
      {data.map((d, i) => { const x = i * 4.8; const h = ((d.v - 10) / 80) * 62; return <rect key={i} x={x} y={72 - h} width={3} height={h} rx={1} fill={accent} opacity={0.6} />; })}
    </svg>
  );
}
function Uptime() {
  const v = useMorph(useLiveValue(99.9, { min: 97, max: 100, step: 0.4 }));
  return <div className="text-center"><p className="text-4xl font-display font-semibold tabular-nums" style={{ color: accent }}>{v.toFixed(1)}%</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">uptime</p></div>;
}

const LiveSystemItems = [
  <GraphShell label="Heartbeat" accent={accent}><ECG w={150} h={50} color={A.urgent} /></GraphShell>,
  <GraphShell label="Multi Monitor" accent={accent} className="sm:col-span-2"><MultiMonitor /></GraphShell>,
  <GraphShell label="Activity River" accent={accent}><ActivityRiver /></GraphShell>,
  <GraphShell label="Pulse" accent={accent}><Ripple rings={4} color={A.urgent} size={120} /></GraphShell>,
  <GraphShell label="Uptime" accent={accent}><Uptime /></GraphShell>,
];
export default LiveSystemItems;