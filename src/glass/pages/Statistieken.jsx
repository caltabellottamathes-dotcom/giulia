import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { CheckCircle2, Clock, Calendar, TrendingUp } from "lucide-react";
import { PageShell, GlassPanel, GlassButton, SectionHeader, CATEGORY_HEX } from "@/glass/components/glass";
import { TASKS } from "@/glass/lib/tasks";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <GlassPanel className="p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl border border-marble/30 bg-marble/10 flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-marble/60 text-xs">{label}</p>
        <p className="text-storm text-2xl font-semibold leading-none mt-1">{value}</p>
      </div>
    </GlassPanel>
  );
}

export default function Statistieken() {
  const completed = TASKS.filter((t) => t.status === "voltooid").length;
  const running = TASKS.filter((t) => t.status === "lopend").length;
  const planned = TASKS.filter((t) => t.status === "gepland").length;
  const totalMinutes = TASKS.reduce((s, t) => s + t.duration, 0);

  const perCategory = useMemo(() => {
    const map = {};
    TASKS.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.duration;
    });
    return Object.entries(map).map(([name, minutes]) => ({ name, minutes, hours: +(minutes / 60).toFixed(1) }));
  }, []);

  const statusPie = useMemo(() => [
    { name: "Voltooid", value: completed, color: CATEGORY_HEX.Afspraken },
    { name: "Lopend", value: running, color: CATEGORY_HEX.Identiteit },
    { name: "Gepland", value: planned, color: CATEGORY_HEX.Marble || "#E0DED3" },
  ], [completed, running, planned]);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Privé</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Statistieken</h1>
        </div>
        <Link to="/glass">
          <GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CheckCircle2} label="Voltooid" value={completed} accent="text-urgent" />
        <StatCard icon={Clock} label="Lopend" value={running} accent="text-sky" />
        <StatCard icon={Calendar} label="Gepland" value={planned} accent="text-marble" />
        <StatCard icon={TrendingUp} label="Totaal uren" value={+(totalMinutes / 60).toFixed(1)} accent="text-sand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time per category bar chart */}
        <GlassPanel className="lg:col-span-2 p-6">
          <SectionHeader number={1} title="Tijd besteed per categorie (minuten)" />
          <div className="h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,222,211,0.12)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#E0DED3", fontSize: 11 }} axisLine={{ stroke: "rgba(224,222,211,0.2)" }} tickLine={false} />
                <YAxis tick={{ fill: "#E0DED3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(224,222,211,0.08)" }}
                  contentStyle={{ background: "rgba(45,45,35,0.9)", border: "1px solid rgba(224,222,211,0.3)", borderRadius: 12, color: "#F2F2F0", fontSize: 12 }}
                />
                <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                  {perCategory.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_HEX[entry.name] || "#B1BEC6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Status distribution pie */}
        <GlassPanel className="p-6">
          <SectionHeader number={2} title="Statusverdeling" />
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>
                  {statusPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="rgba(45,45,35,0.4)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "rgba(45,45,35,0.9)", border: "1px solid rgba(224,222,211,0.3)", borderRadius: 12, color: "#F2F2F0", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {statusPie.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-marble/80">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="text-storm font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}