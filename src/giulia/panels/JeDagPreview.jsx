import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, Check, RefreshCw, MessageSquare, ArrowUpRight,
  AlertCircle, MapPin, Timer, Clock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedRing, BarGrow } from "@/glass/components/modules/viz";

// ── GIULIA palette ──
const DEEP = "#595f34";   // EARTH OLIVE
const MID = "#94925d";    // Olive
const LIGHT = "#d8dab3";  // Whipped Pistachio
const URG = "#d5e24a";    // Urgent

// ── Day timeline constants ──
const DAY_START = 6;   // 06:00
const DAY_END = 24;   // 24:00
const SPAN = DAY_END - DAY_START; // 18h
const HOUR_H = 40;     // px per hour
const TRACK_H = SPAN * HOUR_H;

const clampMin = (m) => Math.max(0, Math.min(SPAN * 60, m));
const yOf = (min) => (min / 60) * HOUR_H;

function dayStatus(now, overdue, eventCount) {
  const h = now.getHours();
  let base = "Rust";
  if (h < 6) base = "Vroege ochtend";
  else if (h < 9) base = "Ochtend — frisse start";
  else if (h < 12) base = "Ochtend — focuswindow";
  else if (h < 14) base = "Middag — kort focus";
  else if (h < 18) base = "Middag — uitvoeren";
  else if (h < 22) base = "Avond — afsluiten";
  const tags = [];
  if (overdue > 0) tags.push(`${overdue} achterstallig`);
  if (eventCount >= 4) tags.push("drukke dag");
  return tags.length ? `${base} · ${tags.join(" · ")}` : base;
}

