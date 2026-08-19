import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import PanelForm from "@/system/components/glass/PanelForm";
import PageHero from "@/system/components/glass/PageHero";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import PlanningContent from "@/focus/components/agenda/PlanningContent";
import { plannedBlocksForDate } from "@/lib/weekPlan";
import {
  ChevronLeft, ChevronRight, Clock, MapPin, Sparkles, Plus, RefreshCw, Calendar,
} from "lucide-react";

const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const monthNames = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 .. 20

// Vivid palette — every event gets a color from the GIULIA brand palette.
const PALETTES = [
  { chip: "bg-d-focus-deep text-ivory", dot: "bg-d-focus-deep", ring: "ring-d-focus-deep/50" },
  { chip: "bg-d-life-deep text-charcoal", dot: "bg-d-life-deep", ring: "ring-d-life-deep/50" },
  { chip: "bg-d-giulia-deep text-ivory", dot: "bg-d-giulia-deep", ring: "ring-d-giulia-deep/50" },
  { chip: "bg-steel text-ivory", dot: "bg-steel", ring: "ring-steel/50" },
  { chip: "bg-d-life-urgent text-charcoal", dot: "bg-d-life-urgent", ring: "ring-d-life-urgent/60" },
  { chip: "bg-d-giulia-light text-charcoal", dot: "bg-d-giulia-light", ring: "ring-d-giulia-light/60" },
];
const DOMAIN_COLOR = { focus: PALETTES[0], life: PALETTES[1], self: PALETTES[1] };
const colorFor = (ev) => DOMAIN_COLOR[ev.domain] || PALETTES[3];

