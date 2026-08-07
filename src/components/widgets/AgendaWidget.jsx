import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { mockEvents, mockProjects } from "@/lib/mockData";
import { ArrowUpRight, Plus } from "lucide-react";

/**
 * AgendaWidget — today's calendar with a cobalt time block + row hover.
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
      depth={2}
      interactive
      onClick={() => openModule("agenda")}
      style={{ animationDelay: "110ms" }}
    >
      <div className="p-5 lg:p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80">
            Agenda vandaag
          </h3>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
        </div>

        {visible.length > 0 ? (
          <div className="flex-1 space-y-2">
            {visible.map((event) => {
              const project = mockProjects.find((p) => p.id === event.project_id);
              return (
                <div
                  key={event.id}
                  className="flex items-stretch gap-3 rounded-xl px-2 py-1.5 -mx-2 transition-all duration-300 hover:bg-foreground/[0.03] hover:translate-x-1"
                >
                  <span className="w-1 rounded-full bg-cobalt shrink-0" />
                  <div className="text-right shrink-0 w-12">
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      {new Date(event.start).toLocaleTimeString("nl-NL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate leading-tight">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {event.location}
                      {project && ` · ${project.title}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <p className="text-sm text-muted-foreground/70 font-light">Vandaag is leeg</p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
          {overflow > 0 ? (
            <span className="text-[11px] text-sienna">+{overflow} meer</span>
          ) : (
            <span className="text-[11px] text-muted-foreground/70">
              {todays.length} afspraak{todays.length !== 1 ? "en" : ""}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); openModule("agenda"); }}
            className="h-7 w-7 rounded-full glass-1 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Plus className="h-3.5 w-3.5 text-foreground/70" />
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}