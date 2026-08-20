import React, { useState } from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A, useMorph } from "./graphData";

/* ── TIMELINES — interactief, met vloeiende voortgang ───────── */

function HTrack({ items, active, setActive, accent }) {
  const pct = items.length > 1 ? (active / (items.length - 1)) * 100 : 0;
  return (
    <div className="relative pt-1 pb-4 w-full max-w-[220px]">
      <div className="relative h-1.5 rounded-full" style={{ background: "hsl(var(--foreground)/0.12)" }}>
        <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: accent }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
        <motion.div className="absolute inset-y-0 rounded-full" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)", width: "28%" }} animate={{ left: ["-28%", "100%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
      </div>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between" style={{ padding: "0 2px" }}>
        {items.map((it, i) => (
          <button key={i} type="button" onClick={() => setActive(i)} className="relative -m-1 p-1">
            <motion.span className="block rounded-full" style={{ background: i <= active ? accent : "hsl(var(--foreground)/0.3)", width: i === active ? 12 : 8, height: i === active ? 12 : 8 }} animate={{ scale: i === active ? 1 : 0.9 }} />
            {it.milestone && i <= active && <motion.span className="absolute rounded-full" style={{ border: `1px solid ${accent}`, width: 11, height: 11, top: 1.5, left: 1.5 }} animate={{ scale: [1, 2], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-3 text-[7px] uppercase tracking-wider">
        {items.map((it, i) => <span key={i} className="text-center" style={{ opacity: i === active ? 1 : 0.45, color: i === active ? accent : undefined, width: 44 }}>{it.label}</span>)}
      </div>
    </div>
  );
}

function StepTrack({ items, active, setActive, accent }) {
  return (
    <div className="relative flex flex-col pl-1 w-full max-w-[200px]">
      <div className="absolute left-[6px] top-2 bottom-2 w-0.5 rounded-full" style={{ background: "hsl(var(--foreground)/0.12)" }} />
      <motion.div className="absolute left-[6px] top-2 w-0.5 rounded-full" style={{ background: accent }} animate={{ height: `${items.length > 1 ? (active / (items.length - 1)) * 100 : 100}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
      {items.map((it, i) => (
        <button key={i} type="button" onClick={() => setActive(i)} className="relative flex items-start gap-2.5 py-1.5 text-left">
          <motion.span className="relative z-10 mt-0.5 rounded-full shrink-0" style={{ background: i <= active ? accent : "hsl(var(--foreground)/0.3)", width: i === active ? 12 : 8, height: i === active ? 12 : 8 }} animate={{ scale: i === active ? 1 : 0.9 }} />
          <div className="min-w-0 flex-1"><p className="text-[10px] font-medium leading-tight" style={{ opacity: i === active ? 1 : 0.6 }}>{it.label}</p>{it.sub && <p className="text-[8px] opacity-50 truncate">{it.sub}</p>}</div>
        </button>
      ))}
    </div>
  );
}

function HTimeline({ items }) {
  const [active, setActive] = useState(0);
  const cur = items[active];
  return <div className="flex flex-col items-center gap-1 w-full"><div className="text-center min-h-[34px]"><motion.p key={active} className="text-sm font-display font-semibold" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{cur.label}</motion.p>{cur.sub && <p className="text-[9px] text-foreground/50">{cur.sub}</p>}</div><HTrack items={items} active={active} setActive={setActive} accent={A.olive} /></div>;
}
function VTimeline({ items }) {
  const [active, setActive] = useState(0);
  return <StepTrack items={items} active={active} setActive={setActive} accent={A.olive} />;
}

const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const WEEK_ITEMS = DAYS.map((d, i) => ({ label: d, sub: ["Kickoff", "Design", "Review", "Test", "Ship", "Rust", "Rust"][i], milestone: [0, 2, 4].includes(i) }));
const MONTH_ITEMS = ["W1", "W2", "W3", "W4"].map((d, i) => ({ label: d, sub: ["Plan", "Bouw", "Test", "Live"][i], milestone: i === 3 }));
const PROJECT_ITEMS = ["Start", "Onderzoek", "Bouw", "Testen", "Oplevering"].map((d, i) => ({ label: d, milestone: [0, 4].includes(i) }));
const JOURNEY = ["Ideëren", "Schetsen", "Bouwen", "Testen", "Live"].map((d, i) => ({ label: d, sub: `fase ${i + 1}`, milestone: i === 4 }));
const DAY_ITEMS = ["09:00", "11:00", "13:00", "15:00", "17:00"].map((d, i) => ({ label: d, sub: ["Standup", "Focus", "Lunch", "Bel", "Review"][i], milestone: i === 1 }));
const EVENT_ITEMS = ["Type", "Type", "Type", "Type", "Type"].map((d, i) => ({ label: ["Mail", "Call", "Task", "Idee", "Besluit"][i], sub: ["gelezen", "gepland", "afgerond", "opgeslagen", "genomen"][i] }));
const ACTIVITY = ["Actie", "Actie", "Actie", "Actie"].map((d, i) => ({ label: ["Sync", "Mail", "Plan", "Doel"][i], sub: ["08:12", "09:40", "11:05", "13:20"][i] }));
const DEADLINE = ["Nu", "+1d", "+3d", "+1w", "+2w"].map((d, i) => ({ label: d, sub: ["Taak A", "Taak B", "Mijlpaal", "Review", "Oplevering"][i], milestone: [2, 4].includes(i) }));

const accent = A.olive;
const TimelineItems = [
  <GraphShell label="Horizontal Timeline" accent={accent} className="xl:col-span-2"><HTimeline items={DAY_ITEMS} /></GraphShell>,
  <GraphShell label="Vertical Timeline" accent={accent}><VTimeline items={JOURNEY} /></GraphShell>,
  <GraphShell label="Day Timeline" accent={accent}><HTimeline items={DAY_ITEMS} /></GraphShell>,
  <GraphShell label="Week Timeline" accent={accent} className="xl:col-span-2"><HTimeline items={WEEK_ITEMS} /></GraphShell>,
  <GraphShell label="Month Timeline" accent={accent}><HTimeline items={MONTH_ITEMS} /></GraphShell>,
  <GraphShell label="Event Timeline" accent={accent}><VTimeline items={EVENT_ITEMS} /></GraphShell>,
  <GraphShell label="Activity Timeline" accent={accent}><VTimeline items={ACTIVITY} /></GraphShell>,
  <GraphShell label="Deadline Timeline" accent={accent} className="xl:col-span-2"><HTimeline items={DEADLINE} /></GraphShell>,
  <GraphShell label="Project Timeline" accent={accent}><VTimeline items={PROJECT_ITEMS.map((p) => ({ ...p, sub: "" }))} /></GraphShell>,
  <GraphShell label="Journey Timeline" accent={accent}><HTimeline items={JOURNEY} /></GraphShell>,
];
export default TimelineItems;