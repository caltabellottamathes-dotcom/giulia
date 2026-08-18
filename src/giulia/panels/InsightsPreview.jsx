import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { CheckCircle2, Clock, Calendar, TrendingUp } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { base44 } from "@/api/base44Client";

const PLUM = "#301728", URG = "#d5e24a", MID = "#94925d", LIGHT = "#d8dab3";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl border border-marble/30 bg-marble/10 flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-marble/60 text-xs">{label}</p>
        <p className="text-storm text-xl font-semibold leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function InsightsPreview({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Insight.filter({ status: "new" }, "-created_date", 50).then(data => setItems(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const completed = items.filter(i => i.status === "confirmed").length;
  const running = items.filter(i => i.status === "new").length;
  const planned = items.filter(i => i.status === "active").length;
  const avgConf = items.length ? Math.round(items.reduce((s, i) => s + (i.confidence || 0), 0) / items.length * 100) : 0;

  const perCategory = useMemo(() => {
    const map = {};
    items.forEach(i => { const c = i.category || "Other"; map[c] = (map[c] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.slice(0, 8), value }));
  }, [items]);

  const statusPie = useMemo(() => [
    { name: "Bevestigd", value: completed, color: URG },
    { name: "Nieuw", value: running, color: MID },
    { name: "Actief", value: planned, color: LIGHT },
  ], [completed, running, planned]);

  return (
    <PreviewShell index="14" section="INSIGHTS" statement={`${running} NIEUW`} kicker="PATTERNS" accent={URG}
      context={[
        { label: "NIEUW", text: `${running} nieuwe inzichten gevonden.` },
        { label: "VERTROUWEN", text: `${avgConf}% gemiddeld vertrouwen.` },
        { label: "BEVESTIGD", text: `${completed} inzichten bevestigd door jou.` },
      ]}
      actions={[{ label: "Analyze", primary: true, to: "/insights" }, { label: "Filter", to: "/insights" }, { label: "Export", to: "/insights" }, { label: "Open Inzichten", to: "/insights" }]}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard icon={CheckCircle2} label="Bevestigd" value={completed} accent="text-urgent" />
          <StatCard icon={Clock} label="Nieuw" value={running} accent="text-sand" />
          <StatCard icon={Calendar} label="Actief" value={planned} accent="text-marble" />
          <StatCard icon={TrendingUp} label="Vertrouwen" value={`${avgConf}%`} accent="text-sky" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
          <div className="lg:col-span-2 rounded-2xl border border-marble/20 bg-marble/5 p-4 flex flex-col overflow-hidden">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PER CATEGORIE</p>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,222,211,0.12)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#E0DED3", fontSize: 10 }} axisLine={{ stroke: "rgba(224,222,211,0.2)" }} tickLine={false} />
                  <YAxis tick={{ fill: "#E0DED3", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(224,222,211,0.08)" }} contentStyle={{ background: "rgba(45,45,35,0.9)", border: "1px solid rgba(224,222,211,0.3)", borderRadius: 12, color: "#F2F2F0", fontSize: 12 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={1000}>
                    {perCategory.map((entry, i) => <Cell key={i} fill={[PLUM, MID, LIGHT, URG, "#6b6a4a"][i % 5]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4 flex flex-col overflow-hidden">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">STATUSVERDELING</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={36} outerRadius={58} paddingAngle={3} isAnimationActive animationDuration={1000}>
                    {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} stroke="rgba(45,45,35,0.4)" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(45,45,35,0.9)", border: "1px solid rgba(224,222,211,0.3)", borderRadius: 12, color: "#F2F2F0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 mt-3">
              {statusPie.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-marble/80"><span className="w-3 h-3 rounded-full" style={{ background: s.color }} />{s.name}</span>
                  <span className="text-storm font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}