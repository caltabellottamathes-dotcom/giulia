import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, PieChart, Pie, Cell } from "recharts";
import { Pin } from "lucide-react";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { CountUp, PulseWave } from "@/glass/components/modules/viz";

const SAND = "#94925d", OLIVE = "#d8dab3", URG = "#d5e24a";
const CATS = [
  { n: "Reports", v: 18, c: SAND },
  { n: "Contracts", v: 12, c: OLIVE },
  { n: "Notes", v: 24, c: "#6b6a4a" },
  { n: "Drafts", v: 9, c: URG },
];
const MONTH = [{ m: "Mrt", v: 6 }, { m: "Apr", v: 9 }, { m: "Mei", v: 14 }, { m: "Jun", v: 8 }, { m: "Jul", v: 17 }, { m: "Aug", v: 11 }];
const DOCS = [
  { id: 1, name: "Marktanalyse Q3 — concept", cat: "Reports", edited: "2u geleden", pinned: true },
  { id: 2, name: "Contract Centrum West", cat: "Contracts", edited: "gisteren", pinned: false },
  { id: 3, name: "Notities 14-08", cat: "Notes", edited: "vandaag", pinned: true },
  { id: 4, name: "Concept Brons proposal", cat: "Drafts", edited: "3u geleden", pinned: false },
  { id: 5, name: "Jaarrapport 2025", cat: "Reports", edited: "gisteren", pinned: false },
  { id: 6, name: "Brainstorm identiteit", cat: "Notes", edited: "vandaag", pinned: false },
];
const catC = (c) => (CATS.find(x => x.n === c) || {}).c || SAND;

export default function DocumentsPreview() {
  const [docs, setDocs] = useState(DOCS);
  const pinned = docs.filter(d => d.pinned).length;
  const pin = (id) => setDocs(ds => ds.map(d => d.id === id ? { ...d, pinned: !d.pinned } : d));
  return (
    <ModuleShell index="05" section="DOCUMENTS" statement={`${docs.length} DOCS`} kicker="PREVIEW"
      context={[
        { label: "TOTAL", text: `${docs.length} documenten in de bibliotheek.` },
        { label: "PINNED", text: `${pinned} vastgepind voor snelle toegang.` },
        { label: "TREND", text: "Piekmoment in juli — 17 nieuwe documenten." },
      ]}
      actions={[{ label: "New Doc", primary: true }, { label: "Upload" }, { label: "Share" }, { label: "Open Documents" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">TOTAL · PINNED</p>
            <p className="text-storm text-5xl font-bold mt-1 tabular-nums"><CountUp to={docs.length} /></p>
            <p className="text-storm/50 text-xs mt-1">{pinned} vastgepind</p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">CATEGORIES</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={CATS} dataKey="v" nameKey="n" innerRadius={42} outerRadius={68} paddingAngle={3} isAnimationActive animationDuration={1000}>
                  {CATS.map((c, i) => <Cell key={i} fill={c.c} stroke="transparent" />)}
                </Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {CATS.map(c => <span key={c.n} className="flex items-center gap-1.5 text-[10px] text-storm/70"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.c }} />{c.n}</span>)}
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">EDITS · LIVE</p>
            <PulseWave color={SAND} bars={22} height={40} />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PER MAAND · TOEGEVOEGD</p>
          <div className="h-32 rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTH}>
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1100}>
                  {MONTH.map((w, i) => <Cell key={i} fill={i === 4 ? URG : SAND} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3 mt-4">RECENT · KLIK OM VAST TE PINNEN</p>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {docs.map(d => (
              <button key={d.id} onClick={() => pin(d.id)} className="w-full flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 hover:bg-marble/10 px-4 py-2.5 text-left transition-colors">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: catC(d.cat) }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-storm">{d.name}</p>
                  <p className="text-[10px] text-storm/50">{d.cat} · {d.edited}</p>
                </div>
                <Pin className={`w-4 h-4 shrink-0 ${d.pinned ? "text-urgent" : "text-storm/30"}`} fill={d.pinned ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}