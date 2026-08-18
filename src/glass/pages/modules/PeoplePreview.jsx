import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ModuleShell from "@/glass/components/modules/ModuleShell";
import { CountUp, PulseWave } from "@/glass/components/modules/viz";

const SAND = "#94925d", OLIVE = "#d8dab3", URG = "#d5e24a";
const DEPT = [
  { n: "Design", v: 6, c: SAND }, { n: "Research", v: 4, c: OLIVE }, { n: "Ops", v: 3, c: "#6b6a4a" }, { n: "Sales", v: 2, c: URG },
];
const PEOPLE = [
  { id: 1, name: "Giulia Visser", dept: "Design", role: "Lead", available: true },
  { id: 2, name: "F. de Boer", dept: "Research", role: "Analist", available: true },
  { id: 3, name: "M. Jansen", dept: "Ops", role: "Engineer", available: false },
  { id: 4, name: "T. Bakker", dept: "Sales", role: "Manager", available: true },
  { id: 5, name: "S. Kaya", dept: "Design", role: "Designer", available: true },
  { id: 6, name: "L. Peters", dept: "Research", role: "Analist", available: false },
  { id: 7, name: "R. de Wit", dept: "Ops", role: "DevOps", available: true },
  { id: 8, name: "K. Smit", dept: "Sales", role: "Rep", available: false },
];
const initials = (name) => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const deptC = (d) => (DEPT.find(x => x.n === d) || {}).c || SAND;

export default function PeoplePreview() {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState(PEOPLE);
  const active = people.filter(p => p.available).length;
  const filtered = people.filter(p => (p.name + " " + p.dept + " " + p.role).toLowerCase().includes(q.toLowerCase()));
  const toggle = (id) => setPeople(ps => ps.map(p => p.id === id ? { ...p, available: !p.available } : p));
  return (
    <ModuleShell index="07" section="PEOPLE" statement={`${active} ACTIVE`} kicker="TEAM"
      context={[
        { label: "TOTAL", text: `${people.length} mensen in het team.` },
        { label: "AVAILABLE", text: `${active} nu direct bereikbaar.` },
        { label: "OFFLINE", text: `${people.length - active} momenteel niet beschikbaar.` },
      ]}
      actions={[{ label: "Invite", primary: true }, { label: "Filter" }, { label: "Export" }, { label: "Open People" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-6 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">PEOPLE</p>
            <p className="text-storm text-5xl font-bold mt-1 tabular-nums"><CountUp to={people.length} /></p>
            <p className="text-urgent text-[10px] tracking-wider mt-2">{active} nu beschikbaar</p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">DEPARTMENTS</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={DEPT} dataKey="v" nameKey="n" innerRadius={36} outerRadius={60} paddingAngle={3} isAnimationActive animationDuration={1000}>
                  {DEPT.map((c, i) => <Cell key={i} fill={c.c} stroke="transparent" />)}
                </Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {DEPT.map(c => <span key={c.n} className="flex items-center gap-1.5 text-[10px] text-storm/70"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.c }} />{c.n}</span>)}
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">PRESENCE · LIVE</p>
            <PulseWave color={OLIVE} bars={20} height={36} />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Zoek mensen, afdeling of rol..." className="w-full rounded-xl border border-marble/30 bg-marble/5 px-4 py-2.5 text-sm text-storm placeholder:text-storm/40 focus:outline-none focus:border-sand mb-3" />
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">{filtered.length} RESULTATEN · KLIK OM BESCHIKBAARHEID TE WISSELEN</p>
          <div className="flex-1 overflow-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
            {filtered.map(p => (
              <button key={p.id} onClick={() => toggle(p.id)} className="flex items-center gap-3 rounded-2xl border border-marble/20 bg-marble/5 hover:bg-marble/10 px-4 py-3 text-left transition-colors">
                <span className="relative shrink-0">
                  <span className="w-10 h-10 rounded-full bg-plum/40 text-storm text-xs font-semibold flex items-center justify-center">{initials(p.name)}</span>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-metal ${p.available ? "bg-urgent" : "bg-marble/30"}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-storm truncate">{p.name}</p>
                  <p className="text-[10px] text-storm/50 truncate">{p.dept} · {p.role}</p>
                </div>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: deptC(p.dept) }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}