const sameDay = (a, b) => a.toDateString() === b.toDateString();
const mondayOf = (d) => { const m = new Date(d); m.setHours(0,0,0,0); m.setDate(m.getDate() - ((m.getDay()+6)%7)); return m; };

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

  const { data: events, loading, reload } = useEntityList("CalendarEvent", { sort: "start" });
  const { data: projects } = useEntityList("Project");
  const { data: tasks } = useEntityList("Task");
  const { data: weeklyPlans } = useEntityList("WeeklyPlan");
  const { data: checkIns } = useEntityList("SelfCheckIn");
  const { data: meals } = useEntityList("Meal");
  const { data: trajectories } = useEntityList("TherapyTrajectory");
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
  const weekStart = mondayOf(currentDate);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
  const weekStartIso = weekStart.toLocaleDateString("sv-SE");
  const weekly = (weeklyPlans || []).find((p) => p.week_start === weekStartIso) || null;
  const inWeek = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x >= weekStart && x <= weekEnd; };
  const weekCount = events.filter((e) => inWeek(new Date(e.start))).length;
  const openDeadlines = tasks.filter((t) => t.deadline && t.status !== "completed").length;
  // Cross-domain context — SELF-capaciteit vandaag + FOOD-diner vandaag + therapie-titel
  const _todayStr = new Date().toLocaleDateString("sv-SE");
  const latestCheckIn = (checkIns || []).filter((c) => c.timestamp && new Date(c.timestamp).toLocaleDateString("sv-SE") === _todayStr).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;
  const todayDinner = (meals || []).find((m) => m.date === _todayStr && m.meal_type === "dinner") || null;
  const trajTitle = (id) => (trajectories || []).find((t) => t.id === id)?.title;

  const step = (dir) => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else if (view === "month") d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const label = () => {
    if (view === "day") return currentDate.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
    if (view === "week") return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} — ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]}`;
    if (view === "month") return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    return "";
  };

  const weekDates = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const gridStart = mondayOf(monthStart);
  const monthCells = Array.from({ length: 42 }, (_, i) => { const d = new Date(gridStart); d.setDate(d.getDate() + i); return d; });

  const createEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const start = new Date(`${newEvent.date}T${newEvent.time || "09:00"}:00`).toISOString();
    const end = new Date(new Date(start).getTime() + 60*60*1000).toISOString();
    await base44.entities.CalendarEvent.create({ title: newEvent.title.trim(), start, end, location: newEvent.location, domain: "focus", status: "confirmed" });
    setNewEvent({ title: "", date: "", time: "09:00", location: "" });
    setShowNewEvent(false); reload();
  };
  const startEditEvent = (ev) => {
    const d = new Date(ev.start);
    setEditDraft({ title: ev.title, date: d.toISOString().slice(0,10), time: d.toTimeString().slice(0,5), location: ev.location || "" });
    setEditing(true);
  };
  const saveEditEvent = async () => {
    if (!selectedEvent || !editDraft.date) return;
    const start = new Date(`${editDraft.date}T${editDraft.time || "09:00"}:00`).toISOString();
    const end = new Date(new Date(start).getTime() + 60*60*1000).toISOString();
    await base44.entities.CalendarEvent.update(selectedEvent.id, { title: editDraft.title, start, end, location: editDraft.location });
    setEditing(false); setSelectedEvent(null); reload();
  };
  const openDay = (d) => { setCurrentDate(d); setView("day"); };

  const stats = [
    { label: "Vandaag", value: todayCount, c: "bg-olive/15 text-olive" },
    { label: "Deze week", value: weekCount, c: "bg-powder/25 text-steel" },
    { label: "Open deadlines", value: openDeadlines, c: "bg-urgent/25 text-charcoal" },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      <PageHero
        page="agenda"
        icon={Calendar}
        eyebrow="Tijd"
        title="What's Happening?"
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
            <button key={v.id} onClick={() => setView(v.id)} className={cn("px-4 py-1.5 text-xs rounded-full transition-all", view === v.id ? "bg-charcoal text-ivory font-medium" : "text-muted-foreground hover:text-foreground")}>{v.label}</button>
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

      {/* Compact stats strip — replaces the old side panels */}
      {view !== "planning" && (
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <div key={s.label} className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium", s.c)}>
              <span className="tabular-nums font-semibold">{s.value}</span>
              <span className="opacity-80">{s.label}</span>
            </div>
          ))}
          {weekly && (
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium bg-olive/15 text-olive">
              <Sparkles className="h-3.5 w-3.5" /> Weekplanning actief
            </div>
          )}
          {latestCheckIn && (
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium bg-ridge/25 text-charcoal" title="SELF · laatste check-in vandaag">
              <span className="tabular-nums font-semibold">{latestCheckIn.capacity ?? "—"}</span>
              <span className="opacity-80">capacity · {latestCheckIn.state || latestCheckIn.mood || "?"}</span>
            </div>
          )}
          {todayDinner && (
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium bg-sand/30 text-charcoal" title="FOOD · diner vandaag">
              <span className="font-medium truncate max-w-[160px]">{todayDinner.recipe_name || "Diner"}</span>
              {todayDinner.total_time ? <span className="opacity-70">· {todayDinner.total_time}min</span> : null}
            </div>
          )}
          <div className="inline-flex items-center gap-2 rounded-full glass-1 px-3 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-olive" />
            {todayCount > 0 ? `${todayCount} afspraak${todayCount === 1 ? "" : "en"} vandaag` : "Ruimte voor focus vandaag"}
          </div>
        </div>
      )}

      {view === "planning" ? (
        <PlanningContent />
      ) : (
        <GlassPanel level={2} className="p-4 lg:p-5">
          {/* DAY */}
          {view === "day" && (
            <div className="space-y-1">
              {HOURS.map((h) => {
                const hourEvents = eventsForDay(currentDate).filter((e) => new Date(e.start).getHours() === h);
                const hourPlanned = plannedBlocksForDate(weekly, currentDate).filter((b) => b.startHour === h);
                return (
                  <div key={h} className="flex gap-3 min-h-[44px]">
                    <div className="w-10 pt-1.5 text-right text-[10px] text-muted-foreground tabular-nums shrink-0">{String(h).padStart(2,"0")}:00</div>
                    <div className="flex-1 border-t border-border/20 pt-1 space-y-1">
                      {hourEvents.map((ev) => {
                        const c = colorFor(ev);
                        return (
                          <button key={ev.id} onClick={() => setSelectedEvent(ev)} className={cn("w-full text-left rounded-lg px-3 py-1.5 transition flex items-center gap-2 hover:brightness-105", c.chip)}>
                            <span className="text-sm font-medium truncate flex-1">{ev.title}</span>
                            <span className="text-[10px] opacity-80 tabular-nums shrink-0">{new Date(ev.start).toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}{ev.location ? ` · ${ev.location}`:""}</span>
                          </button>
                        );
                      })}
                      {hourPlanned.map((b, pi) => (
                        <div key={`p${pi}`} className="w-full text-left rounded-lg px-3 py-1.5 flex items-center gap-2 border border-dashed border-d-giulia-mid/50 bg-d-giulia-mid/10 text-d-giulia-light">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm font-medium truncate flex-1">{b.title}</span>
                          {b.startHour != null && <span className="text-[10px] opacity-80 tabular-nums shrink-0">{String(b.startHour).padStart(2,"0")}:{String(b.startMin).padStart(2,"0")}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {eventsForDay(currentDate).length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Geen afspraken op deze dag.</p>}
            </div>
          )}

          {/* WEEK — compact, whole week at a glance */}
          {view === "week" && (
            <div className="overflow-x-auto -mx-1 px-1">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-8 gap-1 mb-1">
                  <div />
                  {weekDates.map((date, i) => {
                    const isToday = sameDay(date, new Date());
                    return (
                      <div key={i} className="text-center pb-1">
                        <p className="text-[10px] uppercase text-muted-foreground">{weekDays[i]}</p>
                        <p className={cn("text-xs mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full", isToday ? "bg-d-life-deep text-charcoal font-semibold" : "text-foreground/70")}>{date.getDate()}</p>
                      </div>
                    );
                  })}
                </div>
                {HOURS.map((h) => (
                  <div key={h} className="grid grid-cols-8 gap-1 mb-px">
                    <div className="text-right pr-1 pt-0.5 text-[9px] text-muted-foreground tabular-nums">{String(h).padStart(2,"0")}</div>
                    {weekDates.map((date, di) => {
                      const dayEvents = eventsForDay(date).filter((e) => new Date(e.start).getHours() === h);
                      const dayPlanned = plannedBlocksForDate(weekly, date).filter((b) => b.startHour === h);
                      return (
                        <div key={di} className="min-h-[22px] rounded-md hover:bg-foreground/[0.02] transition-colors p-0.5 space-y-0.5">
                          {dayEvents.map((ev) => {
                            const c = colorFor(ev);
                            return (
                              <button key={ev.id} onClick={() => setSelectedEvent(ev)} className={cn("w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate block", c.chip)} title={`${ev.title} · ${new Date(ev.start).toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}`}>
                                {ev.title}
                              </button>
                            );
                          })}
                          {dayPlanned.map((b, pi) => (
                            <div key={`p${pi}`} className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate border border-dashed border-d-giulia-mid/50 bg-d-giulia-mid/10 text-d-giulia-light" title={`Giulia · ${b.title}`}>
                              {b.title}
                            </div>
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
              <div className="grid grid-cols-7 gap-1 mb-1">
                {weekDays.map((d) => <div key={d} className="text-center text-[10px] uppercase text-muted-foreground py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthCells.map((date, i) => {
                  const inMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = sameDay(date, new Date());
                  const dayEvents = eventsForDay(date);
                  return (
                    <button key={i} onClick={() => openDay(date)} className={cn("rounded-lg p-1.5 min-h-[56px] text-left border transition-all flex flex-col", inMonth ? "border-border/20 glass-1 hover:bg-foreground/5" : "border-transparent text-muted-foreground/40 bg-transparent", isToday && "ring-1 ring-d-life-deep/50")}>
                      <span className={cn("text-[11px] font-medium", isToday && "text-d-life-deep font-bold")}>{date.getDate()}</span>
                      <div className="mt-0.5 space-y-0.5 flex-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const c = colorFor(ev);
                          return <span key={ev.id} className={cn("block text-[9px] truncate rounded px-1 py-0.5", c.chip)}>{ev.title}</span>;
                        })}
                        {dayEvents.length > 3 && <div className="text-[9px] text-muted-foreground">+{dayEvents.length - 3}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </GlassPanel>
      )}

      {/* Event detail */}
      <PanelForm
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Event"}
        eyebrow="Agenda · Event"
        footer={selectedEvent ? <>
          <GlassButton variant="primary" size="sm" className="flex-1" onClick={() => startEditEvent(selectedEvent)}>Bewerk</GlassButton>
          <GlassButton variant="outline" size="sm" className="flex-1" onClick={async () => { await base44.entities.CalendarEvent.delete(selectedEvent.id); setSelectedEvent(null); reload(); }}>Verwijder</GlassButton>
        </> : null}
      >
        {selectedEvent && (
          <>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /><span>{new Date(selectedEvent.start).toLocaleString("nl-NL",{weekday:"long",hour:"2-digit",minute:"2-digit"})}{selectedEvent.end && ` — ${new Date(selectedEvent.end).toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}`}</span></div>
              {selectedEvent.location && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selectedEvent.location}</span></div>}
            </div>
            {selectedEvent.domain && (
              <div className="glass-1 rounded-xl p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Domein</p><p className="text-sm font-medium capitalize">{selectedEvent.domain}</p></div>
            )}
            {selectedEvent.project_id && projTitle(selectedEvent.project_id) && (
              <div className="glass-1 rounded-xl p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Gekoppeld project</p><p className="text-sm font-medium">{projTitle(selectedEvent.project_id)}</p></div>
            )}
            {selectedEvent.therapy_trajectory_id && (
              <div className="glass-1 rounded-xl p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Therapie-traject</p><p className="text-sm font-medium">{trajTitle(selectedEvent.therapy_trajectory_id) || "Gekoppeld"}</p></div>
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
          <div><label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Datum</label><input type="date" value={editDraft.date || ""} onChange={(e) => setEditDraft({ ...editDraft, date: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" /></div>
          <div><label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tijd</label><input type="time" value={editDraft.time || ""} onChange={(e) => setEditDraft({ ...editDraft, time: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" /></div>
        </div>
        <div><label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Locatie</label><input value={editDraft.location || ""} onChange={(e) => setEditDraft({ ...editDraft, location: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Locatie of video call" /></div>
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
        <div><label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titel</label><input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Event naam" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Datum</label><input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" /></div>
          <div><label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tijd</label><input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" /></div>
        </div>
        <div><label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Locatie</label><input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Locatie of video call" /></div>
      </PanelForm>
    </div>
  );
}