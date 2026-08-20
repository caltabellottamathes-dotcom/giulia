import React from "react";
import {
  LineChart, AreaChart, BarChart, ScatterChart, ComposedChart,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Line, Area, Bar, Scatter, Cell, ZAxis,
} from "recharts";
import GraphShell from "./GraphShell";
import { A } from "./graphData";

const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const WEEK = DAYS.map((d, i) => ({
  d,
  energy: 60 + Math.round(20 * Math.sin(i / 1.5) + Math.random() * 10),
  capacity: 50 + Math.round(15 * Math.cos(i / 2) + Math.random() * 8),
  focus: 40 + Math.round(10 * Math.sin(i) + Math.random() * 12),
}));
const BARS = DAYS.map((d, i) => ({ d, v: 20 + Math.round(60 * Math.abs(Math.sin(i / 1.3)) + Math.random() * 10), v2: 10 + Math.round(30 * Math.abs(Math.cos(i / 1.7))) }));
const SCATTER = Array.from({ length: 14 }, () => ({ x: Math.round(Math.random() * 100), y: Math.round(Math.random() * 100), z: 20 + Math.round(Math.random() * 80) }));
const HIST = [4, 8, 14, 22, 30, 26, 18, 10, 5, 3].map((v, i) => ({ bin: `${i * 10}`, v }));

const axis = { fontSize: 9, fill: "hsl(var(--muted-foreground))" };

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-foreground/15 bg-card px-2 py-1 text-[10px] shadow-sm">{label != null && <p className="font-semibold mb-0.5">{label}</p>}{payload.map((p) => <div key={p.dataKey} style={{ color: p.color || p.fill }}>{p.name}: {p.value}</div>)}</div>;
}

const box = "w-full h-[150px]";

function LineC() {
  return <div className={box}><ResponsiveContainer><LineChart data={WEEK} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
    <CartesianGrid stroke={A.grid} vertical={false} /><XAxis dataKey="d" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} />
    <Tooltip content={<Tip />} cursor={{ stroke: A.grid }} />
    <Line type="monotone" dataKey="energy" name="Energie" stroke={A.olive} strokeWidth={2} dot={{ r: 3, fill: A.olive }} activeDot={{ r: 5 }} isAnimationActive />
    <Line type="monotone" dataKey="capacity" name="Capaciteit" stroke={A.ridge} strokeWidth={2} dot={{ r: 3, fill: A.ridge }} activeDot={{ r: 5 }} isAnimationActive />
  </LineChart></ResponsiveContainer></div>;
}

function AreaC() {
  return <div className={box}><ResponsiveContainer><AreaChart data={WEEK} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A.olive} stopOpacity={0.4} /><stop offset="100%" stopColor={A.olive} stopOpacity={0.02} /></linearGradient></defs>
    <CartesianGrid stroke={A.grid} vertical={false} /><XAxis dataKey="d" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} />
    <Tooltip content={<Tip />} cursor={{ stroke: A.grid }} />
    <Area type="monotone" dataKey="energy" name="Energie" stroke={A.olive} strokeWidth={2} fill="url(#ga)" isAnimationActive />
  </AreaChart></ResponsiveContainer></div>;
}

function BarC() {
  return <div className={box}><ResponsiveContainer><BarChart data={BARS} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
    <CartesianGrid stroke={A.grid} vertical={false} /><XAxis dataKey="d" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} />
    <Tooltip content={<Tip />} cursor={{ fill: A.grid }} />
    <Bar dataKey="v" name="Punten" radius={[3, 3, 0, 0]} isAnimationActive>{BARS.map((_, i) => <Cell key={i} fill={i % 2 ? A.olive : A.smoke} />)}</Bar>
  </BarChart></ResponsiveContainer></div>;
}

function StackedBarC() {
  return <div className={box}><ResponsiveContainer><BarChart data={BARS} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
    <CartesianGrid stroke={A.grid} vertical={false} /><XAxis dataKey="d" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} />
    <Tooltip content={<Tip />} cursor={{ fill: A.grid }} />
    <Bar dataKey="v" name="Focus" stackId="a" fill={A.olive} radius={0} isAnimationActive /><Bar dataKey="v2" name="Shallow" stackId="a" fill={A.ridge} radius={[3, 3, 0, 0]} isAnimationActive />
  </BarChart></ResponsiveContainer></div>;
}