export default function JeDagPreview({ onOpen }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      base44.entities.Task.filter({ status: { $ne: "completed" } }, "-priority", 30).catch(() => []),
      base44.entities.CalendarEvent.list("start").catch(() => []),
      base44.entities.PersonalTimeBlock.filter({ status: { $ne: "cancelled" } }, "start", 30).catch(() => []),
      base44.entities.Insight.list("-created_date", 1).catch(() => []),
    ]).then(([t, e, b, ins]) => {
      setTasks(t || []);
      setEvents((e || []).filter(x => (x.start || "").slice(0, 10) === today));
      setBlocks((b || []).filter(x => (x.start || "").slice(0, 10) === today));
      setInsight((ins && ins[0]) || null);
    }).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const todayStr = now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  // ── timeline blocks ──
  const lanes = useMemo(() => {
    const ev = events.map(e => {
      const s = new Date(e.start);
      const en = e.end ? new Date(e.end) : new Date(s.getTime() + 60 * 60000);
      const sMin = clampMin((s.getHours() * 60 + s.getMinutes()) - DAY_START * 60);
      const eMin = clampMin((en.getHours() * 60 + en.getMinutes()) - DAY_START * 60);
      return { id: e.id, kind: "event", title: e.title, loc: e.location, start: s, end: en, sMin, eMin, travel: e.travel_time || 0, prep: e.prep_time || 0, color: DEEP };
    }).filter(x => x.eMin > x.sMin);
    const bl = blocks.map(b => {
      const s = new Date(b.start);
      const en = b.end ? new Date(b.end) : new Date(s.getTime() + 60 * 60000);
      const sMin = clampMin((s.getHours() * 60 + s.getMinutes()) - DAY_START * 60);
      const eMin = clampMin((en.getHours() * 60 + en.getMinutes()) - DAY_START * 60);
      const isFocus = b.type === "protected";
      return { id: b.id, kind: "block", title: b.title, start: s, end: en, sMin, eMin, color: isFocus ? DEEP : MID, soft: !isFocus };
    }).filter(x => x.eMin > x.sMin);
    return [...ev, ...bl].sort((a, b) => a.sMin - b.sMin);
  }, [events, blocks]);

  // ── urgent: max 3 (overdue tasks first, then soonest events) ──
  const urgent = useMemo(() => {
    const overdue = tasks.filter(t => t.status === "overdue" || (t.deadline && new Date(t.deadline) < new Date(now.toISOString().slice(0, 10)) && t.status !== "completed"));
    const highOpen = tasks.filter(t => t.priority === "high" && t.status !== "completed" && !overdue.includes(t));
    const soonEvent = events.slice(0, 2).map(e => ({
      id: e.id, kind: "event", title: e.title, time: e.start, status: e.status, action: "Open",
    }));
    const taskItems = [...overdue, ...highOpen].slice(0, 3).map(t => ({
      id: t.id, kind: "task", title: t.title, time: t.deadline, status: t.status, priority: t.priority, action: "Voltooi",
    }));
    return [...taskItems, ...soonEvent].slice(0, 3);
  }, [tasks, events, now]);

  // ── progress ──
  const done = tasks.filter(t => t.status === "completed").length;
  const open = tasks.length - done;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  // scheduled minutes today (events + blocks)
  const bookedMin = lanes.reduce((a, x) => a + (x.eMin - x.sMin), 0);
  const focusMin = lanes.filter(x => x.kind === "block").reduce((a, x) => a + (x.eMin - x.sMin), 0);
  const workMin = SPAN * 60 - bookedMin; // available (free)
  const workH = (workMin / 60).toFixed(1);
  const bookedH = (bookedMin / 60).toFixed(1);
  const focusH = (focusMin / 60).toFixed(1);

  // now line
  const nowMin = clampMin((now.getHours() * 60 + now.getMinutes()) - DAY_START * 60);
  const nowY = yOf(nowMin);

  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollTop = Math.max(0, nowY - 90);
  }, [nowY, loading]);

  const observation = insight
    ? (insight.title || insight.content || "").slice(0, 160)
    : `Je hebt ${events.length} afspraken en ${open} open taken vandaag. Begin met de zwaarste vóór je je inbox opent.`;

  const completeTop = async () => {
    const t = urgent.find(u => u.kind === "task");
    if (!t) { toast({ title: "Niets af te ronden" }); return; }
    setCompleting(true);
    try {
      await base44.entities.Task.update(t.id, { status: "completed" });
      setTasks(ts => ts.map(x => x.id === t.id ? { ...x, status: "completed" } : x));
      toast({ title: "Taak voltooid", description: t.title });
    } catch { toast({ title: "Voltooien mislukt", variant: "destructive" }); }
    finally { setCompleting(false); }
  };

  const quickActions = [
    { label: "Complete task", icon: Check, onClick: completeTop, busy: completing },
    { label: "Open event", icon: Calendar, onClick: () => onOpen?.() },
    { label: "Reschedule", icon: RefreshCw, onClick: () => navigate("/agenda") },
    { label: "Ask GIULIA", icon: MessageSquare, onClick: () => navigate("/chat") },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-marble/55 text-[10px] uppercase tracking-[0.28em] mb-1">Today</p>
            <h3 className="text-storm text-xl font-display font-semibold capitalize leading-tight">{todayStr}</h3>
            <p className="text-marble/65 text-[13px] mt-1.5 leading-relaxed">{dayStatus(now, tasks.filter(t => t.status === "overdue").length, events.length)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-marble/45 text-[10px] uppercase tracking-[0.24em] mb-1">Nu</p>
            <p className="text-storm text-2xl font-display tabular-nums leading-none">{now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl border border-marble/15 bg-marble/5 px-3.5 py-3">
          <span className="mt-0.5 h-2 w-2 rounded-full shrink-0" style={{ background: URG }} />
          <p className="text-marble/80 text-[13px] leading-relaxed">{observation}</p>
        </div>
      </div>

      {/* ── 01 · DAY PLAN ── */}
      <section className="flex flex-col gap-3">
        <SectionLabel n="01" title="DAY PLAN" hint="vandaag" />
        <div ref={trackRef} className="relative max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
          <div className="relative" style={{ height: TRACK_H }}>
            {/* hour rails */}
            {Array.from({ length: SPAN + 1 }).map((_, i) => {
              const h = DAY_START + i;
              return (
                <div key={i} className="absolute left-0 right-0 flex items-center" style={{ top: i * HOUR_H }}>
                  <span className="w-10 shrink-0 text-marble/45 text-[10px] tabular-nums pr-2 text-right">{String(h % 24).padStart(2, "0")}:00</span>
                  <div className="flex-1 h-px bg-marble/10" />
                </div>
              );
            })}
            {/* now line */}
            <div className="absolute left-0 right-0 z-20 flex items-center" style={{ top: nowY }}>
              <span className="w-10 shrink-0 text-right pr-2 text-[10px] font-bold tabular-nums" style={{ color: URG }}>{now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</span>
              <div className="flex-1 h-px" style={{ background: URG }} />
              <span className="h-2.5 w-2.5 rounded-full -mr-1" style={{ background: URG }} />
            </div>
            {/* lanes */}
            {loading ? null : lanes.map(l => {
              const top = yOf(l.sMin);
              const height = Math.max(22, (l.eMin - l.sMin) / 60 * HOUR_H);
              const travelW = l.travel ? (l.travel / 60) * HOUR_H : 0;
              const prepW = l.prep ? (l.prep / 60) * HOUR_H : 0;
              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute z-10 flex items-stretch gap-1"
                  style={{ top, height, left: 44, right: 8 }}
                >
                  {(travelW > 0 || prepW > 0) && (
                    <div className="rounded-md flex items-center justify-center" style={{ width: travelW + prepW, background: `${URG}33`, border: `1px dashed ${URG}88` }} title={`Voorbereiding/reistijd ${l.travel + l.prep} min`}>
                      {(travelW + prepW) > 22 && <Timer className="h-3 w-3" style={{ color: URG }} />}
                    </div>
                  )}
                  <div
                    className="flex-1 rounded-lg px-3 py-1.5 overflow-hidden flex flex-col justify-center"
                    style={{ background: l.soft ? `${l.color}22` : l.color, border: `1px solid ${l.soft ? `${l.color}55` : l.color}` }}
                  >
                    <p className={`text-[12px] font-semibold leading-tight truncate ${l.soft ? "text-storm" : "text-ivory"}`}>{l.title}</p>
                    <p className="text-[10px] mt-0.5 flex items-center gap-1 truncate" style={{ color: l.soft ? "rgba(216,218,179,0.7)" : "rgba(255,255,255,0.65)" }}>
                      {l.loc ? <><MapPin className="h-2.5 w-2.5" /> {l.loc}</> : <Clock className="h-2.5 w-2.5" />}
                      <span className="tabular-nums">{l.start.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })} – {l.end.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</span>
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {(!loading && lanes.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-marble/45 text-sm">Geen afspraken of blokken vandaag — vrije ruimte.</p>
              </div>
            )}
          </div>
        </div>
        {/* important tasks row */}
        <div className="flex flex-wrap gap-2">
          {tasks.filter(t => t.priority === "high" && t.status !== "completed").slice(0, 4).map(t => (
            <span key={t.id} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium" style={{ background: `${LIGHT}22`, color: LIGHT, border: `1px solid ${LIGHT}44` }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: URG }} />
              {t.title}
            </span>
          ))}
          {tasks.filter(t => t.priority === "high" && t.status !== "completed").length === 0 && (
            <p className="text-marble/45 text-[12px]">Geen hoge-prioriteit taken vandaag.</p>
          )}
        </div>
      </section>

      {/* ── 02 · URGENT ── */}
      <section className="flex flex-col gap-3">
        <SectionLabel n="02" title="URGENT" hint="max 3" />
        <div className="flex flex-col gap-2.5">
          {urgent.length === 0 && <p className="text-marble/45 text-[13px]">Niets dringends — rustig tempo.</p>}
          {urgent.map((u, i) => (
            <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-marble/15 bg-marble/5 px-4 py-3">
              <span className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: u.kind === "task" ? (u.priority === "high" ? URG : MID) : DEEP, color: u.kind === "task" && u.priority === "high" ? "#301728" : "#fff" }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-storm text-sm font-medium truncate">{u.title}</p>
                <p className="text-marble/55 text-[11px] mt-0.5 flex items-center gap-1.5">
                  {u.kind === "task" ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                  {u.time ? new Date(u.time).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Geen deadline"}
                  <span className="opacity-40">·</span>
                  <span className="uppercase tracking-wider">{u.status || "—"}</span>
                </p>
              </div>
              <button
                onClick={() => u.kind === "task" ? completeTop() : onOpen?.()}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition glass-button text-ivory"
              >
                {u.action} <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 03 · PROGRESS ── */}
      <section className="flex flex-col gap-3">
        <SectionLabel n="03" title="PROGRESS" hint="vandaag" />
        <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
          <AnimatedRing pct={pct} size={132} stroke={10} color={DEEP} label={`${pct}%`} sub="DONE" />
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-marble/65">Voltooid</span>
                <span className="text-storm tabular-nums">{done}/{tasks.length}</span>
              </div>
              <BarGrow value={done} max={tasks.length || 1} color={MID} height={8} />
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-marble/65">Workload vs beschikbaar</span>
                <span className="text-storm tabular-nums">{bookedH}u / {workH}u vrij</span>
              </div>
              <BarGrow value={bookedMin} max={bookedMin + workMin || 1} color={URG} height={8} />
            </div>
            <p className="text-marble/55 text-[11px] leading-relaxed">
              {focusH}u focus geblokkeerd · {open} taken open · {events.length} afspraken.
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {quickActions.map(a => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={a.onClick}
              disabled={a.busy}
              className="inline-flex flex-col items-center justify-center gap-1.5 rounded-2xl glass-button px-3 py-3 text-ivory/85 hover:text-ivory transition disabled:opacity-50"
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionLabel({ n, title, hint }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[11px] font-bold tabular-nums" style={{ color: URG }}>{n}</span>
      <span className="text-storm text-[11px] font-semibold tracking-[0.24em] uppercase">{title}</span>
      {hint && <span className="text-marble/40 text-[10px] uppercase tracking-wider ml-auto">{hint}</span>}
    </div>
  );
}