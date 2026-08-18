import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Clock, Euro } from "lucide-react";
import { PageShell, GlassButton, Divider, SectionHeader } from "@/glass/components/glass";
import { TIME_ENTRIES } from "@/glass/lib/time";

const COLORS = ["#d5e24a", "#B1BEC6", "#94925D", "#868564", "#E0DED3", "#d5e24a"];

export default function Tijdsregistratie() {
  const total = TIME_ENTRIES.reduce((s, e) => s + e.hours, 0);
  const billable = TIME_ENTRIES.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
  const data = useMemo(() => TIME_ENTRIES.map((e) => ({ name: e.project, uren: e.hours })), []);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Tijd</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Tijdsregistratie</h1>
        </div>
        <Link to="/glass"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
          <div className="flex items-center gap-2 text-marble/60 text-xs"><Clock className="w-3.5 h-3.5" /> Totaal</div>
          <p className="text-storm text-3xl font-semibold mt-1">{total}<span className="text-base text-marble/50">u</span></p>
        </div>
        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
          <div className="flex items-center gap-2 text-urgent text-xs"><Euro className="w-3.5 h-3.5" /> Factureerbaar</div>
          <p className="text-storm text-3xl font-semibold mt-1">{billable}<span className="text-base text-marble/50">u</span></p>
        </div>
        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
          <div className="flex items-center gap-2 text-sky text-xs"><Clock className="w-3.5 h-3.5" /> Intern</div>
          <p className="text-storm text-3xl font-semibold mt-1">{total - billable}<span className="text-base text-marble/50">u</span></p>
        </div>
      </div>

      <Divider className="mb-5" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-marble/20 bg-marble/5 p-6">
          <SectionHeader number={1} title="Uren per project" />
          <div className="h-72 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,222,211,0.12)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#E0DED3", fontSize: 10 }} axisLine={{ stroke: "rgba(224,222,211,0.2)" }} tickLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis tick={{ fill: "#E0DED3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(224,222,211,0.08)" }} contentStyle={{ background: "rgba(45,45,35,0.9)", border: "1px solid rgba(224,222,211,0.3)", borderRadius: 12, color: "#F2F2F0", fontSize: 12 }} />
                <Bar dataKey="uren" radius={[8, 8, 0, 0]}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6">
          <SectionHeader number={2} title="Specificatie" />
          <div className="mt-4 flex flex-col gap-2">
            {TIME_ENTRIES.map((e) => (
              <div key={e.project} className="flex items-center justify-between text-sm">
                <span className="text-marble/80 truncate pr-2">{e.project}</span>
                <span className="text-storm tabular-nums shrink-0">{e.hours}u {e.billable && <span className="text-urgent text-[10px]">€</span>}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}