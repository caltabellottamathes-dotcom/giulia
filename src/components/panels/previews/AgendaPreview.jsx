import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Clock, Plus, Sparkles } from "lucide-react";
import { SectionLabel, Empty } from "./previewParts";
import WeekView from "./WeekView";
import DayView from "./DayView";

const PALETTE = [
  "hsl(var(--olive))", "hsl(var(--sand))", "hsl(var(--ridge))",
  "hsl(var(--powder))", "hsl(var(--steel))", "hsl(var(--stone))",
];
const accentFor = (s = "") => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return PALETTE[h % PALETTE.length]; };
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const TABS = [{ key: "overzicht", label: "Overzicht" }, { key: "week", label: "Week" }, { key: "dag", label: "Dag" }];

/** Agenda module paneel — wissel tussen Overzicht (tijdlijn), Week en Dag,
 *  GIULIA-glass met live Event-data. */
export default function AgendaPreview({ onOpen }) {
  const [tab, setTab] = useState("overzicht");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Event.list("start").catch(() => []);
        const now = Date.now();
        setEvents((data || []).filter((e) => new Date(e.start).getTime() >= now - 24 * 3600 * 1000).slice(0, 30));
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    events.forEach((e) => { const d = (e.start || "").slice(0, 10); if (!d) return; (map[d] = map[d] || []).push(e); });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [events]);

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${tab === t.key ? "bg-ivory text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "week" && <WeekView />}
      {tab === "dag" && <DayView />}

      {tab === "overzicht" && (
        <>
          <SectionLabel>Chronologisch overzicht</SectionLabel>
          {loading ? (
            <Empty text="Laden…" />
          ) : grouped.length ? (
            <div className="relative">
              <div className="absolute left-[26px] top-2 bottom-2 w-px bg-ivory/15" />
              <div className="flex flex-col gap-7">
                {grouped.map(([date, items]) => {
                  const d = new Date(date);
                  return (
                    <div key={date} className="relative">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="z-10 w-[53px] h-[53px] rounded-2xl border border-white/15 glass-1 flex flex-col items-center justify-center shrink-0">
                          <span className="text-ivory/55 text-[9px] uppercase leading-none">{MONTHS[d.getMonth()]}</span>
                          <span className="text-ivory text-lg font-semibold leading-none mt-0.5">{d.getDate()}</span>
                        </div>
                        <div>
                          <p className="text-ivory text-sm font-medium capitalize">{format(d, "EEEE", { locale: nl })}</p>
                          <p className="text-ivory/55 text-xs">{items.length} afspraak{items.length !== 1 ? "en" : ""}</p>
                        </div>
                      </div>
                      <div className="ml-[68px] flex flex-col gap-2.5">
                        {items.map((e) => (
                          <div key={e.id} onClick={onOpen} className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex items-center gap-1.5 text-ivory/70 text-xs w-20 shrink-0">
                              <Clock className="w-3.5 h-3.5" style={{ color: accentFor(e.title) }} />
                              <span className="tabular-nums">{format(new Date(e.start), "HH:mm")}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-ivory text-sm font-medium truncate">{e.title}</p>
                              <p className="text-ivory/50 text-xs mt-0.5 truncate">{e.location || "Afspraak"}{e.end ? " · tot " + format(new Date(e.end), "HH:mm") : ""}</p>
                            </div>
                            <span className="text-[10px] text-ivory/45 uppercase hidden sm:block">afspraak</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <Empty text="Geen afspraken in de pipeline" />
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={onOpen} className="px-5 py-2.5 rounded-full bg-sand text-charcoal text-sm font-semibold hover:brightness-105 transition-all active:scale-95 flex items-center gap-2 shadow-[0_4px_20px_rgba(210,185,140,0.35)]">
              <Plus className="w-4 h-4" /> Nieuwe afspraak
            </button>
            <Sparkles className="w-5 h-5 text-sand" />
          </div>
        </>
      )}
    </div>
  );
}