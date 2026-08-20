import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A, useCountUp, useLiveValue, useMorph, useTick, useLiveSeries, fmtEuro } from "./graphData";
import { Sparkline } from "./viz";

/* ── NUMERIC — grote, levende cijfers ───────────────────────── */

function Counter() {
  const v = useCountUp(1284, 1600);
  return <div className="text-center"><p className="text-4xl font-display font-semibold tabular-nums tracking-tight">{Math.round(v).toLocaleString("nl-NL")}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">totaal</p></div>;
}

function LargeNumber() {
  const t = useLiveValue(72, { min: 10, max: 99, step: 3, ms: 2200 });
  const v = useMorph(t);
  return <div className="text-center"><p className="text-5xl font-display font-semibold tabular-nums tracking-tight" style={{ color: A.olive }}>{Math.round(v)}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">live waarde</p></div>;
}

function AnimatedCounter() {
  const [n, setN] = useState(1024);
  useEffect(() => {
    const id = setInterval(() => setN((x) => x + Math.floor(Math.random() * 7) + 1), 1400);
    return () => clearInterval(id);
  }, []);
  return <div className="text-center"><p className="text-4xl font-display tabular-nums">{n.toLocaleString("nl-NL")}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">stijgend</p></div>;
}

function Percentage() {
  const t = useLiveValue(64, { min: 0, max: 100, step: 4 });
  const v = useMorph(t);
  return <div className="text-center w-full"><p className="text-4xl font-display font-semibold tabular-nums">{Math.round(v)}<span className="text-2xl text-foreground/40">%</span></p><div className="mt-2 mx-auto h-1.5 w-28 rounded-full bg-foreground/10 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: A.olive }} animate={{ width: `${v}%` }} transition={{ duration: 0.6 }} /></div></div>;
}

function Currency() {
  const t = useLiveValue(1240, { min: 800, max: 2400, step: 60 });
  const v = useMorph(t);
  return <div className="text-center"><p className="text-4xl font-display font-semibold tabular-nums">{fmtEuro(v)}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">besteed</p></div>;
}

function Score() {
  const t = useLiveValue(7, { min: 1, max: 10, step: 1, ms: 2200 });
  const v = Math.round(useMorph(t));
  return <div className="text-center"><p className="text-3xl font-display font-semibold tabular-nums">{v}<span className="text-lg text-foreground/40">/10</span></p><div className="flex gap-1 justify-center mt-2">{Array.from({ length: 10 }, (_, i) => <span key={i} className="h-2 w-2 rounded-full" style={{ background: i < v ? A.olive : "hsl(var(--foreground)/0.12)" }} />)}</div></div>;
}

function Rank() {
  const [r, setR] = useState(3);
  useEffect(() => { const id = setInterval(() => setR((x) => (x <= 1 ? 5 : x - 1)), 1800); return () => clearInterval(id); }, []);
  return <div className="text-center"><p className="text-4xl font-display font-semibold tabular-nums"><span className="text-foreground/40">#</span>{r}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">ranking</p></div>;
}

function Delta() {
  const t = useLiveValue(0, { min: -12, max: 12, step: 2 });
  const v = useMorph(t);
  const pos = v >= 0;
  return <div className="text-center"><p className="text-3xl font-display tabular-nums" style={{ color: pos ? A.olive : A.urgent }}>{pos ? "+" : ""}{v.toFixed(1)}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">delta</p></div>;
}

function ChangeIndicator() {
  const [s, setS] = useState({ v: 64, p: 64 });
  useEffect(() => { const id = setInterval(() => setS((x) => { const nv = Math.max(0, Math.min(100, x.v + (Math.random() - 0.5) * 24)); return { v: nv, p: x.v }; }), 2000); return () => clearInterval(id); }, []);
  const up = s.v >= s.p;
  return <div className="flex items-center gap-1.5 justify-center"><p className="text-3xl font-display tabular-nums">{Math.round(s.v)}</p><motion.span animate={{ y: [0, up ? -4 : 4, 0] }} transition={{ duration: 0.5 }} style={{ color: up ? A.olive : A.urgent }}>{up ? "▲" : "▼"}</motion.span></div>;
}

function Countdown() {
  const target = useRef(Date.now() + 1000 * 60 * 60 * 3.5).current;
  useTick(1000);
  const diff = Math.max(0, target - Date.now());
  const h = Math.floor(diff / 3.6e6), m = Math.floor((diff % 3.6e6) / 6e4), s = Math.floor((diff % 6e4) / 1e3);
  return <div className="text-center"><p className="text-3xl font-display tabular-nums">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">countdown</p></div>;
}

