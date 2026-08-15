import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, ClipboardList, ListChecks } from "lucide-react";
import { PageShell, GlassButton, Divider, SectionHeader } from "@/system/components/slick/glass";
import { MEETINGS } from "@/lib/slick/meetings";

export default function VergaderNotities() {
  const [id, setId] = useState(MEETINGS[0].id);
  const m = MEETINGS.find((x) => x.id === id);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Vergaderingen</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Vergader Notities</h1>
        </div>
        <Link to="/slick"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {MEETINGS.map((mt) => (
          <button key={mt.id} onClick={() => setId(mt.id)} className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${mt.id === id ? "bg-urgent text-metal border-urgent" : "border-marble/30 bg-marble/10 text-marble hover:bg-marble/20"}`}>
            {mt.title}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-storm text-xl font-semibold">{m.title}</h2>
            <p className="text-marble/50 text-xs mt-1">{m.date} · {m.time} · {m.location}</p>
          </div>
        </div>

        <Divider className="my-5" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 text-marble/60 text-xs"><Users className="w-3.5 h-3.5" /> Deelnemers</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.participants.map((p) => (
                <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-marble/10 text-storm border border-marble/20">{p}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-marble/60 text-xs"><ClipboardList className="w-3.5 h-3.5" /> Agenda</div>
            <ul className="mt-3 flex flex-col gap-1.5">
              {m.agenda.map((a, i) => (
                <li key={i} className="text-storm text-sm flex gap-2"><span className="text-marble/40 tabular-nums">{i + 1}.</span>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 text-marble/60 text-xs"><ListChecks className="w-3.5 h-3.5" /> Actiepunten</div>
            <ul className="mt-3 flex flex-col gap-1.5">
              {m.actions.map((a, i) => (
                <li key={i} className="text-storm text-sm flex items-start gap-2"><span className="w-4 h-4 rounded-full border border-urgent/50 shrink-0 mt-0.5" />{a}</li>
              ))}
            </ul>
          </div>
        </div>

        <Divider className="my-5" />
        <SectionHeader number={1} title="Notulen" />
        <p className="text-marble/80 text-sm leading-relaxed mt-3">{m.notes}</p>
      </div>
    </PageShell>
  );
}