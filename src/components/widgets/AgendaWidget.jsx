import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AgendaWidget — toggle between Today and Tomorrow inline; live timeline.
 */
export default function AgendaWidget() {
  const { openModule } = usePanel();
  const { data: events, loading } = useEntityList("Event", { sort: "start" });
  const { data: projects } = useEntityList("Project");
  const [day, setDay] = useState("today");

  const todayStr = new Date().toLocaleDateString("sv-SE");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("sv-SE");
  const targetStr = day === "today" ? todayStr : tomorrowStr;

  const todays = events
    .filter((e) => (e.start || "").slice(0, 10) === targetStr)
    .sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const visible = todays.slice(0, 3);
  const overflow = todays.length - visible.length;
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  return (
    <WidgetShell size="2x2" radius="large" glass="card" interactive onClick={() => openModule("agenda")} className="min-h-[300px]">
      <div className="p-5 lg:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-olive/15 border border-olive/20 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-olive" />
            </span>
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 font-semibold">Agenda</h3>
          </div>
          <div className="flex gap-0.5 p-0.5 rounded-full bg-foreground/5 border border-foreground/10">
            <button onClick={(e) => { e.stopPropagation(); setDay("today"); }} className={cn("px-2.5 py-1 text-[10px] font-semibold rounded-full transition", day === "today" ? "bg-olive text-ivory" : "text-foreground/60")}>Vandaag</button>
            <button onClick={(e) => { e.stopPropagation(); setDay("tomorrow"); }} className={cn("px-2.5 py-1 text-[10px] font-semibold rounded-full transition", day === "tomorrow" ? "bg-olive text-ivory" : "text-foreground/60")}>Morgen</button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 space-y-4">
            {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded-lg shimmer" />)}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-4">
            {visible.map((event) => (
              <div key={event.id} className="flex items-stretch gap-3">
                <div className="flex flex-col items-center pt-1 shrink-0">
                  <span className="text-[12px] font-semibold tabular-nums text-foreground leading-none">
                    {new Date(event.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div className="flex-1 w-px bg-foreground/15 my-1" />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">{event.title}</p>
                  <p className="text-[11px] text-foreground/55 truncate mt-0.5">
                    {event.location}{event.project_id && projTitle(event.project_id) ? ` · ${projTitle(event.project_id)}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-foreground/50 font-medium">{day === "today" ? "Vandaag is leeg" : "Morgen is leeg"}</p>
            <p className="text-[11px] text-foreground/35 mt-1">Giulia houdt de ruimte vrij</p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between">
          {overflow > 0 ? (
            <span className="text-[11px] text-foreground/55">+{overflow} meer</span>
          ) : (
            <span className="text-[11px] text-foreground/40">{todays.length} afspraak{todays.length !== 1 ? "en" : ""}</span>
          )}
          <button onClick={(e) => { e.stopPropagation(); openModule("agenda"); }} className="flex items-center gap-1 text-[11px] font-semibold text-foreground hover:text-olive transition-colors">
            Openen <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}