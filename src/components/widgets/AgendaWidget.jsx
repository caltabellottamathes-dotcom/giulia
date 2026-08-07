import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";

/**
 * AgendaWidget — today's calendar from real Event records.
 */
export default function AgendaWidget() {
  const { openModule } = usePanel();
  const { data: events, loading } = useEntityList("Event", { sort: "start" });
  const { data: projects } = useEntityList("Project");

  const todayStr = new Date().toLocaleDateString("sv-SE");
  const todays = events
    .filter((e) => (e.start || "").slice(0, 10) === todayStr)
    .sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  const visible = todays.slice(0, 3);
  const overflow = todays.length - visible.length;
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  return (
    <WidgetShell
      size="2x1"
      radius="large"
      interactive
      onClick={() => openModule("agenda")}
      style={{ animationDelay: "70ms" }}
    >
      <div className="p-5 lg:p-6 flex flex-col h-full">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 font-semibold">
            Agenda vandaag
          </h3>
          <span className="text-[11px] text-foreground/40 tabular-nums">
            {todays.length} afspraak{todays.length !== 1 ? "en" : ""}
          </span>
        </div>

        {loading ? (
          <div className="flex-1 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 rounded-lg shimmer" />
            ))}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-3">
            {visible.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className="text-right shrink-0 w-12">
                  <p className="text-[13px] font-semibold tabular-nums text-foreground">
                    {new Date(event.start).toLocaleTimeString("nl-NL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="w-px self-stretch bg-foreground/15 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {event.title}
                  </p>
                  <p className="text-[11px] text-foreground/55 truncate">
                    {event.location}
                    {event.project_id && projTitle(event.project_id)
                      ? ` · ${projTitle(event.project_id)}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-foreground/50 font-medium">Vandaag is leeg</p>
            <p className="text-[11px] text-foreground/35 mt-1">Giulia houdt de ruimte vrij</p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between">
          {overflow > 0 ? (
            <span className="text-[11px] text-foreground/55">+{overflow} meer</span>
          ) : (
            <span className="text-[11px] text-foreground/40">Alles voor vandaag</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModule("agenda");
            }}
            className="text-[11px] font-semibold text-foreground hover:text-olive transition-colors"
          >
            Openen →
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}