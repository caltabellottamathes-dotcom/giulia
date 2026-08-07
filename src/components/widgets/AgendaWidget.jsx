import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { mockEvents, mockProjects } from "@/lib/mockData";

/**
 * AgendaWidget — today's calendar in a compact, readable tile.
 */
export default function AgendaWidget() {
  const { openModule } = usePanel();
  const today = "2026-08-07";
  const todays = mockEvents
    .filter((e) => e.start.startsWith(today))
    .sort((a, b) => a.start.localeCompare(b.start));
  const visible = todays.slice(0, 3);
  const overflow = todays.length - visible.length;

  return (
    <WidgetShell
      size="2x1"
      radius="large"
      interactive
      onClick={() => openModule("agenda")}
      style={{ animationDelay: "70ms" }}
    >
      <div className="p-5 lg:p-6 flex flex-col h-full">
        {/* Header — clean, no icon circle */}
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 font-semibold">
            Agenda vandaag
          </h3>
          <span className="text-[11px] text-foreground/40 tabular-nums">
            {todays.length} afspraak{todays.length !== 1 ? "en" : ""}
          </span>
        </div>

        {/* Events */}
        {visible.length > 0 ? (
          <div className="flex-1 space-y-3">
            {visible.map((event) => {
              const project = mockProjects.find((p) => p.id === event.project_id);
              return (
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
                    <p className="text-sm font-medium text-foreground truncate">
                      {event.title}
                    </p>
                    <p className="text-[11px] text-foreground/55 truncate">
                      {event.location}
                      {project && ` · ${project.title}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-foreground/50 font-light">Vandaag is leeg</p>
            <p className="text-[11px] text-foreground/35 mt-1">
              Giulia houdt de ruimte vrij
            </p>
          </div>
        )}

        {/* Footer */}
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
            className="text-[11px] font-medium text-foreground hover:text-olive transition-colors"
          >
            Openen →
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}