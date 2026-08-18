import React from "react";
import { Link } from "react-router-dom";
import { Sun, Calendar, AlertCircle, Sparkles } from "lucide-react";
import { PageShell, GlassButton, Divider, SectionHeader, CATEGORY_COLORS } from "@/glass/components/glass";
import { TASKS } from "@/glass/lib/tasks";

const TODAY = "2026-08-14";

export default function DagelijkseBriefing() {
  const today = TASKS.filter((t) => t.date === TODAY).sort((a, b) => a.time.localeCompare(b.time));
  const priorities = TASKS.filter((t) => t.status === "lopend").slice(0, 3);
  const date = new Date(TODAY);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Vandaag</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Dagelijkse Briefing</h1>
        </div>
        <Link to="/glass"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-marble/50 text-xs capitalize">{date.toLocaleDateString("nl-NL", { weekday: "long" })}</p>
            <h2 className="text-storm text-xl font-semibold">{date.getDate()} {date.toLocaleDateString("nl-NL", { month: "long" })}</h2>
          </div>
          <div className="flex items-center gap-2 text-marble/70 text-sm"><Sun className="w-5 h-5 text-urgent" /> 22° · Zonnig</div>
        </div>
        <p className="text-marble/70 text-sm mt-4 leading-relaxed">Goedemorgen Giulia. Je hebt vandaag {today.length} afspraken en {priorities.length} lopende prioriteiten. Focus eerst op het Marktanalyse rapport.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6">
          <SectionHeader number={1} title="Top prioriteiten vandaag" />
          <div className="mt-4 flex flex-col gap-2.5">
            {priorities.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl bg-marble/8 px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-urgent text-metal text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-storm text-sm font-medium truncate">{t.title}</p>
                  <p className={`${CATEGORY_COLORS[t.category]} text-xs`}>{t.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6">
          <SectionHeader number={2} title="Agenda vandaag" />
          <div className="mt-4 flex flex-col gap-2.5">
            {today.length === 0 && <p className="text-marble/50 text-sm">Geen afspraken vandaag.</p>}
            {today.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl bg-marble/8 px-4 py-3">
                <Calendar className="w-4 h-4 text-marble/60 shrink-0" />
                <span className="text-marble/70 text-xs tabular-nums w-12 shrink-0">{t.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-storm text-sm truncate">{t.title}</p>
                  <p className={`${CATEGORY_COLORS[t.category]} text-xs`}>{t.category} · {t.duration}min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider className="my-6" />
      <div className="flex items-center gap-2 text-marble/70 text-sm">
        <Sparkles className="w-4 h-4 text-urgent" />
        <span>Tip van de dag: begin met de zwaarste taak voordat je e-mail opent.</span>
      </div>
    </PageShell>
  );
}