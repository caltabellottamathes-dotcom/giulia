import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Plus, Sparkles } from "lucide-react";
import { PageShell, GlassPanel, GlassButton, SectionHeader, StatusBadge, CATEGORY_COLORS } from "@/components/slick/glass";
import { TASKS } from "@/lib/slick/tasks";

const MONTHS = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

export default function AgendaOverzicht() {
  const grouped = useMemo(() => {
    const sorted = [...TASKS].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const map = {};
    sorted.forEach((t) => {
      (map[t.date] = map[t.date] || []).push(t);
    });
    return Object.entries(map);
  }, []);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Privé</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Agenda Overzicht</h1>
        </div>
        <Link to="/slick">
          <GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton>
        </Link>
      </div>

      <GlassPanel className="p-6">
        <SectionHeader number={1} title="Chronologisch overzicht" />

        <div className="mt-6 relative">
          {/* Timeline line */}
          <div className="absolute left-[26px] top-2 bottom-2 w-px bg-marble/20" />

          <div className="flex flex-col gap-8">
            {grouped.map(([date, items]) => {
              const d = new Date(date);
              return (
                <div key={date} className="relative">
                  {/* Date marker */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="z-10 w-[53px] h-[53px] rounded-2xl border border-marble/30 bg-metal/60 backdrop-blur-md flex flex-col items-center justify-center shrink-0">
                      <span className="text-marble/50 text-[9px] uppercase leading-none">{MONTHS[d.getMonth()].slice(0, 3)}</span>
                      <span className="text-storm text-lg font-semibold leading-none mt-0.5">{d.getDate()}</span>
                    </div>
                    <div>
                      <p className="text-storm text-sm font-medium">
                        {d.toLocaleDateString("nl-NL", { weekday: "long" })}
                      </p>
                      <p className="text-marble/50 text-xs">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Items for the day */}
                  <div className="ml-[68px] flex flex-col gap-2.5">
                    {items.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 rounded-2xl border border-marble/25 bg-marble/8 px-4 py-3 hover:bg-marble/15 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-marble/70 text-xs w-20 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="tabular-nums">{t.time}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-storm text-sm font-medium truncate">{t.title}</p>
                          <p className={`text-xs ${CATEGORY_COLORS[t.category]} mt-0.5`}>
                            {t.category} · {t.duration} min
                          </p>
                        </div>
                        <span className="text-[10px] text-marble/50 uppercase hidden sm:block">{t.type}</span>
                        <StatusBadge status={t.status} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassPanel>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button className="px-6 py-3 rounded-full bg-urgent text-metal text-sm font-semibold hover:brightness-105 transition-all shadow-[0_4px_20px_rgba(213,226,74,0.4)] active:scale-95 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nieuwe Taak Plannen
        </button>
        <Sparkles className="w-5 h-5 text-urgent" />
      </div>
    </PageShell>
  );
}