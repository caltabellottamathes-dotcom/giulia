import React from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { mockEvents, mockProjects } from "@/lib/mockData";
import { Calendar, ArrowUpRight, Plus } from "lucide-react";

/**
 * AgendaWidget — today's calendar events in a compact 2x1 tile.
 * Max 3 visible; "meer" indicator; opens Agenda module on tap.
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg glass-1 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-[#2D2D23]" />
            </div>
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-[#2D2D23]/55">
              Agenda vandaag
            </h3>
          </div>
          <ArrowUpRight className="h-4 w-4 text-[#2D2D23]/40" />
        </div>

        {/* Events */}
        {visible.length > 0 ? (
          <div className="flex-1 space-y-2.5">
            {visible.map((event) => {
              const project = mockProjects.find((p) => p.id === event.project_id);
              return (
                <div key={event.id} className="flex items-center gap-3">
                  <div className="text-right shrink-0 w-12">
                    <p className="text-sm font-medium tabular-nums text-[#2D2D23]">
                      {new Date(event.start).toLocaleTimeString("nl-NL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="w-px self-stretch bg-[#868564]/25 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2D2D23] truncate">{event.title}</p>
                    <p className="text-[11px] text-[#2D2D23]/50 truncate">
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
            <p className="text-sm text-[#2D2D23]/45 font-light">Vandaag is leeg</p>
            <p className="text-[11px] text-[#2D2D23]/30 mt-1">
              Giulia houdt de ruimte vrij
            </p>
          </div>
        )}

        {/* Footer — overflow or add */}
        <div className="mt-3 pt-3 border-t border-[#868564]/15 flex items-center justify-between">
          {overflow > 0 ? (
            <span className="text-[11px] text-[#868564]">
              +{overflow} meer
            </span>
          ) : (
            <span className="text-[11px] text-[#2D2D23]/35">
              {todays.length} afspraak{todays.length !== 1 ? "en" : ""}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModule("agenda");
            }}
            className="h-7 w-7 rounded-full glass-1 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Plus className="h-3.5 w-3.5 text-[#2D2D23]/70" />
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}