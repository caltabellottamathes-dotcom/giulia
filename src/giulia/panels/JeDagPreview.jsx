import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, MapPin, Timer, ArrowRight, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

// ── GIULIA palette ──
const DEEP = "#595f34";   // EARTH OLIVE
const MID = "#94925d";    // Olive
const LIGHT = "#d8dab3";  // Whipped Pistachio
const URG = "#d5e24a";    // Urgent

const todayISO = () => new Date().toISOString().slice(0, 10);
const hm = (d) => new Date(d).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
const durMin = (s, e) => Math.max(1, Math.round((new Date(e) - new Date(s)) / 60000));
const fmtDur = (m) => (m >= 60 ? `${Math.floor(m / 60)}u ${m % 60}m` : `${m} min`);

/** Bouw de gecombineerde tijdlijn van vandaag: events + focusblokken + deadlines. */
function buildFlow(events, blocks, tasks) {
  const t = todayISO();
  const items = [];

  events.filter(e => (e.start || "").slice(0, 10) === t).forEach(e => {
    const s = new Date(e.start);
    const en = e.end ? new Date(e.end) : new Date(s.getTime() + 60 * 60000);
    items.push({
      id: e.id, kind: "event", title: e.title, start: s, end: en,
      location: e.location, travel: e.travel_time || 0, prep: e.prep_time || 0,
      participants: e.participants, external: !!e.location,
    });
  });

  blocks.filter(b => (b.start || "").slice(0, 10) === t && b.status !== "cancelled").forEach(b => {
    const s = new Date(b.start);
    const en = b.end ? new Date(b.end) : new Date(s.getTime() + 60 * 60000);
    items.push({ id: b.id, kind: "block", title: b.title, start: s, end: en, protected: b.type === "protected" });
  });

  tasks.filter(tk => tk.deadline === t && tk.status !== "completed").forEach(tk => {
    const s = new Date(`${t}T18:00:00`);
    items.push({ id: tk.id, kind: "deadline", title: tk.title, start: s, end: s, task: tk });
  });

  return items.sort((a, b) => a.start - b.start);
}

function whyMatters(it) {
  if (it.kind === "event") return it.external ? "Dit is je volgende externe afspraak." : "Deze afspraak staat vast in je dag.";
  if (it.kind === "block") return it.protected ? "Beschermd focus-blok — bewaak dit." : "Gereserveerde tijd voor deze taak.";
  if (it.kind === "deadline") return "Valt vandaag — afronden maakt je dag vrij.";
  return "";
}

function GraphicRule({ accent }) {
  return (
    <div className="relative">
      <div className="h-px bg-storm/20" />
      <div className="absolute left-0 top-0 h-px w-16" style={{ background: accent }} />
    </div>
  );
}

