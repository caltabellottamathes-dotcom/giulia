import React from "react";
import GraphShell from "./GraphShell";
import { A, useLiveSeries } from "./graphData";
import { pts, linePath, areaPath } from "./viz";

const W = 240, H = 80;

function Stream({ data, stroke, fill, area = true, ma = false }) {
  const vals = data.map((d) => d.v);
  const p = pts(vals, W, H, 3);
  const last = p[p.length - 1];
  let maP = null;
  if (ma) {
    const win = 6;
    const maVals = vals.map((_, i) => {
      const s = Math.max(0, i - win + 1);
      const slice = vals.slice(s, i + 1);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
    maP = pts(maVals, W, H, 3);
  }
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {area && <path d={areaPath(p, H)} fill={fill || stroke} opacity={0.16} />}
      <path d={linePath(p)} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {maP && <path d={linePath(maP)} fill="none" stroke={A.sand} strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" />}
      <circle cx={last.x} cy={last.y} r={3.5} fill={stroke} />
      <circle cx={last.x} cy={last.y} r={6} fill="none" stroke={stroke} strokeOpacity={0.4} strokeWidth={1} />
    </svg>
  );
}

function LiveLine() {
  const data = useLiveSeries(36, { min: 20, max: 80, vol: 10, ms: 900 });
  return <Stream data={data} stroke={A.olive} />;
}
function LiveArea() {
  const data = useLiveSeries(36, { min: 10, max: 90, vol: 12, ms: 900 });
  return <Stream data={data} stroke={A.ridge} fill={A.ridge} area />;
}
function LiveCounterGraph() {
  const data = useLiveSeries(40, { min: 0, max: 100, vol: 5, ms: 700, seed: 20 });
  return <Stream data={data} stroke={A.sand} fill={A.sand} area />;
}
function RealTimeWave() {
  const data = useLiveSeries(48, { min: 0, max: 100, vol: 22, ms: 600, seed: 50 });
  return <Stream data={data} stroke={A.olive} fill={A.olive} area />;
}
function MovingAverage() {
  const data = useLiveSeries(40, { min: 10, max: 90, vol: 14, ms: 800 });
  return <Stream data={data} stroke={A.olive} fill={A.olive} area ma />;
}
function LiveCapacityCurve() {
  const data = useLiveSeries(36, { min: 30, max: 95, vol: 8, ms: 1000 });
  return <Stream data={data} stroke={A.ridge} fill={A.ridge} area />;
}
function LiveEnergyCurve() {
  const data = useLiveSeries(36, { min: 20, max: 95, vol: 10, ms: 850 });
  return <Stream data={data} stroke={A.olive} fill={A.olive} area />;
}
function PulseGraph() {
  const data = useLiveSeries(18, { min: 5, max: 60, vol: 16, ms: 800 });
  const vals = data.map((d) => d.v);
  const max = Math.max(...vals, 1);
  const bw = W / vals.length;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {vals.map((v, i) => <rect key={i} x={i * bw + 1} y={H - (v / max) * H} width={bw - 2} height={(v / max) * H} rx={2} fill={A.olive} opacity={0.35 + (v / max) * 0.65} />)}
    </svg>
  );
}

const accent = A.olive;
const LiveItems = [
  <GraphShell label="Live Line" accent={accent} className="xl:col-span-2"><LiveLine /></GraphShell>,
  <GraphShell label="Live Area" accent={accent} className="xl:col-span-2"><LiveArea /></GraphShell>,
  <GraphShell label="Live Counter Graph" accent={accent}><LiveCounterGraph /></GraphShell>,
  <GraphShell label="Real-time Wave" accent={accent}><RealTimeWave /></GraphShell>,
  <GraphShell label="Pulse Graph" accent={accent}><PulseGraph /></GraphShell>,
  <GraphShell label="Moving Average" accent={accent} className="xl:col-span-2"><MovingAverage /></GraphShell>,
  <GraphShell label="Live Capacity Curve" accent={accent} className="xl:col-span-2"><LiveCapacityCurve /></GraphShell>,
  <GraphShell label="Live Energy Curve" accent={accent} className="xl:col-span-2"><LiveEnergyCurve /></GraphShell>,
];
export default LiveItems;