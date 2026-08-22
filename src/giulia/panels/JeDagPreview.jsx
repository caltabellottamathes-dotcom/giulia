import React, { useEffect, useState } from "react";
import { Sun, Calendar, Sparkles } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { base44 } from "@/api/base44Client";
import WhatMattersLayeredWidget from "@/giulia/widgets/new/WhatMattersLayeredWidget";

const PLUM = "#301728", URG = "#d5e24a", MID = "#94925d";

export default function JeDagPreview({ onOpen }) {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Task.filter({ status: "todo" }, "-priority", 10).catch(() => []),
      base44.entities.CalendarEvent.list("start").catch(() => []),
    ]).then(([t, e]) => { setTasks(t || []); setEvents(e || []); }).finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter(e => (e.start || "").slice(0, 10) === today).sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const priorities = tasks.filter(t => t.priority === "high" || t.priority === "medium").slice(0, 3);
  const date = new Date();

  return (
    <PreviewShell index="15" section="JE DAG" statement="DAGELIJKSE BRIEFING" kicker={date.toLocaleDateString("nl-NL", { weekday: "long" }).toUpperCase()} accent={URG}
      context={[
        { label: "VANDAAG", text: `${todayEvents.length} afspraken en ${priorities.length} prioriteiten vandaag.` },
        { label: "FOCUS", text: priorities[0] ? `Begin met: ${priorities[0].title}` : "Geen hoge prioriteit taken." },
        { label: "TIP", text: "Begin met de zwaarste taak voordat je e-mail opent." },
      ]}
      actions={[{ label: "Nieuwe Taak Plannen", primary: true, to: "/tasks" }, { label: "Open Agenda", to: "/agenda" }, { label: "Open Giulia", to: "/chat" }, { label: "Open Chat", to: "/chat" }]}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="mb-4"><WhatMattersLayeredWidget /></div>
        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-marble/50 text-xs capitalize">{date.toLocaleDateString("nl-NL", { weekday: "long" })}</p>
              <h2 className="text-storm text-lg font-semibold">{date.getDate()} {date.toLocaleDateString("nl-NL", { month: "long" })}</h2>
            </div>
            <div className="flex items-center gap-2 text-marble/70 text-sm"><Sun className="w-5 h-5 text-urgent" /> 22°</div>
          </div>
          <p className="text-marble/70 text-sm mt-3 leading-relaxed">Goedemorgen. Je hebt vandaag {todayEvents.length} afspraken en {priorities.length} lopende prioriteiten. {priorities[0] ? `Focus eerst op ${priorities[0].title}.` : ""}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4 flex flex-col overflow-hidden">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">TOP PRIORITEITEN VANDAAG</p>
            <div className="flex-1 overflow-auto pr-1 flex flex-col gap-2.5">
              {loading ? <p className="text-storm/40 text-sm">Laden…</p> : priorities.length === 0 ? <p className="text-storm/40 text-sm">Geen prioriteiten.</p> : priorities.map((t, i) => (
                <div key={t.id} onClick={onOpen} className="flex items-center gap-3 rounded-xl bg-marble/8 px-4 py-3 cursor-pointer hover:bg-marble/12 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-urgent text-metal text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-storm text-sm font-medium truncate">{t.title}</p>
                    <p className="text-marble/50 text-xs">{t.priority} · {t.due_date || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4 flex flex-col overflow-hidden">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">AGENDA VANDAAG</p>
            <div className="flex-1 overflow-auto pr-1 flex flex-col gap-2.5">
              {todayEvents.length === 0 && <p className="text-marble/50 text-sm">Geen afspraken vandaag.</p>}
              {todayEvents.map(e => (
                <div key={e.id} onClick={onOpen} className="flex items-center gap-3 rounded-xl bg-marble/8 px-4 py-3 cursor-pointer hover:bg-marble/12 transition-colors">
                  <Calendar className="w-4 h-4 text-marble/60 shrink-0" />
                  <span className="text-marble/70 text-xs tabular-nums w-12 shrink-0">{e.start ? new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-storm text-sm truncate">{e.title}</p>
                    <p className="text-marble/50 text-xs">{e.location || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-marble/70 text-xs mt-4">
          <Sparkles className="w-3.5 h-3.5 text-urgent" />
          <span>Tip van de dag: begin met de zwaarste taak voordat je e-mail opent.</span>
        </div>
      </div>
    </PreviewShell>
  );
}