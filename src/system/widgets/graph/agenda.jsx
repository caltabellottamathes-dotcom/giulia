import React, { useState } from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A, useTick } from "./graphData";

/* ── AGENDA VISUALS — agenda als visueel systeem ────────────── */

const DOM = { focus: A.olive, life: A.ridge, self: A.sand, giulia: A.smoke };
const DAY_HOURS = 16; // 06:00 → 22:00

function dayCol(events) {
  return (
    <div className="relative flex-1 h-full">
      {events.map((e, i) => (
        <motion.div key={i} className="absolute left-0.5 right-0.5 rounded-md px-1 py-0.5 text-[7px] leading-tight truncate text-white"
          style={{ top: `${(e.start / DAY_HOURS) * 100}%`, height: `${(e.dur / DAY_HOURS) * 100}%`, background: DOM[e.dom] || A.smoke }}
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
          {e.title}
        </motion.div>
      ))}
    </div>
  );
}

function WeekGridG() {
  const cols = DAYS.map((d) => [
    { title: "x", start: 2, dur: 1.5, dom: "focus" }, { title: "y", start: 6, dur: 1, dom: "life" }, { title: "z", start: 11, dur: 2, dom: "self" },
  ].slice(0, 1 + (d.length % 3)));
  return <div className="w-full"><div className="flex gap-0.5 mb-1">{DAYS.map((d) => <span key={d} className="flex-1 text-[8px] uppercase tracking-wider text-foreground/50 text-center">{d}</span>)}</div><div className="flex gap-0.5 h-[120px] rounded-lg bg-foreground/5 p-1">{cols.map((ev, i) => <div key={i} className="flex-1 relative">{dayCol(ev)}</div>)}</div></div>;
}

const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function DayTimelineG() {
  const ev = [
    { title: "Standup", start: 3, dur: 0.5, dom: "focus" },
    { title: "Focus-blok", start: 4.5, dur: 3, dom: "self" },
    { title: "Lunch", start: 7, dur: 0.5, dom: "life" },
    { title: "Belafspraak", start: 8, dur: 1, dom: "focus" },
    { title: "Review", start: 10, dur: 0.5, dom: "life" },
  ];
  return <div className="w-full h-[150px] relative rounded-lg bg-foreground/5 p-1">{dayCol(ev)}</div>;
}

function CurrentTimeLineG() {
  useTick(30000);
  const now = new Date();
  const frac = Math.max(0, Math.min(1, (now.getHours() + now.getMinutes() / 60 - 6) / DAY_HOURS));
  const ev = [{ title: "Focus", start: 4, dur: 2, dom: "self" }, { title: "Call", start: 8, dur: 1, dom: "focus" }];
  return <div className="w-full h-[150px] relative rounded-lg bg-foreground/5 p-1">{dayCol(ev)}<motion.div className="absolute left-0 right-0 h-0.5 -translate-y-1/2 z-10" style={{ top: `${frac * 100}%`, background: A.urgent }} animate={{ boxShadow: ["0 0 0 2px rgba(213,226,74,0.2)", "0 0 0 5px rgba(213,226,74,0)"] }} transition={{ duration: 1.6, repeat: Infinity }} /><span className="absolute right-1 text-[8px] font-bold tabular-nums -translate-y-1/2 z-10" style={{ top: `${frac * 100}%`, color: A.urgent }}>{now.getHours()}:{String(now.getMinutes()).padStart(2, "0")}</span></div>;
}