function StackedAreaC() {
  return <div className={box}><ResponsiveContainer><AreaChart data={WEEK} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
    <CartesianGrid stroke={A.grid} vertical={false} /><XAxis dataKey="d" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} />
    <Tooltip content={<Tip />} cursor={{ stroke: A.grid }} />
    <Area type="monotone" dataKey="energy" name="Energie" stackId="1" stroke={A.olive} fill={A.olive} fillOpacity={0.3} isAnimationActive />
    <Area type="monotone" dataKey="focus" name="Focus" stackId="1" stroke={A.sand} fill={A.sand} fillOpacity={0.35} isAnimationActive />
  </AreaChart></ResponsiveContainer></div>;
}

function ScatterC() {
  return <div className={box}><ResponsiveContainer><ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
    <CartesianGrid stroke={A.grid} /><XAxis type="number" dataKey="x" tick={axis} axisLine={false} tickLine={false} /><YAxis type="number" dataKey="y" tick={axis} axisLine={false} tickLine={false} /><ZAxis range={[40, 200]} />
    <Tooltip content={<Tip />} cursor={{ stroke: A.grid }} />
    <Scatter data={SCATTER} fill={A.olive} isAnimationActive />
  </ScatterChart></ResponsiveContainer></div>;
}

function SparkC() {
  const data = WEEK.map((w) => w.energy);
  const max = Math.max(...data), min = Math.min(...data);
  const w = 200, h = 60, p = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - 4 - ((v - min) / (max - min || 1)) * (h - 8) }));
  const d = p.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" ");
  return <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><path d={d} fill="none" stroke={A.olive} strokeWidth={2} strokeLinecap="round" /></svg>;
}

function HistogramC() {
  return <div className={box}><ResponsiveContainer><BarChart data={HIST} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
    <CartesianGrid stroke={A.grid} vertical={false} /><XAxis dataKey="bin" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} />
    <Tooltip content={<Tip />} cursor={{ fill: A.grid }} />
    <Bar dataKey="v" name="Aantal" fill={A.ridge} radius={[3, 3, 0, 0]} isAnimationActive />
  </BarChart></ResponsiveContainer></div>;
}

function TrendC() {
  return <div className={box}><ResponsiveContainer><ComposedChart data={WEEK} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
    <CartesianGrid stroke={A.grid} vertical={false} /><XAxis dataKey="d" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} />
    <Tooltip content={<Tip />} cursor={{ stroke: A.grid }} />
    <Line type="monotone" dataKey="energy" name="Energie" stroke={A.olive} strokeWidth={2} dot={false} isAnimationActive />
    <Line type="linear" dataKey="capacity" name="Trend" stroke={A.sand} strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive />
  </ComposedChart></ResponsiveContainer></div>;
}

function ComparisonC() {
  const data = WEEK.map((w, i) => ({ d: w.d, nu: w.energy, vorig: 50 + Math.round(12 * Math.sin(i / 1.2)) }));
  return <div className={box}><ResponsiveContainer><BarChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
    <CartesianGrid stroke={A.grid} vertical={false} /><XAxis dataKey="d" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} />
    <Tooltip content={<Tip />} cursor={{ fill: A.grid }} />
    <Bar dataKey="vorig" name="Vorige" fill="hsl(var(--foreground)/0.18)" radius={[3, 3, 0, 0]} isAnimationActive />
    <Bar dataKey="nu" name="Nu" fill={A.olive} radius={[3, 3, 0, 0]} isAnimationActive />
  </BarChart></ResponsiveContainer></div>;
}

const accent = A.olive;
const DataGraphItems = [
  <GraphShell label="Line Chart" accent={accent} className="xl:col-span-2"><LineC /></GraphShell>,
  <GraphShell label="Area Chart" accent={accent} className="xl:col-span-2"><AreaC /></GraphShell>,
  <GraphShell label="Bar Chart" accent={accent}><BarC /></GraphShell>,
  <GraphShell label="Stacked Bar" accent={accent}><StackedBarC /></GraphShell>,
  <GraphShell label="Stacked Area" accent={accent} className="xl:col-span-2"><StackedAreaC /></GraphShell>,
  <GraphShell label="Scatter Plot" accent={accent}><ScatterC /></GraphShell>,
  <GraphShell label="Sparkline" accent={accent}><SparkC /></GraphShell>,
  <GraphShell label="Histogram" accent={accent}><HistogramC /></GraphShell>,
  <GraphShell label="Comparison Graph" accent={accent} className="xl:col-span-2"><ComparisonC /></GraphShell>,
  <GraphShell label="Trend Graph" accent={accent} className="xl:col-span-2"><TrendC /></GraphShell>,
];
export default DataGraphItems;