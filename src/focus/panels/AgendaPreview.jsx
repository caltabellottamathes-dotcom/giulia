import React, { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import PreviewShell from "@/system/panels/PreviewShell";
import { base44 } from "@/api/base44Client";

const DEEP = "#595f34", URG = "#d5e24a", LIGHT = "#d8dab3", MID = "#94925d";
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const STATUS_C = { confirmed: URG, tentative: MID, cancelled: "rgba(255,255,255,0.3)" };
const DOM_C = { focus: MID, life: LIGHT, self: "#6b6a4a" };

export default function AgendaPreview({ onOpen }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CalendarEvent.list("start").then(data => setEvents(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const sorted = [...events].sort((a, b) => (a.start || "").localeCompare(b.start || ""));
    const map = {};
    sorted.forEach(e => { const d = (e.start || "").slice(0, 10); (map[d] = map[d] || []).push(e); });
    return Object.entries(map).slice(0, 5);
  }, [events]);

  return (
    <PreviewShell index="10" section="AGENDA" statement={`${events.length} AFSPRAKEN`} kicker="CHRONOLOGISCH" accent={URG}
      context={[
        { label: "VANDAAG", text: `${grouped.filter(([d]) => d === new Date().toISOString().slice(0, 10)).reduce((s, [, items]) => s + items.length, 0)} afspraken vandaag.` },
        { label: "KOMENDE", text: `${events.length} afspraken totaal in de agenda.` },
        { label: "NU", text: events.find(e => new Date(e.start) > new Date()) ? `Volgende: ${events.find(e => new Date(e.start) > new Date()).title}` : "Geen komende afspraken." },
      ]}
      actions={[{ label: "Nieuwe Afspraak", primary: true, to: "/agenda" }, { label: "Vandaag", to: "/agenda" }, { label: "Week", to: "/planning" }, { label: "Open Agenda", to: "/agenda" }]}>
      <div className="overflow-auto pr-1">
        <div className="relative">
          <div className="absolute left-[26px] top-2 bottom-2 w-px bg-marble/20" />
          <div className="flex flex-col gap-5">
            {loading ? <p className="text-storm/40 text-sm">Laden…</p> : grouped.length === 0 ? <p className="text-storm/40 text-sm">Geen afspraken.</p> : grouped.map(([date, items]) => {
              const d = new Date(date);
              const isToday = date === new Date().toISOString().slice(0, 10);
              return (
                <div key={date} className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`z-10 w-[53px] h-[53px] rounded-2xl border ${isToday ? "border-urgent/50" : "border-marble/30"} bg-metal/60 flex flex-col items-center justify-center shrink-0`}>
                      <span className="text-marble/50 text-[9px] uppercase leading-none">{MONTHS[d.getMonth()]}</span>
                      <span className={`text-storm text-lg font-semibold leading-none mt-0.5 ${isToday ? "text-urgent" : ""}`}>{d.getDate()}</span>
                    </div>
                    <div>
                      <p className="text-storm text-sm font-medium">{d.toLocaleDateString("nl-NL", { weekday: "long" })}</p>
                      <p className="text-marble/50 text-xs">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="ml-[68px] flex flex-col gap-2">
                    {items.map(e => (
                      <div key={e.id} onClick={onOpen} className="flex items-center gap-3 rounded-2xl border border-marble/25 bg-marble/8 px-4 py-3 hover:bg-marble/15 transition-colors cursor-pointer">
                        <div className="flex items-center gap-1.5 text-marble/70 text-xs w-20 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="tabular-nums">{e.start ? new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-storm text-sm font-medium truncate">{e.title}</p>
                          <p className="text-xs text-marble/50 mt-0.5">{e.location || "Geen locatie"} · {e.participants || "—"}</p>
                        </div>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DOM_C[e.domain] || MID }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}