function Timer() {
  const start = useRef(Date.now()).current;
  useTick(60);
  const el = Date.now() - start;
  const m = Math.floor(el / 6e4), s = Math.floor((el % 6e4) / 1e4), cs = Math.floor((el % 1e3) / 10);
  return <div className="text-center"><p className="text-3xl font-display tabular-nums">{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}.{String(cs).padStart(2, "0")}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">verlopen</p></div>;
}

function MetricPair() {
  const a = useMorph(useLiveValue(72, { min: 40, max: 90, step: 3 }));
  const b = useMorph(useLiveValue(54, { min: 20, max: 80, step: 3 }));
  return <div className="flex gap-4"><div className="text-center"><p className="text-2xl font-display tabular-nums" style={{ color: A.olive }}>{Math.round(a)}</p><p className="text-[8px] uppercase tracking-wider text-foreground/50">energie</p></div><div className="w-px bg-foreground/10" /><div className="text-center"><p className="text-2xl font-display tabular-nums" style={{ color: A.ridge }}>{Math.round(b)}</p><p className="text-[8px] uppercase tracking-wider text-foreground/50">capaciteit</p></div></div>;
}

function MetricStackRow({ label, value, color }) {
  const m = useMorph(value);
  return <div className="flex items-center gap-2 w-full"><span className="text-[8px] w-16 uppercase tracking-wider text-foreground/50 shrink-0">{label}</span><div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${m}%` }} transition={{ duration: 0.6 }} /></div><span className="text-[10px] tabular-nums w-5 text-right">{Math.round(m)}</span></div>;
}
function MetricStack() {
  const a = useLiveValue(72, { min: 40, max: 95, step: 3 });
  const b = useLiveValue(54, { min: 20, max: 85, step: 3 });
  const c = useLiveValue(38, { min: 10, max: 70, step: 3 });
  return <div className="flex flex-col gap-2 w-full"><MetricStackRow label="Energie" value={a} color={A.olive} /><MetricStackRow label="Capaciteit" value={b} color={A.ridge} /><MetricStackRow label="Focus" value={c} color={A.sand} /></div>;
}

function RollingNumber() {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => { n++; if (n < 14) setV(Math.floor(Math.random() * 100)); else { setV(42); clearInterval(id); } }, 90);
    return () => clearInterval(id);
  }, []);
  return <div className="text-center"><p className="text-4xl font-display tabular-nums font-semibold" style={{ color: A.olive }}>{String(v).padStart(2, "0")}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">rollend</p></div>;
}

function NumberMorph() {
  const [t, setT] = useState(12);
  useEffect(() => { const id = setInterval(() => setT((x) => x + 1), 1800); return () => clearInterval(id); }, []);
  const v = useMorph(t);
  return <div className="text-center"><p className="text-4xl font-display tabular-nums">{v.toFixed(0)}</p><p className="text-[9px] uppercase tracking-wider text-foreground/50 mt-1">morph</p></div>;
}

function NumberGraphic() {
  const series = useLiveSeries(20, { min: 30, max: 90, vol: 10, ms: 1000 });
  const cur = series[series.length - 1].v;
  return <div className="flex flex-col items-center gap-1"><p className="text-3xl font-display tabular-nums" style={{ color: A.olive }}>{Math.round(cur)}</p><Sparkline data={series.map((d) => d.v)} w={96} h={24} stroke={A.olive} fill={A.olive} /></div>;
}

const accent = A.olive;
const NumericItems = [
  <GraphShell label="Counter" accent={accent}><Counter /></GraphShell>,
  <GraphShell label="Large Number" accent={accent}><LargeNumber /></GraphShell>,
  <GraphShell label="Animated Counter" accent={accent}><AnimatedCounter /></GraphShell>,
  <GraphShell label="Percentage" accent={accent}><Percentage /></GraphShell>,
  <GraphShell label="Currency" accent={accent}><Currency /></GraphShell>,
  <GraphShell label="Score" accent={accent}><Score /></GraphShell>,
  <GraphShell label="Rank" accent={accent}><Rank /></GraphShell>,
  <GraphShell label="Delta" accent={accent}><Delta /></GraphShell>,
  <GraphShell label="Change Indicator" accent={accent}><ChangeIndicator /></GraphShell>,
  <GraphShell label="Countdown" accent={accent}><Countdown /></GraphShell>,
  <GraphShell label="Timer" accent={accent}><Timer /></GraphShell>,
  <GraphShell label="Metric Pair" accent={accent}><MetricPair /></GraphShell>,
  <GraphShell label="Metric Stack" accent={accent}><MetricStack /></GraphShell>,
  <GraphShell label="Rolling Number" accent={accent}><RollingNumber /></GraphShell>,
  <GraphShell label="Number Morph" accent={accent}><NumberMorph /></GraphShell>,
  <GraphShell label="Number + Graphic" accent={accent}><NumberGraphic /></GraphShell>,
];
export default NumericItems;