function ScheduleDensityG() {
  const dens = [2, 3, 5, 8, 12, 9, 6, 11, 14, 10, 7, 5, 8, 12, 15, 11, 6, 4, 3, 2, 1, 1, 0, 0];
  const max = Math.max(...dens, 1);
  return <div className="w-full"><div className="flex items-end gap-0.5 h-[110px]">{dens.map((v, i) => <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${(v / max) * 100}%`, background: v / max > 0.7 ? A.urgent : A.olive, opacity: 0.3 + (v / max) * 0.7 }} />)}</div><div className="flex justify-between text-[7px] text-foreground/40 mt-1"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div></div>;
}

function CalendarHeatmapG() {
  const cells = Array.from({ length: 35 }, () => Math.random());
  return <div className="grid grid-cols-7 gap-1 w-full max-w-[200px]">{cells.map((v, i) => <div key={i} className="aspect-square rounded-sm" style={{ background: v < 0.2 ? "hsl(var(--foreground)/0.08)" : A.olive, opacity: 0.2 + v * 0.8 }} />)}</div>;
}

function FocusBlockG() {
  const [p, setP] = useState(60);
  return <div className="w-full"><div className="rounded-lg p-3" style={{ background: A.olive, color: "#fff" }}><p className="text-[10px] uppercase tracking-wider opacity-80">Focus-blok</p><p className="text-base font-display font-semibold mt-0.5">Diep werk</p><div className="mt-2 h-1.5 rounded-full bg-white/25 overflow-hidden"><motion.div className="h-full bg-white" animate={{ width: `${p}%` }} transition={{ duration: 0.6 }} /></div><p className="text-[9px] mt-1 opacity-80">{Math.round(p)}% · nog 48 min</p></div><input type="range" min={0} max={100} value={p} onChange={(e) => setP(+e.target.value)} className="w-full mt-2 accent-olive" /></div>;
}

function ConflictG() {
  return <div className="w-full h-[130px] relative rounded-lg bg-foreground/5 p-1"><div className="absolute left-1 right-1 rounded-md px-1.5 py-1 text-[9px] text-white" style={{ top: "20%", height: "26%", background: A.olive }}>A · 10:00–11:00</div><motion.div className="absolute left-1 right-1 rounded-md px-1.5 py-1 text-[9px] text-white" style={{ top: "36%", height: "26%", background: A.urgent, opacity: 0.85 }} animate={{ x: [0, 4, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>B · 10:30–11:30 ⚠ conflict</motion.div></div>;
}

function EventStackG() {
  const ev = [{ title: "A", start: 2, dur: 2, dom: "focus" }, { title: "B", start: 2.5, dur: 1.5, dom: "life" }, { title: "C", start: 4, dur: 1, dom: "self" }];
  return <div className="w-full h-[130px] relative rounded-lg bg-foreground/5 p-1"><div className="flex gap-1 h-full">{[0, 1, 2].map((c) => <div key={c} className="flex-1 relative"><motion.div className="absolute left-0 right-0 rounded-md px-1 py-0.5 text-[8px] text-white" style={{ top: `${(ev[c].start / 8) * 100}%`, height: `${(ev[c].dur / 8) * 100}%`, background: DOM[ev[c].dom] }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: c * 0.1 }}>{ev[c].title}</motion.div></div>)}</div></div>;
}

function FreeTimeFieldG() {
  return <div className="w-full h-[110px] rounded-lg relative overflow-hidden" style={{ background: "repeating-linear-gradient(45deg, hsl(var(--foreground)/0.05), hsl(var(--foreground)/0.05) 6px, hsl(var(--foreground)/0.08) 6px, hsl(var(--foreground)/0.08) 12px)" }}><div className="absolute inset-0 flex flex-col items-center justify-center"><p className="text-sm font-display font-semibold" style={{ color: A.ridge }}>Vrije tijd</p><p className="text-[9px] text-foreground/50">14:00 – 17:00 · 3u</p></div></div>;
}

const accent = A.olive;
const AgendaItems = [
  <GraphShell label="Day Timeline" accent={accent} className="xl:col-span-2"><DayTimelineG /></GraphShell>,
  <GraphShell label="Week Grid" accent={accent} className="xl:col-span-2"><WeekGridG /></GraphShell>,
  <GraphShell label="Current Time Line" accent={accent} className="xl:col-span-2"><CurrentTimeLineG /></GraphShell>,
  <GraphShell label="Event Stack" accent={accent}><EventStackG /></GraphShell>,
  <GraphShell label="Conflict Visualization" accent={accent}><ConflictG /></GraphShell>,
  <GraphShell label="Focus Block" accent={accent}><FocusBlockG /></GraphShell>,
  <GraphShell label="Free Time Field" accent={accent}><FreeTimeFieldG /></GraphShell>,
  <GraphShell label="Schedule Density" accent={accent}><ScheduleDensityG /></GraphShell>,
  <GraphShell label="Calendar Heatmap" accent={accent}><CalendarHeatmapG /></GraphShell>,
];
export default AgendaItems;