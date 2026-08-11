import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

const HOURS = 12;

/** AgendaWidget — glass floats over a tall header photo (info on the photo). */
export default function AgendaWidget() {
  const { openModule } = usePanel();
  const { data: events, loading } = useEntityList("Event", { sort: "start" });
  const [day, setDay] = useState("today");

  const todayStr = new Date().toLocaleDateString("sv-SE");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("sv-SE");
  const targetStr = day === "today" ? todayStr : tomorrowStr;

  const todays = events.filter((e) => (e.start || "").slice(0, 10) === targetStr).sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const next = todays[0];
  const pos = (start) => { const d = new Date(start); const h = d.getHours() + d.getMinutes() / 60; return Math.max(0, Math.min(1, (h - 8) / HOURS)); };

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("agenda")} className="min-h-[260px]">
      <div className="flex flex-col h-full">
        <div className="relative h-48 m-2.5 mb-0 shrink-0 rounded-[18px] overflow-hidden">
          <BrandPhoto src={IMAGES.walkChairsBeach} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/45 via-transparent to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-[0.24em] font-semibold text-ivory/80">Agenda</h3>
              <div className="flex gap-0.5 p-0.5 rounded-full bg-ivory/10 border border-ivory/20" onClick={(e) => e.stopPropagation()}>
                {["today", "tomorrow"].map((d) => (
                  <button key={d} onClick={(e) => { e.stopPropagation(); setDay(d); }} className={cn("px-3 py-1 text-[10px] font-semibold rounded-full transition", day === d ? "text-charcoal" : "text-ivory/80")} style={day === d ? { background: "var(--tile-accent)", color: "var(--tile-on-accent)" } : undefined}>
                    {d === "today" ? "Vandaag" : "Morgen"}
                  </button>
                ))}
              </div>
            </div>
            {next ? (
              <div>
                <span className="text-5xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory tabular-nums" style={{ textShadow: "0 2px 14px rgba(0,0,0,0.5)" }}>
                  {new Date(next.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <p className="text-base font-semibold text-ivory leading-tight truncate mt-1.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{next.title}</p>
                {next.location && <p className="text-[11px] text-ivory/75 truncate">{next.location}</p>}
              </div>
            ) : (
              <div>
                <span className="text-5xl font-display font-semibold text-ivory/85">0</span>
                <p className="text-sm text-ivory/75 mt-1">{day === "today" ? "Vandaag is leeg" : "Morgen is leeg"}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 -mt-12 rounded-t-[28px] glass-3 p-5 relative z-10 shadow-[0_-14px_30px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="relative h-10">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-ivory/15" />
                {todays.map((e) => (
                  <span key={e.id} className="absolute top-1/2 -translate-y-1/2 h-6 w-2 rounded-full" style={{ left: `calc(${pos(e.start) * 100}% - 4px)`, background: "var(--tile-accent)" }} />
                ))}
                <span className="absolute -bottom-1 left-0 text-[9px] text-ivory/50 tabular-nums">08</span>
                <span className="absolute -bottom-1 right-0 text-[9px] text-ivory/50 tabular-nums">20</span>
              </div>
              <div className="mt-auto pt-5 flex items-center justify-between">
                <span className="text-[11px] text-ivory/60">{todays.length} afspraak{todays.length !== 1 ? "en" : ""}</span>
                <button onClick={(e) => { e.stopPropagation(); openModule("agenda"); }} className="rounded-full px-4 py-2 text-[12px] font-semibold transition hover:-translate-y-0.5 active:scale-95" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>Openen</button>
              </div>
            </>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}