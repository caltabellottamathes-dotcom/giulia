import React from "react";
import { Link } from "react-router-dom";
import { PageShell, GlassButton } from "@/system/components/slick/glass";
import { TASKS } from "@/lib/slick/tasks";

const QUADS = [
  { title: "Doen", sub: "Urgent · Belangrijk", tone: "text-urgent", border: "border-urgent/40", ids: [1, 2, 3] },
  { title: "Plannen", sub: "Niet urgent · Belangrijk", tone: "text-sky", border: "border-sky/40", ids: [7, 10, 12] },
  { title: "Delegeren", sub: "Urgent · Niet belangrijk", tone: "text-sand", border: "border-sand/40", ids: [4, 6, 9] },
  { title: "Laten", sub: "Geen van beide", tone: "text-marble/60", border: "border-marble/30", ids: [5, 8, 13] },
];

function Quad({ q }) {
  const items = TASKS.filter((t) => q.ids.includes(t.id));
  return (
    <div className={`rounded-2xl border ${q.border} bg-marble/5 p-4 min-h-[180px] flex flex-col`}>
      <p className={`text-sm font-semibold ${q.tone}`}>{q.title}</p>
      <p className="text-marble/40 text-[10px]">{q.sub}</p>
      <div className="mt-3 flex flex-col gap-1.5 flex-1">
        {items.map((t) => (
          <div key={t.id} className="rounded-lg bg-marble/10 px-2.5 py-1.5 text-storm text-xs">{t.title}</div>
        ))}
      </div>
    </div>
  );
}

export default function PrioriteitenMatrix() {
  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Strategie</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Prioriteiten Matrix</h1>
        </div>
        <Link to="/slick"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="grid grid-cols-[64px_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-2 min-h-[460px]">
        <div />
        <p className="text-marble/50 text-[11px] font-medium text-center self-center">Belangrijk →</p>
        <p className="text-marble/50 text-[11px] font-medium text-center self-center">← Niet belangrijk</p>

        <p className="text-marble/50 text-[11px] font-medium [writing-mode:vertical-rl] rotate-180 text-center self-center">Urgent ↓</p>
        <Quad q={QUADS[0]} />
        <Quad q={QUADS[2]} />

        <p className="text-marble/50 text-[11px] font-medium [writing-mode:vertical-rl] rotate-180 text-center self-center">↑ Niet urgent</p>
        <Quad q={QUADS[1]} />
        <Quad q={QUADS[3]} />
      </div>
    </PageShell>
  );
}