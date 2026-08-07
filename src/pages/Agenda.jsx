import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import {
  ChevronLeft, ChevronRight, Clock, MapPin, Sparkles,
  AlertCircle, Plus, RefreshCw,
} from "lucide-react";

const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "09:00", location: "" });

  const { data: events, loading, reload } = useEntityList("Event", { sort: "start" });
  const { data: projects } = useEntityList("Project");
  const { data: tasks } = useEntityList("Task");
  const [syncing, setSyncing] = useState(false);
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  const sync = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke("syncCalendar", {});
      reload();
    } catch (e) {
      /* ignore */
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const getEventsForDay = (date) =>
    events.filter((e) => new Date(e.start).toDateString() === date.toDateString());

  const todayCount = events.filter(
    (e) => new Date(e.start).toDateString() === new Date().toDateString()
  ).length;

  const createEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const start = new Date(`${newEvent.date}T${newEvent.time || "09:00"}:00`).toISOString();
    const end = new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
    await base44.entities.Event.create({ title: newEvent.title.trim(), start, end, location: newEvent.location });
    setNewEvent({ title: "", date: "", time: "09:00", location: "" });
    setShowNewEvent(false);
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-1">Jouw tijd, georganiseerd door Giulia</p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton variant="outline" size="sm" onClick={sync} disabled={syncing}>
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /> {syncing ? "Sync" : "Sync"}
          </GlassButton>
          <GlassButton variant="primary" size="sm" onClick={() => setShowNewEvent(true)}>
            <Plus className="h-4 w-4" /> Nieuw event
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel level={2} className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold">
              {currentDate.toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }} className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs rounded-lg hover:bg-foreground/5 text-muted-foreground">Vandaag</button>
              <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }} className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-8 gap-1">
            <div className="w-10" />
            {weekDates.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={i} className="text-center pb-2">
                  <p className="text-[10px] uppercase text-muted-foreground">{weekDays[i]}</p>
                  <p className={cn("text-sm mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full", isToday ? "bg-olive/20 text-foreground font-semibold" : "text-foreground/70")}>
                    {date.getDate()}
                  </p>
                </div>
              );
            })}

            {loading && (
              <div className="col-span-8 space-y-2 py-6">
                {[0, 1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg shimmer" />)}
              </div>
            )}

            {!loading && hours.map((hour) => (
              <React.Fragment key={hour}>
                <div className="text-right pr-2 pt-1">
                  <span className="text-[10px] text-muted-foreground">{hour}:00</span>
                </div>
                {weekDates.map((date, di) => {
                  const dayEvents = getEventsForDay(date).filter((e) => new Date(e.start).getHours() === hour);
                  return (
                    <div key={di} className="min-h-[48px] border border-border/30 rounded-lg p-1 hover:bg-foreground/[0.02] transition-colors">
                      {dayEvents.map((event) => (
                        <button key={event.id} onClick={() => setSelectedEvent(event)} className="w-full text-left p-1.5 rounded-md bg-olive/10 border border-olive/20 hover:bg-olive/15 transition-colors">
                          <p className="text-[10px] font-medium truncate">{event.title}</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(event.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </GlassPanel>

        <div className="space-y-4">
          <GlassPanel level={3} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-foreground/70" />
              </div>
              <h3 className="text-sm font-display font-semibold">Giulia intelligentie</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-olive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Vandaag</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {todayCount > 0 ? `Je hebt ${todayCount} afspraak${todayCount !== 1 ? "en" : ""} vandaag.` : "Vandaag is je agenda leeg — ruimte voor focus."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-olive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Komende deadlines</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tasks.filter((t) => t.deadline && t.status !== "completed").length} taken met een deadline open.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel level={1} className="p-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Komende deadlines</h3>
            <div className="space-y-2">
              {tasks.filter((t) => t.deadline && t.status !== "completed").slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{task.title}</span>
                  <span className="text-muted-foreground">{new Date(task.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                </div>
              ))}
              {tasks.filter((t) => t.deadline && t.status !== "completed").length === 0 && (
                <p className="text-xs text-muted-foreground">Geen open deadlines</p>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>

      <FloatingPanel open={!!selectedEvent} onClose={() => setSelectedEvent(null)} position="right">
        {selectedEvent && (
          <div className="space-y-5">
            <div>
              <StatusBadge variant="active">Event</StatusBadge>
              <h2 className="text-xl font-display font-semibold mt-3">{selectedEvent.title}</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(selectedEvent.start).toLocaleString("nl-NL", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
                  {selectedEvent.end && ` — ${new Date(selectedEvent.end).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selectedEvent.location}</span></div>
              )}
            </div>
            {selectedEvent.project_id && projTitle(selectedEvent.project_id) && (
              <div className="glass-1 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Gekoppeld project</p>
                <p className="text-sm font-medium">{projTitle(selectedEvent.project_id)}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <GlassButton variant="outline" size="sm" className="flex-1" onClick={async () => { await base44.entities.Event.delete(selectedEvent.id); setSelectedEvent(null); reload(); }}>Verwijder</GlassButton>
            </div>
          </div>
        )}
      </FloatingPanel>

      <FloatingPanel open={showNewEvent} onClose={() => setShowNewEvent(false)} position="right">
        <div className="space-y-5">
          <h2 className="text-xl font-display font-semibold">Nieuw event</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titel</label>
              <input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" placeholder="Event naam" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Datum</label>
                <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tijd</label>
                <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Locatie</label>
              <input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive/30" placeholder="Locatie of video call" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <GlassButton variant="primary" size="md" className="flex-1" onClick={createEvent}>Maak aan</GlassButton>
            <GlassButton variant="outline" size="md" onClick={() => setShowNewEvent(false)}>Annuleer</GlassButton>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}