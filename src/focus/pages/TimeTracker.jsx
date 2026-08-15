import React from "react";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { useTimeTracker, formatMinutes } from "@/lib/useTimeTracker";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { Timer, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const COLORS = ["hsl(var(--olive))", "hsl(var(--sand))", "hsl(var(--blue-grey))", "hsl(var(--powder))", "hsl(var(--steel))", "hsl(var(--ridge))"];

/** Tijdregistratie-pagina — (naar /slick/tijdsregistratie) in app-branding met
 *  live uren-data. Layout handmatig aanpasbaar. */
export default function TimeTracker() {
  const tt = useTimeTracker();
  const { data: projects } = useEntityList("Project");
  const projName = (id) => projects.find((p) => p.id === id)?.title || "—";
  const total = (tt.entries || []).reduce((s, e) => s + (e.duration_minutes || 0), 0);
  const projEntries = Object.entries(tt.perProject || {}).sort((a, b) => b[1] - a[1]);
  const data = projEntries.map(([id, min]) => ({ name: projName(id), uren: +(min / 60).toFixed(1) }));

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="timetracker" image={IMAGES.hourglassJacket} icon={Timer} eyebrow="Uren" title="Tijdregistratie" subtitle="Track je uren per taak en project" />

      <div className="grid grid-cols-3 gap-3">
        <GlassPanel level={2} className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Clock className="w-3.5 h-3.5" /> Totaal</div>
          <p className="text-foreground text-3xl font-display font-semibold mt-1">{formatMinutes(total)}</p>
        </GlassPanel>
        <GlassPanel level={2} className="p-4">
          <div className="flex items-center gap-2 text-olive text-xs"><Clock className="w-3.5 h-3.5" /> Vandaag</div>
          <p className="text-foreground text-3xl font-display font-semibold mt-1">{formatMinutes(tt.todayMin)}</p>
        </GlassPanel>
        <GlassPanel level={2} className="p-4">
          <div className="flex items-center gap-2 text-blue-grey text-xs"><Clock className="w-3.5 h-3.5" /> Deze week</div>
          <p className="text-foreground text-3xl font-display font-semibold mt-1">{formatMinutes(tt.weekMin)}</p>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel level={2} className="lg:col-span-2 p-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Uren per project</p>
          <div className="h-72">
            {data.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "hsl(var(--foreground) / 0.05)" }} contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 12 }} />
                  <Bar dataKey="uren" radius={[8, 8, 0, 0]}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground h-full flex items-center justify-center">Nog geen uren geregistreerd.</p>
            )}
          </div>
        </GlassPanel>

        <GlassPanel level={2} className="p-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Specificatie</p>
          {projEntries.length ? (
            <div className="flex flex-col gap-2">
              {projEntries.map(([id, min]) => (
                <div key={id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/80 truncate pr-2">{projName(id)}</span>
                  <span className="text-foreground tabular-nums shrink-0">{formatMinutes(min)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nog geen uren geregistreerd.</p>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}