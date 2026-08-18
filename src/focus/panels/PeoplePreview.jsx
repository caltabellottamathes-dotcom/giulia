import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PreviewShell from "@/system/panels/PreviewShell";
import { CountUp, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const DEEP = "#595f34", URG = "#d5e24a", LIGHT = "#d8dab3", MID = "#94925d";
const DEPT = [
  { n: "Klant", c: MID }, { n: "Team", c: LIGHT }, { n: "Leverancier", c: "#6b6a4a" }, { n: "Overig", c: URG },
];
const initials = (name) => (name || "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const deptC = (d) => (DEPT.find(x => x.n === d) || {}).c || MID;

export default function PeoplePreview({ onOpen }) {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Contact.filter({}, "name", 60).then(data => {
      setPeople((data || []).map(c => ({
        id: c.id, name: c.name || "Onbekend", dept: c.relationship_type || "Overig",
        role: c.role || c.company || "—", available: true,
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = people.filter(p => p.available).length;
  const filtered = people.filter(p => (p.name + " " + p.dept + " " + p.role).toLowerCase().includes(q.toLowerCase()));
  const deptData = DEPT.map(d => ({ ...d, v: people.filter(p => p.dept === d.n).length }));

  return (
    <PreviewShell index="07" section="PEOPLE" statement={`${active} CONTACTEN`} kicker="NETWERK" accent={URG}
      context={[
        { label: "TOTAL", text: `${people.length} contacten in je netwerk.` },
        { label: "ACTIVE", text: `${active} nu direct bereikbaar.` },
        { label: "CATEGORIE", text: `${DEPT.length} relatie-types vertegenwoordigd.` },
      ]}
      actions={[{ label: "Invite", primary: true, to: "/people" }, { label: "Filter", to: "/people" }, { label: "Export", to: "/people" }, { label: "Open People", to: "/people" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">PEOPLE</p>
            <p className="text-storm text-4xl font-bold mt-1 tabular-nums"><CountUp to={people.length} /></p>
            <p className="text-urgent text-[10px] tracking-wider mt-2">{active} beschikbaar</p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">CATEGORIES</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={deptData} dataKey="v" nameKey="n" innerRadius={32} outerRadius={54} paddingAngle={3} isAnimationActive animationDuration={1000}>
                  {deptData.map((c, i) => <Cell key={i} fill={c.c} stroke="transparent" />)}
                </Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {DEPT.map(c => <span key={c.n} className="flex items-center gap-1.5 text-[10px] text-storm/70"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.c }} />{c.n}</span>)}
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">PRESENCE · LIVE</p>
            <PulseWave color={LIGHT} bars={18} height={34} />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Zoek mensen, categorie of rol..." className="w-full rounded-xl border border-marble/30 bg-marble/5 px-4 py-2.5 text-sm text-storm placeholder:text-storm/40 focus:outline-none focus:border-sand mb-3" />
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">{filtered.length} RESULTATEN</p>
          <div className="flex-1 overflow-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : filtered.length === 0 ? <p className="text-storm/40 text-sm">Geen contacten.</p> : filtered.map(p => (
              <div key={p.id} onClick={onOpen} className="flex items-center gap-3 rounded-2xl border border-marble/20 bg-marble/5 hover:bg-marble/10 px-4 py-3 text-left transition-colors cursor-pointer">
                <span className="relative shrink-0">
                  <span className="w-10 h-10 rounded-full bg-plum/40 text-storm text-xs font-semibold flex items-center justify-center">{initials(p.name)}</span>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-metal ${p.available ? "bg-urgent" : "bg-marble/30"}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-storm truncate">{p.name}</p>
                  <p className="text-[10px] text-storm/50 truncate">{p.dept} · {p.role}</p>
                </div>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: deptC(p.dept) }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}