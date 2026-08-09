import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { cn } from "@/lib/utils";

/**
 * AgendaWidget — one question: what is the next event today/tomorrow?
 * Hero is the next event's time as oversized type. A bespoke day-segment
 * timeline (08–20) positions every event as an accent mark along a rail.
 */
const HOURS = 12;

export default function AgendaWidget() {
  const { openModule } = usePanel();
  const { data: events, loading } = useEntityList("Event", { sort: "start" });
  const [day, setDay] = useState("today");

  const todayStr = new Date().toLocaleDateString("sv-SE");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("sv-SE");
  const targetStr = day === "today" ? todayStr : tomorrowStr;

  const todays = events
    .filter((e) => (e.start || "").slice(0, 10) === targetStr)
    .sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const next = todays[0];

  const pos = (start) => {
    const d = new Date(start);
    const h = d.getHours() + d.getMinutes() / 60;
    return Math.max(0, Math.min(1, (h - 8) / HOURS));
  };

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("agenda")} className="min-h-[300px]">
      <div className="p-5 lg:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-current opacity-55">Agenda</h3>
          <div className="flex gap-0.5 p-0.5 rounded-full bg-ivory/5 border border-ivory/10" onClick={(e) => e.stopPropagation()}>
            {["today", "tomorrow"].map((d) => (
              <button
                key={d}
                onClick={(e) => { e.stopPropagation(); setDay(d); }}
                className={cn("px-3 py-1 text-[10px] font-semibold rounded-full transition", day === d ? "" : "opacity-50")}
                style={day === d ? { background: "var(--tile-accent)", color: "var(--tile-on-accent)" } : undefined}
              >
                {d === "today" ? "Vandaag" : "Morgen"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
        ) : next ? (
          <div className="flex-1 flex flex-col">
            <span className="text-5xl font-display font-semibold tracking-[-0.03em] leading-none text-current tabular-nums">
              {new Date(next.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <p className="text-base font-semibold text-current leading-tight truncate mt-2">{next.title}</p>
            <p className="text-[11px] opacity-50 truncate mt-0.5">{next.location || ""}</p>

            <div className="mt-6 relative h-10">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-ivory/10" />
              {todays.map((e) => (
                <span
                  key={e.id}
                  className="absolute top-1/2 -translate-y-1/2 h-6 w-2 rounded-full"
                  style={{ left: `calc(${pos(e.start) * 100}% - 4px)`, background: "var(--tile-accent)" }}
                />
              ))}
              <span className="absolute -bottom-1 left-0 text-[9px] opacity-40 tabular-nums">08</span>
              <span className="absolute -bottom-1 right-0 text-[9px] opacity-40 tabular-nums">20</span>
            </div>

            <div className="mt-auto pt-5 flex items-center justify-between">
              <span className="text-[11px] opacity-50">{todays.length} afspraak{todays.length !== 1 ? "en" : ""}</span>
              <button onClick={(e) => { e.stopPropagation(); openModule("agenda"); }} className="rounded-full px-4 py-2 text-[12px] font-semibold transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
                Openen
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-display font-semibold opacity-30">0</span>
            <p className="text-sm opacity-50 mt-1">{day === "today" ? "Vandaag is leeg" : "Morgen is leeg"}</p>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}