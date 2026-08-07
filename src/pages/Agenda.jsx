import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { mockEvents, mockProjects, mockTasks } from "@/lib/mockData";
import {
  ChevronLeft, ChevronRight, Clock, MapPin, Sparkles,
  AlertCircle, Plus, Calendar,
} from "lucide-react";

const views = ["Day", "Week", "Month", "Schedule"];

const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export default function Agenda() {
  const [view, setView] = useState("Week");
  const [currentDate, setCurrentDate] = useState(new Date("2026-08-07"));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNewEvent, setShowNewEvent] = useState(false);

  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const getEventsForDay = (date) =>
    mockEvents.filter((e) => new Date(e.start).toDateString() === date.toDateString());

  const giuliaSuggestions = [
    {
      icon: AlertCircle,
      title: "Giulia stelt voor",
      text: "Je donderdag is overbelast. Drie afspraken in vier uur.",
      action: "Verplaats wireframe review",
    },
    {
      icon: AlertCircle,
      title: "Mogelijk conflict",
      text: "Project deadline Marktanalyse + meeting op 15 september.",
      action: "Bekijk opties",
    },
    {
      icon: Sparkles,
      title: "Voorgestelde wijziging",
      text: "Verplaats wireframe review van donderdag naar vrijdag 10:00.",
      action: "Toepassen",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-light tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw tijd, georganiseerd door Giulia</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-1 rounded-xl flex items-center p-1">
            {views.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg transition-all",
                  view === v ? "bg-foreground/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <GlassButton variant="primary" size="sm" onClick={() => setShowNewEvent(true)}>
            <Plus className="h-4 w-4" /> Nieuw event
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar — main */}
        <GlassPanel level={2} className="lg:col-span-2 p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading font-medium">
              {currentDate.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }}
                className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date("2026-08-07"))}
                className="px-3 py-1.5 text-xs rounded-lg hover:bg-foreground/5 text-muted-foreground"
              >
                Vandaag
              </button>
              <button
                onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }}
                className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Week grid */}
          <div className="grid grid-cols-8 gap-1">
            <div className="w-12" />
            {weekDates.map((date, i) => {
              const isToday = date.toDateString() === new Date("2026-08-07").toDateString();
              return (
                <div key={i} className="text-center pb-2">
                  <p className="text-[10px] uppercase text-muted-foreground">{weekDays[i]}</p>
                  <p className={cn(
                    "text-sm mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full",
                    isToday ? "bg-olive/20 text-foreground font-medium" : "text-foreground/70"
                  )}>
                    {date.getDate()}
                  </p>
                </div>
              );
            })}

            {/* Time slots */}
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="text-right pr-2 pt-1">
                  <span className="text-[10px] text-muted-foreground">{hour}:00</span>
                </div>
                {weekDates.map((date, di) => {
                  const dayEvents = getEventsForDay(date).filter((e) =>
                    new Date(e.start).getHours() === hour
                  );
                  return (
                    <div
                      key={di}
                      className="min-h-[48px] border border-border/30 rounded-lg p-1 hover:bg-foreground/[0.02] transition-colors"
                    >
                      {dayEvents.map((event) => {
                        const project = mockProjects.find((p) => p.id === event.project_id);
                        return (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="w-full text-left p-1.5 rounded-md bg-olive/10 border border-olive/20 hover:bg-olive/15 transition-colors"
                          >
                            <p className="text-[10px] font-medium truncate">{event.title}</p>
                            <p className="text-[9px] text-muted-foreground">
                              {new Date(event.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </GlassPanel>

        {/* Giulia intelligence sidebar */}
        <div className="space-y-4">
          <GlassPanel level={3} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-foreground/70" />
              </div>
              <h3 className="text-sm font-heading font-medium">Giulia intelligentie</h3>
            </div>
            <div className="space-y-4">
              {giuliaSuggestions.map((sug, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <sug.icon className="h-4 w-4 text-olive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium">{sug.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{sug.text}</p>
                    </div>
                  </div>
                  <button className="text-[10px] text-olive hover:underline ml-6">{sug.action}</button>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel level={1} className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Komende deadlines</h3>
            <div className="space-y-2">
              {mockTasks.filter((t) => t.deadline && t.status !== "completed").slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{task.title}</span>
                  <span className="text-muted-foreground">{new Date(task.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Event detail floating panel */}
      <FloatingPanel open={!!selectedEvent} onClose={() => setSelectedEvent(null)} position="right">
        {selectedEvent && (
          <div className="space-y-5">
            <div>
              <StatusBadge variant="active">Event</StatusBadge>
              <h2 className="text-xl font-heading font-medium mt-3">{selectedEvent.title}</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(selectedEvent.start).toLocaleString("nl-NL", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
                  {" — "}
                  {new Date(selectedEvent.end).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            </div>
            {selectedEvent.project_id && (() => {
              const project = mockProjects.find((p) => p.id === selectedEvent.project_id);
              return project ? (
                <div className="glass-1 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Gekoppeld project</p>
                  <p className="text-sm font-medium">{project.title}</p>
                </div>
              ) : null;
            })()}
            <div className="flex gap-2 pt-2">
              <GlassButton variant="primary" size="sm" className="flex-1">Bewerk</GlassButton>
              <GlassButton variant="outline" size="sm" className="flex-1">Verwijder</GlassButton>
            </div>
          </div>
        )}
      </FloatingPanel>

      {/* New event panel */}
      <FloatingPanel open={showNewEvent} onClose={() => setShowNewEvent(false)} position="right">
        <div className="space-y-5">
          <h2 className="text-xl font-heading font-medium">Nieuw event</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titel</label>
              <input className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" placeholder="Event naam" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Datum</label>
                <input type="date" className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tijd</label>
                <input type="time" className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Locatie</label>
              <input className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" placeholder="Locatie of video call" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <GlassButton variant="primary" size="md" className="flex-1" onClick={() => setShowNewEvent(false)}>Maak aan</GlassButton>
            <GlassButton variant="outline" size="md" onClick={() => setShowNewEvent(false)}>Annuleer</GlassButton>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}