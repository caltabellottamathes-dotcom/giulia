import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import StatusBadge from "@/components/glass/StatusBadge";
import PanelForm from "@/components/glass/PanelForm";
import PageHero from "@/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import PlanningContent from "@/components/agenda/PlanningContent";
import {
  ChevronLeft, ChevronRight, Clock, MapPin, Sparkles,
  AlertCircle, Plus, RefreshCw, Calendar,
} from "lucide-react";

const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const monthNames = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 .. 21

const sameDay = (a, b) => a.toDateString() === b.toDateString();
const mondayOf = (d) => {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
};

const VIEWS = [
  { id: "day", label: "Dag" },
  { id: "week", label: "Week" },
  { id: "month", label: "Maand" },
  { id: "planning", label: "Planning" },
];

export default function Agenda() {
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "09:00", location: "" });
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({});

  const { data: events, loading, reload } = useEntityList("Event", { sort: "start" });
  const { data: projects } = useEntityList("Project");
  const { data: tasks } = useEntityList("Task");
  const [syncing, setSyncing] = useState(false);
  const projTitle = (id) => projects.find((p) => p.id === id)?.title;

  const sync = async () => {
    setSyncing(true);
    try { await base44.functions.invoke("syncCalendar", {}); reload(); }
    catch (e) { /* ignore */ }
    finally { setSyncing(false); }
  };

  useEffect(() => { sync(); /* eslint-disable-next-line */ }, []);

  const eventsForDay = (date) => events.filter((e) => sameDay(new Date(e.start), date));
  const todayCount = events.filter((e) => sameDay(new Date(e.start), new Date())).length;

  const step = (dir) => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else if (view === "month") d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const label = () => {
    if (view === "day") return currentDate.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
    if (view === "week") {
      const m = mondayOf(currentDate);
      const end = new Date(m); end.setDate(end.getDate() + 6);
      return `${m.getDate()} ${monthNames[m.getMonth()]} — ${end.getDate()} ${monthNames[end.getMonth()]}`;
    }
    if (view === "month") return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    return "";
  };

  const weekStart = mondayOf(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const gridStart = mondayOf(monthStart);
  const monthCells = Array.from({ length: 42 }, (_, i) => { const d = new Date(gridStart); d.setDate(d.getDate() + i); return d; });

  const createEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const start = new Date(`${newEvent.date}T${newEvent.time || "09:00"}:00`).toISOString();
    const end = new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
    await base44.entities.Event.create({ title: newEvent.title.trim(), start, end, location: newEvent.location });
    setNewEvent({ title: "", date: "", time: "09:00", location: "" });
    setShowNewEvent(false);
    reload();
  };

  const startEditEvent = (ev) => {
    const d = new Date(ev.start);
    setEditDraft({ title: ev.title, date: d.toISOString().slice(0, 10), time: d.toTimeString().slice(0, 5), location: ev.location || "" });
    setEditing(true);
  };
  const saveEditEvent = async () => {
    if (!selectedEvent || !editDraft.date) return;
    const start = new Date(`${editDraft.date}T${editDraft.time || "09:00"}:00`).toISOString();
    const end = new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
    await base44.entities.Event.update(selectedEvent.id, { title: editDraft.title, start, end, location: editDraft.location });
    setEditing(false);
    setSelectedEvent(null);
    reload();
  };

  const openDay = (d) => { setCurrentDate(d); setView("day"); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="agenda"
        icon={Calendar}
        eyebrow="Tijd"
        title="Agenda"
        subtitle="Jouw tijd, georganiseerd door Giulia"
        actions={<>
          <GlassButton variant="outline" size="sm" onClick={sync} disabled={syncing}>
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /> Sync
          </GlassButton>
          <GlassButton variant="primary" size="sm" onClick={() => setShowNewEvent(true)}>
            <Plus className="h-4 w-4" /> Nieuw event
          </GlassButton>
        </>}
      />

      {/* View switch + navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex glass-1 rounded-full p-1 gap-1 self-start">
          {VIEWS.map((v) => (
            <button key={v.id} onClick={() => setView(v.id)} className={cn("px-4 py-1.5 text-xs rounded-full transition-all", view === v.id ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground")}>{v.label}</button>
          ))}
        </div>
        {view !== "planning" && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-display font-semibold capitalize">{label()}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => step(-1)} className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs rounded-lg hover:bg-foreground/5 text-muted-foreground">Vandaag</button>
              <button onClick={() => step(1)} className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {view === "planning" ? (
        <PlanningContent />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassPanel level={2} className="lg:col-span-2 p-6">
            {/* DAY */}
            {view === "day" && (
              <div>
                <div className="space-y-1">
                  {HOURS.map((h) => {
                    const hourEvents = eventsForDay(currentDate).filter((e) => new Date(e.start).getHours() === h);
                    return (
                      <div key={h} className="flex gap-3 min-h-[56px]">
                        <div className="w-12 pt-2 text-right text-[11px] text-muted-foreground tabular-nums shrink-0">{String(h).padStart(2, "0")}:00</div>
                        <div className="flex-1 border-t border-border/30 pt-1.5 space-y-1.5">
                          {hourEvents.map((ev) => (
                            <button key={ev.id} onClick={() => setSelectedEvent(ev)} className="w-full text-left rounded-xl bg-olive/10 border border-olive/20 hover:bg-olive/15 px-3 py-2 transition">
                              <p className="text-sm font-medium">{ev.title}</p>
                              <p className="text-[11px] text-muted-foreground">{new Date(ev.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}{ev.location ? ` · ${ev.location}` : ""}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {eventsForDay(currentDate).length === 0 && <p className="text-sm text-muted-foreground py-10 text-center">Geen afspraken op deze dag.</p>}
              </div>
            )}

            {/* WEEK */}
            {view === "week" && (
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-8 gap-1 mb-1">
                    <div />
                    {weekDates.map((date, i) => {
                      const isToday = sameDay(date, new Date());
                      return (
                        <div key={i} className="text-center pb-2">
                          <p className="text-[10px] uppercase text-muted-foreground">{weekDays[i]}</p>
                          <p className={cn("text-sm mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full", isToday ? "bg-olive/20 text-foreground font-semibold" : "text-foreground/70")}>{date.getDate()}</p>
                        </div>
                      );
                    })}
                  </div>
                  {HOURS.map((h) => (
                    <div key={h} className="grid grid-cols-8 gap-1 mb-1">
                      <div className="text-right pr-2 pt-1 text-[10px] text-muted-foreground tabular-nums">{String(h).padStart(2, "0")}:00</div>
                      {weekDates.map((date, di) => {
                        const dayEvents = eventsForDay(date).filter((e) => new Date(e.start).getHours() === h);
                        return (
                          <div key={di} className="min-h-[44px] border border-border/20 rounded-lg p-1 hover:bg-foreground/[0.02] transition-colors">
                            {dayEvents.map((ev) => (
                              <button key={ev.id} onClick={() => setSelectedEvent(ev)} className="w-full text-left p-1.5 rounded-md bg-olive/10 border border-olive/20 hover:bg-olive/15 transition-colors">
                                <p className="text-[10px] font-medium truncate">{ev.title}</p>
                                <p className="text-[9px] text-muted-foreground">{new Date(ev.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MONTH */}
            {view === "month" && (
              <div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((d) => <div key={d} className="text-center text-[10px] uppercase text-muted-foreground py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthCells.map((date, i) => {
                    const inMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = sameDay(date, new Date());
                    const dayEvents = eventsForDay(date);
                    return (
                      <button key={i} onClick={() => openDay(date)} className={cn("rounded-xl p-2 min-h-[72px] text-left border transition-all", inMonth ? "border-border/20 glass-1 hover:bg-foreground/5" : "border-transparent text-muted-foreground/40", isToday && "ring-1 ring-olive/40")}>
                        <span className={cn("text-xs font-medium", isToday && "text-olive font-bold")}>{date.getDate()}</span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div key={ev.id} className="text-[10px] truncate rounded bg-olive/10 px-1 py-0.5">{ev.title}</div>
                          ))}
                          {dayEvents.length > 3 && <div className="text-[9px] text-muted-foreground">+{dayEvents.length - 3}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </GlassPanel>

          {/* Side info */}
          <div className="space-y-4">
            <GlassPanel level={3} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-olive/30 to-blue-grey/20 flex items-center justify-center"><Sparkles className="h-3.5 w-3.5 text-foreground/70" /></div>
                <h3 className="text-sm font-display font-semibold">Giulia intelligentie</h3>
              </div>
              <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-olive shrink-0 mt-0.5" /><span>{todayCount > 0 ? `Je hebt ${todayCount} afspraak${todayCount !== 1 ? "en" : ""} vandaag.` : "Vandaag is je agenda leeg — ruimte voor focus."}</span></div>
                <div className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-olive shrink-0 mt-0.5" /><span>{tasks.filter((t) => t.deadline && t.status !== "completed").length} taken met een deadline open.</span></div>
              </div>
            </GlassPanel>
            <GlassPanel level={1} className="p-5">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Komende deadlines</h3>
              <div className="space-y-2">
                {tasks.filter((t) => t.deadline && t.status !== "completed").slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-xs"><Clock className="h-3 w-3 text-muted-foreground shrink-0" /><span className="flex-1 truncate">{task.title}</span><span className="text-muted-foreground">{new Date(task.deadline).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span></div>
                ))}
                {tasks.filter((t) => t.deadline && t.status !== "completed").length === 0 && <p className="text-xs text-muted-foreground">Geen open deadlines</p>}
              </div>
            </GlassPanel>
          </div>
        </div>
      )}

      {/* Event detail */}
      <PanelForm
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Event"}
        eyebrow="Agenda · Event"
        footer={selectedEvent ? <>
          <GlassButton variant="primary" size="sm" className="flex-1" onClick={() => startEditEvent(selectedEvent)}>Bewerk</GlassButton>
          <GlassButton variant="outline" size="sm" className="flex-1" onClick={async () => { await base44.entities.Event.delete(selectedEvent.id); setSelectedEvent(null); reload(); }}>Verwijder</GlassButton>
        </> : null}
      >
        {selectedEvent && (
          <>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(selectedEvent.start).toLocaleString("nl-NL", { weekday: "long", hour: "2-digit", minute: "2-digit" })}{selectedEvent.end && ` — ${new Date(selectedEvent.end).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`}</span>
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
          </>
        )}
      </PanelForm>

      {/* Edit event */}
      <PanelForm
        open={editing}
        onClose={() => setEditing(false)}
        title="Event bewerken"
        eyebrow="Agenda"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={saveEditEvent}>Opslaan</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => setEditing(false)}>Annuleer</GlassButton>
        </>}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titel</label>
          <input value={editDraft.title || ""} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Event naam" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Datum</label>
            <input type="date" value={editDraft.date || ""} onChange={(e) => setEditDraft({ ...editDraft, date: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tijd</label>
            <input type="time" value={editDraft.time || ""} onChange={(e) => setEditDraft({ ...editDraft, time: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Locatie</label>
          <input value={editDraft.location || ""} onChange={(e) => setEditDraft({ ...editDraft, location: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Locatie of video call" />
        </div>
      </PanelForm>

      {/* New event */}
      <PanelForm
        open={showNewEvent}
        onClose={() => setShowNewEvent(false)}
        title="Nieuw event"
        eyebrow="Agenda"
        footer={<>
          <GlassButton variant="primary" size="md" className="flex-1" onClick={createEvent}>Maak aan</GlassButton>
          <GlassButton variant="outline" size="md" onClick={() => setShowNewEvent(false)}>Annuleer</GlassButton>
        </>}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titel</label>
          <input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Event naam" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Datum</label>
            <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tijd</label>
            <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Locatie</label>
          <input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Locatie of video call" />
        </div>
      </PanelForm>
    </div>
  );
}