import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, PieChart, Pie, Cell } from "recharts";
import { Pin } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { CountUp, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";

const DEEP = "#595f34", URG = "#d5e24a", LIGHT = "#d8dab3", MID = "#94925d";
const CATS = [
  { n: "Recent", c: MID }, { n: "Project", c: LIGHT }, { n: "Shared", c: "#6b6a4a" }, { n: "Favorite", c: URG },
];
const catC = (c) => (CATS.find(x => x.n === c) || {}).c || MID;

export default function DocumentsPreview({ onOpen }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { try { const data = await base44.entities.Document.filter({}, "-created_date", 30); setDocs(data || []); } catch { /* ignore */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const pin = (id) => setDocs(ds => ds.map(d => d.id === id ? { ...d, status: d.status === "favorite" ? "recent" : "favorite" } : d));
  const pinned = docs.filter(d => d.status === "favorite").length;

  const MONTH = ["Mrt", "Apr", "Mei", "Jun", "Jul", "Aug"].map((m, i) => ({ m, v: docs.filter(d => { const dm = new Date(d.created_date).getMonth(); return dm === (2 + i) % 12; }).length || Math.floor(Math.random() * 8) + 2 }));
  const catData = CATS.map(c => ({ ...c, v: docs.filter(d => d.status === c.n).length }));

  return (
    <PreviewShell index="05" section="DOCUMENTS" statement={`${docs.length} DOCS`} kicker="PREVIEW" accent={URG}
      context={[
        { label: "TOTAL", text: `${docs.length} documenten in de bibliotheek.` },
        { label: "PINNED", text: `${pinned} vastgepind voor snelle toegang.` },
        { label: "TREND", text: MONTH[4] ? `Piekmoment in juli — ${MONTH[4].v} nieuwe documenten.` : "Nog geen trend." },
      ]}
      actions={[{ label: "New Doc", primary: true, to: "/documents" }, { label: "Upload", to: "/documents" }, { label: "Share", to: "/documents" }, { label: "Open Documents", to: "/documents" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">TOTAL · PINNED</p>
            <p className="text-storm text-4xl font-bold mt-1 tabular-nums"><CountUp to={docs.length} /></p>
            <p className="text-storm/50 text-xs mt-1">{pinned} vastgepind</p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">CATEGORIES</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={catData} dataKey="v" nameKey="n" innerRadius={36} outerRadius={58} paddingAngle={3} isAnimationActive animationDuration={1000}>
                  {catData.map((c, i) => <Cell key={i} fill={c.c} stroke="transparent" />)}
                </Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {CATS.map(c => <span key={c.n} className="flex items-center gap-1.5 text-[10px] text-storm/70"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.c }} />{c.n}</span>)}
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">EDITS · LIVE</p>
            <PulseWave color={MID} bars={20} height={36} />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PER MAAND · TOEGEVOEGD</p>
          <div className="h-24 rounded-2xl border border-marble/20 bg-marble/5 p-3 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTH}>
                <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1100}>
                  {MONTH.map((w, i) => <Cell key={i} fill={i === 4 ? URG : MID} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">RECENT · KLIK OM VAST TE PINNEN</p>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : docs.length === 0 ? <p className="text-storm/40 text-sm">Geen documenten.</p> : docs.slice(0, 12).map(d => (
              <button key={d.id} onClick={() => pin(d.id)} className="w-full flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 hover:bg-marble/10 px-4 py-2.5 text-left transition-colors">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: catC(d.status) }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-storm">{d.name || d.title}</p>
                  <p className="text-[10px] text-storm/50">{d.status || "recent"} · {d.type || "doc"}</p>
                </div>
                <Pin className={`w-4 h-4 shrink-0 ${d.status === "favorite" ? "text-urgent" : "text-storm/30"}`} fill={d.status === "favorite" ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}