export default function JeDagPreview({ onOpen }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [completing, setCompleting] = useState(false);

  const load = async () => {
    const t = todayISO();
    const [tk, ev, bl] = await Promise.all([
      base44.entities.Task.filter({}, "-priority", 40).catch(() => []),
      base44.entities.CalendarEvent.list("start").catch(() => []),
      base44.entities.PersonalTimeBlock.filter({ status: { $ne: "cancelled" } }, "start", 40).catch(() => []),
    ]);
    setTasks(tk || []);
    setEvents((ev || []).filter(e => (e.start || "").slice(0, 10) === t));
    setBlocks((bl || []).filter(b => (b.start || "").slice(0, 10) === t));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const now = new Date();
  const flow = useMemo(() => buildFlow(events, blocks, tasks), [events, blocks, tasks]);

  // ── day complete + on track ──
  const done = tasks.filter(t => t.status === "completed").length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const overdue = tasks.filter(t => t.status === "overdue" || (t.deadline && t.deadline < todayISO() && t.status !== "completed")).length;
  const onTrack = overdue === 0 && pct >= Math.round((now.getHours() / 24) * 100) - 10;

  // ── what matters now ──
  const nextUp = flow.find(it => it.end > now && it.kind === "event");
  const minsToNext = nextUp ? Math.round((nextUp.start - now) / 60000) : null;
  const buffer = nextUp ? (nextUp.travel || 0) + (nextUp.prep || 0) : 0;
  const tight = nextUp && minsToNext !== null && minsToNext > 0 && minsToNext < buffer + 10 && buffer > 0;

  const completeTask = async (task) => {
    setCompleting(true);
    try {
      await base44.entities.Task.update(task.id, { status: "completed" });
      setTasks(ts => ts.map(x => x.id === task.id ? { ...x, status: "completed" } : x));
      setSelected(s => s && s.task?.id === task.id ? null : s);
      toast({ title: "Voltooid", description: task.title });
    } catch { toast({ title: "Mislukt", variant: "destructive" }); }
    finally { setCompleting(false); }
  };

  const ctx = [
    { label: "DAY COMPLETE", text: `${pct}% — ${done} van ${total} taken voltooid${overdue ? `, ${overdue} achter` : ""}.` },
    { label: "NEXT UP", text: nextUp ? `${nextUp.title}${minsToNext <= 0 ? " is nu bezig" : minsToNext < 60 ? ` over ${minsToNext} min` : ` over ${Math.floor(minsToNext / 60)}u ${minsToNext % 60}m`}` : "Niets op de tijdlijn — vrije ruimte." },
    { label: "STATUS", text: onTrack ? "Niets loopt achter. Rustige ruimte om vooruit te werken." : `${overdue} taak${overdue > 1 ? "en" : ""} achter — ronde ze af voor nieuwe commits.` },
  ];

  const go = (path) => { onOpen?.(); navigate(path); };

  return (
    <div className="flex flex-col text-storm">
      {/* ── BODY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 pb-6">
        {/* TODAY'S FLOW */}
        <div className="flex flex-col">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">TODAY'S FLOW · {loading ? "LADEN" : `${flow.length} MOMENTEN`}</p>
          {loading && <p className="text-storm/40 text-sm py-3">Tijdlijn laden…</p>}
          {!loading && flow.length === 0 && (
            <p className="text-storm/40 text-sm py-3">Geen afspraken of blokken vandaag — vrije ruimte.</p>
          )}
          <AnimatePresence initial={false}>
            {flow.map((it) => {
              const isOpen = selected?.id === it.id;
              const past = it.end < now;
              const isEvent = it.kind === "event";
              const isDeadline = it.kind === "deadline";
              const isBlock = it.kind === "block";
              const dotFilled = isEvent || isBlock;
              return (
                <motion.div key={it.id} layout initial={false} className="relative">
                  <button
                    onClick={() => setSelected(isOpen ? null : it)}
                    className={`w-full text-left flex items-start gap-3 py-2.5 transition-opacity ${past ? "opacity-45" : ""}`}
                  >
                    <span className="w-12 shrink-0 text-storm/55 text-[12px] tabular-nums pt-0.5">{hm(it.start)}</span>
                    <span className="relative flex shrink-0 pt-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full border-2 ${dotFilled ? "" : "bg-transparent"}`}
                        style={{ borderColor: isDeadline ? URG : DEEP, background: dotFilled ? (isBlock ? MID : DEEP) : "transparent" }} />
                    </span>
                    <span className="flex-1 min-w-0 pt-0.5">
                      <p className="text-storm text-[13px] font-medium leading-tight truncate">{it.title}</p>
                      <p className="text-storm/50 text-[11px] mt-0.5">
                        {isDeadline ? "Deadline vandaag" : fmtDur(durMin(it.start, it.end))}
                        {isEvent && it.location ? ` · ${it.location}` : ""}
                      </p>
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="ml-[60px] mr-1 mb-3 rounded-2xl border border-storm/10 bg-marble/5 px-4 py-3.5 flex flex-col gap-2.5">
                          <div className="flex flex-col gap-1.5 text-[12px] text-storm/75">
                            <Row icon={Clock} label="Tijd" value={`${hm(it.start)} – ${hm(it.end)}`} />
                            {isEvent && it.location && <Row icon={MapPin} label="Locatie" value={it.location} />}
                            {isEvent && it.travel > 0 && <Row icon={Timer} label="Reistijd" value={`${it.travel} min`} />}
                            {isEvent && it.prep > 0 && <Row icon={Timer} label="Voorbereiding" value={`${it.prep} min`} />}
                            {isBlock && <Row icon={Clock} label="Type" value={it.protected ? "Beschermd focus" : "Gereserveerd"} />}
                            {isDeadline && <Row icon={Clock} label="Deadline" value="vandaag" />}
                          </div>
                          <div className="rounded-xl px-3 py-2 mt-0.5" style={{ background: `${LIGHT}55` }}>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-0.5" style={{ color: DEEP }}>Why it matters</p>
                            <p className="text-storm text-[12px] leading-relaxed">{whyMatters(it)}</p>
                          </div>
                          {isDeadline && (
                            <button onClick={() => completeTask(it.task)} disabled={completing}
                              className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-[11px] font-semibold text-ivory transition disabled:opacity-50" style={{ background: DEEP }}>
                              <Check className="h-3 w-3" /> Voltooi
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* WHAT MATTERS NOW */}
        <div className="flex flex-col gap-3">
          <p className="text-storm/50 text-[10px] tracking-[0.25em]">WHAT MATTERS NOW</p>
          <div className="rounded-2xl border border-storm/10 bg-marble/5 px-4 py-3.5 flex flex-col gap-2">
            {nextUp ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: DEEP }}>NEXT UP</p>
                <p className="text-storm text-[13px] leading-snug">
                  {nextUp.title} {minsToNext <= 0 ? "is nu bezig." : minsToNext < 60 ? `over ${minsToNext} min.` : `over ${Math.floor(minsToNext / 60)}u ${minsToNext % 60}m.`}
                </p>
                {tight && (
                  <div className="flex items-start gap-2 mt-1 rounded-xl px-3 py-2" style={{ background: `${URG}22` }}>
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#8a7a1a" }} />
                    <p className="text-[12px] leading-relaxed" style={{ color: "#6b5e16" }}>
                      <span className="font-semibold">RUNNING TIGHT</span> — {nextUp.travel || 0} min reistijd, {nextUp.prep || 0} min voorbereiding.
                    </p>
                  </div>
                )}
              </>
            ) : overdue > 0 ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: "#8a7a1a" }}>ATTENTION</p>
                <p className="text-storm text-[13px] leading-snug">{overdue} taak{overdue > 1 ? "en" : ""} lopen achter — ronde ze af.</p>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: DEEP }}>YOU'RE GOOD.</p>
                <p className="text-storm text-[13px] leading-snug">Niets vraagt nu je aandacht.</p>
              </>
            )}
          </div>
          <div className="rounded-2xl border border-storm/10 bg-marble/5 px-4 py-3.5 flex items-baseline gap-2">
            <p className="text-storm text-[34px] font-display font-semibold tabular-nums leading-none">{pct}<span className="text-[20px] text-storm/50">%</span></p>
            <p className="text-storm/55 text-[10px] uppercase tracking-[0.2em] pb-1">Day complete</p>
          </div>
        </div>
      </div>

      {/* ── FIXED FOOTER ── */}
      <div className="sticky bottom-0 -mx-7 lg:-mx-9 px-7 lg:px-9 pb-6 pt-4 bg-metal/85 backdrop-blur-md border-t border-storm/10 z-10">
        <GraphicRule accent={DEEP} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
          {ctx.map((c, i) => (
            <div key={i}>
              <div className="flex items-center gap-2.5">
                <span className="text-storm/30 text-[10px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-storm/80 text-[10px] uppercase tracking-[0.2em] font-semibold">{c.label}</p>
              </div>
              <p className="text-storm/70 text-xs mt-1.5 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
        <GraphicRule accent={DEEP} />
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => go("/agenda")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-metal text-[10px] font-semibold tracking-[0.15em] uppercase hover:brightness-95 active:scale-95 transition-all" style={{ background: DEEP }}>
            Full day <ArrowRight className="h-3 w-3" />
          </button>
          <button onClick={() => go("/tasks")} className="px-4 py-2 rounded-full border border-storm/15 bg-marble/5 text-storm/80 text-[10px] tracking-[0.15em] uppercase hover:bg-marble/10 transition-colors">New task</button>
          <button onClick={() => go("/agenda")} className="px-4 py-2 rounded-full border border-storm/15 bg-marble/5 text-storm/80 text-[10px] tracking-[0.15em] uppercase hover:bg-marble/10 transition-colors">Agenda</button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-storm/50 shrink-0" />
      <span className="text-storm/55 w-24 shrink-0">{label}</span>
      <span className="text-storm truncate">{value}</span>
    </div>
  );
}