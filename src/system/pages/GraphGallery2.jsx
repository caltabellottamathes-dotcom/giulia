import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { CheckCircle2, Clock, Calendar, TrendingUp, Target, Flag, Search, Mail, FileText, Plus, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { GlassPanel, GlassButton, Divider, SectionHeader, StatusBadge, CATEGORY_HEX, CATEGORY_COLORS } from "@/glass/components/glass";
import { AnimatedRing, BarGrow, LiveSparkline, PulseWave, CountUp } from "@/glass/components/modules/viz";
import { TASKS } from "@/glass/lib/tasks";
import { PROJECTS } from "@/glass/lib/projects";
import { GOALS } from "@/glass/lib/goals";
import { TIME_ENTRIES } from "@/glass/lib/time";
import { IDEAS } from "@/glass/lib/ideas";

const URGENT_HEX = CATEGORY_HEX.Afspraken; // #d5e24a

/** GraphGallery2 — alle visuele elementen & grafieken uit de /glass-pagina's,
 *  genummerd + benoemd, op een dark-metal ondergrond zodat de glas-visuals
 *  tot hun recht komen. */

function Item({ n, name, children, span = "" }) {
  return (
    <GlassPanel className={`p-5 ${span}`}>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-lg font-display font-semibold tabular-nums leading-none" style={{ color: URGENT_HEX }}>{n}</span>
        <span className="text-sm font-medium text-storm">{name}</span>
      </div>
      {children}
    </GlassPanel>
  );
}

const CHART_TIP = { background: "rgba(45,45,35,0.9)", border: "1px solid rgba(224,222,211,0.3)", borderRadius: 12, color: "#F2F2F0", fontSize: 12 };

function StatCardViz() {
  return (
    <GlassPanel className="p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl border border-marble/30 bg-marble/10 flex items-center justify-center text-urgent"><CheckCircle2 className="w-5 h-5" /></div>
      <div><p className="text-marble/60 text-xs">Voltooid</p><p className="text-storm text-2xl font-semibold leading-none mt-1">{TASKS.filter(t => t.status === "voltooid").length}</p></div>
    </GlassPanel>
  );
}

function CategoryBar() {
  const map = {}; TASKS.forEach(t => { map[t.category] = (map[t.category] || 0) + t.duration; });
  const data = Object.entries(map).map(([name, minutes]) => ({ name, minutes }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,222,211,0.12)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#E0DED3", fontSize: 11 }} axisLine={{ stroke: "rgba(224,222,211,0.2)" }} tickLine={false} />
          <YAxis tick={{ fill: "#E0DED3", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "rgba(224,222,211,0.08)" }} contentStyle={CHART_TIP} />
          <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>{data.map(e => <Cell key={e.name} fill={CATEGORY_HEX[e.name] || "#B1BEC6"} />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusDonut() {
  const completed = TASKS.filter(t => t.status === "voltooid").length;
  const running = TASKS.filter(t => t.status === "lopend").length;
  const planned = TASKS.filter(t => t.status === "gepland").length;
  const data = [
    { name: "Voltooid", value: completed, color: CATEGORY_HEX.Afspraken },
    { name: "Lopend", value: running, color: CATEGORY_HEX.Identiteit },
    { name: "Gepland", value: planned, color: "#E0DED3" },
  ];
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>{data.map(e => <Cell key={e.name} fill={e.color} stroke="rgba(45,45,35,0.4)" strokeWidth={2} />)}</Pie><Tooltip contentStyle={CHART_TIP} /></PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function GoalCard() {
  const g = GOALS[0];
  return (
    <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5 flex flex-col">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl border border-marble/30 bg-marble/10 flex items-center justify-center"><Target className="w-4 h-4 text-urgent" /></div>
        <span className="text-marble/50 text-[10px] uppercase">{g.category}</span>
      </div>
      <h3 className="text-storm text-sm font-medium mt-3">{g.title}</h3>
      <p className="text-marble/50 text-xs mt-0.5">Doel: {g.target}</p>
      <div className="mt-4">
        <div className="flex justify-between text-[10px] mb-1"><span className="text-marble/60">Voortgang</span><span className="text-storm tabular-nums">{g.progress}%</span></div>
        <div className="h-2.5 rounded-full bg-marble/10 overflow-hidden"><div className="h-full rounded-full bg-urgent" style={{ width: `${g.progress}%` }} /></div>
      </div>
      <div className="mt-4 pt-3 border-t border-marble/15 flex flex-wrap gap-1.5">{g.milestones.map(m => <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-marble/10 text-marble/70 border border-marble/20">{m}</span>)}</div>
    </div>
  );
}

function TimeTrio() {
  const total = TIME_ENTRIES.reduce((s, e) => s + e.hours, 0);
  const billable = TIME_ENTRIES.filter(e => e.billable).reduce((s, e) => s + e.hours, 0);
  return (
    <div className="grid grid-cols-3 gap-3">
      {[{ l: "Totaal", v: total, c: "text-marble/60" }, { l: "Factureerbaar", v: billable, c: "text-urgent" }, { l: "Intern", v: total - billable, c: "text-sky" }].map(x => (
        <div key={x.l} className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
          <div className={`flex items-center gap-2 ${x.c} text-xs`}><Clock className="w-3.5 h-3.5" /> {x.l}</div>
          <p className="text-storm text-2xl font-semibold mt-1">{x.v}<span className="text-sm text-marble/50">u</span></p>
        </div>
      ))}
    </div>
  );
}

function HoursBar() {
  const data = TIME_ENTRIES.map(e => ({ name: e.project, uren: e.hours }));
  const COLORS = ["#d5e24a", "#B1BEC6", "#94925D", "#868564", "#E0DED3", "#d5e24a"];
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(224,222,211,0.12)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#E0DED3", fontSize: 10 }} axisLine={{ stroke: "rgba(224,222,211,0.2)" }} tickLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
          <YAxis tick={{ fill: "#E0DED3", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "rgba(224,222,211,0.08)" }} contentStyle={CHART_TIP} />
          <Bar dataKey="uren" radius={[8, 8, 0, 0]}>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SpecList() {
  return (
    <div className="flex flex-col gap-2">
      {TIME_ENTRIES.map(e => (
        <div key={e.project} className="flex items-center justify-between text-sm">
          <span className="text-marble/80 truncate pr-2">{e.project}</span>
          <span className="text-storm tabular-nums shrink-0">{e.hours}u {e.billable && <span className="text-urgent text-[10px]">€</span>}</span>
        </div>
      ))}
    </div>
  );
}

function WeekGrid() {
  const start = new Date("2026-08-17");
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const iso = (d) => d.toISOString().slice(0, 10);
  const SHORT = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d, i) => {
        const items = TASKS.filter(t => t.date === iso(d));
        return (
          <div key={i} className="rounded-xl border border-marble/20 bg-marble/5 p-2 min-h-[120px] flex flex-col">
            <div className="flex items-center justify-between mb-1.5"><span className="text-marble/60 text-[9px]">{SHORT[i]}</span><span className="text-storm text-[10px] font-semibold">{d.getDate()}</span></div>
            <div className="flex flex-col gap-1">{items.slice(0, 3).map(t => <div key={t.id} className="rounded-md px-1.5 py-1 border-l-2" style={{ borderColor: CATEGORY_HEX[t.category] }}><p className="text-storm text-[8px] leading-tight truncate">{t.title}</p></div>)}</div>
          </div>
        );
      })}
    </div>
  );
}

function Timeline() {
  const map = {}; [...TASKS].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).forEach(t => { (map[t.date] = map[t.date] || []).push(t); });
  const grouped = Object.entries(map).slice(0, 3);
  return (
    <div className="relative">
      <div className="absolute left-[26px] top-2 bottom-2 w-px bg-marble/20" />
      <div className="flex flex-col gap-4">
        {grouped.map(([date, items]) => {
          const d = new Date(date);
          return (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <div className="z-10 w-[44px] h-[44px] rounded-2xl border border-marble/30 bg-metal/60 flex flex-col items-center justify-center shrink-0">
                  <span className="text-marble/50 text-[8px] uppercase leading-none">{d.toLocaleDateString("nl-NL", { month: "short" })}</span>
                  <span className="text-storm text-sm font-semibold leading-none mt-0.5">{d.getDate()}</span>
                </div>
                <p className="text-storm text-xs font-medium">{d.toLocaleDateString("nl-NL", { weekday: "long" })}</p>
              </div>
              <div className="ml-[56px] flex flex-col gap-1.5">
                {items.slice(0, 2).map(t => (
                  <div key={t.id} className="flex items-center gap-2 rounded-xl border border-marble/25 bg-marble/8 px-3 py-2">
                    <span className="text-marble/70 text-[10px] tabular-nums w-12 shrink-0">{t.time}</span>
                    <p className="text-storm text-xs font-medium truncate flex-1">{t.title}</p>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FocusRing() {
  const pct = 62;
  const r = 80, c = 2 * Math.PI * r;
  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(224,222,211,0.12)" strokeWidth="10" />
        <circle cx="90" cy="90" r={r} fill="none" stroke="#d5e24a" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-storm text-3xl font-bold tabular-nums">18:42</div>
    </div>
  );
}

function IdeaMasonry() {
  const TONES = ["bg-urgent/15 border-urgent/40 text-storm", "bg-sky/15 border-sky/40 text-storm", "bg-sand/15 border-sand/40 text-storm", "bg-marble/15 border-marble/40 text-storm"];
  return (
    <div className="columns-2 gap-3 [column-fill:_balance]">
      {IDEAS.slice(0, 5).map((it, i) => (
        <div key={it.id} className={`mb-3 break-inside-avoid rounded-xl border p-3 ${TONES[i % TONES.length]}`}><p className="text-xs leading-relaxed">{it.text}</p></div>
      ))}
    </div>
  );
}

function PriorityMatrix() {
  const QUADS = [
    { t: "Doen", sub: "Urgent · Belangrijk", tone: "text-urgent", border: "border-urgent/40", ids: [1, 2, 3] },
    { t: "Plannen", sub: "Niet urgent · Belangrijk", tone: "text-sky", border: "border-sky/40", ids: [7, 10, 12] },
    { t: "Delegeren", sub: "Urgent · Niet belangrijk", tone: "text-sand", border: "border-sand/40", ids: [4, 6, 9] },
    { t: "Laten", sub: "Geen van beide", tone: "text-marble/60", border: "border-marble/30", ids: [5, 8, 13] },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {QUADS.map(q => (
        <div key={q.t} className={`rounded-xl border ${q.border} bg-marble/5 p-3 min-h-[110px]`}>
          <p className={`text-xs font-semibold ${q.tone}`}>{q.t}</p>
          <p className="text-marble/40 text-[9px]">{q.sub}</p>
          <div className="mt-2 flex flex-col gap-1">{TASKS.filter(t => q.ids.includes(t.id)).slice(0, 2).map(t => <div key={t.id} className="rounded-md bg-marble/10 px-1.5 py-1 text-storm text-[10px] truncate">{t.title}</div>)}</div>
        </div>
      ))}
    </div>
  );
}

function StatusCounts() {
  const cols = [
    { l: "Lopend", c: "text-sky", dot: "bg-sky", n: PROJECTS.filter(p => p.status === "lopend").length },
    { l: "Gepland", c: "text-marble", dot: "bg-marble", n: PROJECTS.filter(p => p.status === "gepland").length },
    { l: "Voltooid", c: "text-urgent", dot: "bg-urgent", n: PROJECTS.filter(p => p.status === "voltooid").length },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cols.map(c => (
        <div key={c.l} className="rounded-2xl border border-marble/20 bg-marble/5 p-3 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
          <div><p className={`text-[10px] ${c.c}`}>{c.l}</p><p className="text-storm text-xl font-semibold leading-none mt-0.5">{c.n}</p></div>
        </div>
      ))}
    </div>
  );
}

function ProjectCard() {
  const p = PROJECTS[0];
  const dl = Math.ceil((new Date(p.deadline) - new Date("2026-08-13")) / 86400000);
  return (
    <div className="rounded-xl border border-marble/20 bg-marble/10 p-3">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0"><p className="text-storm text-sm font-medium truncate">{p.name}</p><p className="text-marble/50 text-xs truncate">{p.client}</p></div>
        {dl <= 7 && <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-urgent/20 text-urgent border border-urgent/40">⚠ {dl}d</span>}
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-[10px] mb-1"><span className="text-marble/60">Voortgang</span><span className="text-storm tabular-nums">{p.progress}%</span></div>
        <div className="h-1.5 rounded-full bg-marble/10 overflow-hidden"><div className="h-full rounded-full bg-urgent" style={{ width: `${p.progress}%` }} /></div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex -space-x-1.5">{p.team.map((t, i) => <div key={i} className="w-6 h-6 rounded-full bg-metal border border-marble/30 flex items-center justify-center text-[9px] text-marble">{t}</div>)}</div>
        <div className="text-right"><p className="text-marble/50 text-[9px]">Deadline</p><p className="text-storm text-[10px] tabular-nums">{p.deadline}</p></div>
      </div>
      <div className="mt-2 pt-2 border-t border-marble/15 flex items-center gap-1.5"><Flag className="w-3 h-3 text-marble/60" /><span className="text-marble/70 text-[10px] truncate">{p.nextMilestone}</span></div>
    </div>
  );
}

function TaskRows() {
  return (
    <div className="flex flex-col gap-2">
      {TASKS.slice(0, 4).map(t => (
        <div key={t.id} className="flex items-center gap-3 rounded-xl border border-marble/25 bg-marble/8 px-3 py-2.5">
          <div className="flex flex-col items-center w-10 shrink-0"><span className="text-marble/50 text-[9px] uppercase">{new Date(t.date).toLocaleDateString("nl-NL", { month: "short" })}</span><span className="text-storm text-base font-semibold leading-none">{new Date(t.date).getDate()}</span></div>
          <div className="w-px h-8 bg-marble/20" />
          <div className="flex-1 min-w-0"><p className="text-storm text-xs font-medium truncate">{t.title}</p><p className={`text-[10px] ${CATEGORY_COLORS[t.category]} mt-0.5`}>{t.category}</p></div>
          <StatusBadge status={t.status} />
        </div>
      ))}
    </div>
  );
}

function FilterToolbar() {
  const [f, setF] = useState("alle");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-marble/30 bg-marble/10 px-3 py-2"><Search className="w-3.5 h-3.5 text-marble/70" /><span className="text-marble/50 text-xs">Zoek taken...</span></div>
      {["alle", "gepland", "lopend", "voltooid"].map(x => <GlassButton key={x} active={f === x} onClick={() => setF(x)} className="px-3 py-1.5 text-storm text-xs capitalize">{x}</GlassButton>)}
    </div>
  );
}

function MiniCalendar() {
  const [view, setView] = useState({ year: 2026, month: 7 });
  const [sel, setSel] = useState(17);
  const first = new Date(view.year, view.month, 1).getDay();
  const dim = new Date(view.year, view.month + 1, 0).getDate();
  const cells = []; for (let i = 0; i < first; i++) cells.push(null); for (let d = 1; d <= dim; d++) cells.push(d);
  const WD = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  const M = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
  const prev = () => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const next = () => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  return (
    <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3 w-full max-w-[240px]">
      <div className="flex items-center justify-between mb-2"><button onClick={prev} className="text-marble/70"><ChevronLeft className="w-3.5 h-3.5" /></button><span className="text-storm text-xs font-medium">{M[view.month]} {view.year}</span><button onClick={next} className="text-marble/70"><ChevronRight className="w-3.5 h-3.5" /></button></div>
      <div className="grid grid-cols-7 gap-1 mb-1">{WD.map(d => <div key={d} className="text-center text-[8px] text-marble/50">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">{cells.map((d, i) => <button key={i} className={`aspect-square flex items-center justify-center text-[10px] rounded-full ${d === sel ? "bg-urgent text-metal font-semibold" : d ? "text-marble/80 hover:bg-marble/20" : ""}`} onClick={() => d && setSel(d)}>{d || ""}</button>)}</div>
    </div>
  );
}

function ProfileGrid() {
  const [on, setOn] = useState([true, true, true, false]);
  const icons = [Search, Mail, FileText, Calendar];
  const cols = ["text-clay", "text-sand", "text-sky", "text-marble"];
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-[240px]">
      {icons.map((Ic, i) => <GlassButton key={i} active={on[i]} onClick={() => setOn(p => p.map((v, j) => j === i ? !v : v))} className="aspect-square flex items-center justify-center"><Ic className={`w-4 h-4 ${cols[i]}`} /></GlassButton>)}
    </div>
  );
}

function ContextDrop() {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState("Project Marktanalyse");
  return (
    <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3 w-full max-w-[240px]">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between text-storm text-sm"><span className="font-medium truncate">{v}</span><ChevronDown className={`w-4 h-4 text-marble/70 transition-transform ${open ? "rotate-180" : ""}`} /></button>
      {open && <div className="mt-2 pt-2 border-t border-marble/20 space-y-1">{["Project", "Delays"].map(o => <button key={o} onClick={() => { setV(o); setOpen(false); }} className="w-full text-left text-marble/80 hover:text-storm text-sm py-1 px-2 rounded-lg hover:bg-marble/15">{o}</button>)}</div>}
    </div>
  );
}

function DayPlan() {
  const HOURS = [7, 8, 9, 10, 11, 12, 13];
  const PXMIN = 0.8;
  const iso = (d) => d.toISOString().slice(0, 10);
  const date = new Date("2026-08-14");
  const tasks = TASKS.filter(t => t.date === iso(date)).sort((a, b) => a.time.localeCompare(b.time));
  const topFor = (time) => { const [h, m] = time.split(":").map(Number); return (h - 7) * 60 * PXMIN + m * PXMIN; };
  return (
    <div className="relative w-full" style={{ height: HOURS.length * 60 * PXMIN }}>
      {HOURS.map((h, i) => <div key={h} className="absolute left-0 right-0 flex items-center" style={{ top: i * 60 * PXMIN }}><span className="w-10 text-marble/50 text-[9px] tabular-nums">{String(h).padStart(2, "0")}:00</span><div className="flex-1 h-px bg-marble/15" /></div>)}
      {tasks.map(t => <div key={t.id} className="absolute left-12 right-1 rounded-lg border border-marble/20 bg-marble/10 px-2 py-1 overflow-hidden flex gap-1.5" style={{ top: topFor(t.time), height: Math.max(t.duration * PXMIN, 22) }}><div className="w-1 rounded-full shrink-0" style={{ background: CATEGORY_HEX[t.category] }} /><div className="min-w-0"><p className="text-storm text-[10px] font-medium leading-tight truncate">{t.title}</p><p className="text-marble/50 text-[8px] tabular-nums">{t.time} · {t.duration}m</p></div></div>)}
    </div>
  );
}

function RingViz() { return <div className="flex justify-center"><AnimatedRing pct={68} size={160} stroke={12} color={URGENT_HEX} label="68" sub="CAPACITY" /></div>; }
function BarViz() { return <div className="space-y-2 w-full max-w-[260px]"><div className="flex justify-between text-[10px] text-marble/60"><span>Focus</span><span>72%</span></div><BarGrow value={72} color={URGENT_HEX} /><div className="flex justify-between text-[10px] text-marble/60"><span>Life</span><span>45%</span></div><BarGrow value={45} color={CATEGORY_HEX.Identiteit} delay={0.2} /></div>; }
function SparkViz() { return <LiveSparkline color={URGENT_HEX} height={56} />; }
function PulseViz() { return <PulseWave color={URGENT_HEX} bars={20} height={48} />; }
function CountViz() { return <div className="flex items-baseline gap-2"><span className="text-storm text-4xl font-bold tabular-nums"><CountUp to={128} /></span><span className="text-marble/50 text-xs">uren</span></div>; }

function BadgeRow() {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <StatusBadge status="voltooid" /><StatusBadge status="lopend" /><StatusBadge status="gepland" />
    </div>
  );
}

function Primitives() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2"><GlassButton className="px-3 py-1.5 text-storm text-xs">Default</GlassButton><GlassButton active className="px-3 py-1.5 text-storm text-xs">Active</GlassButton></div>
      <Divider />
      <SectionHeader number={1} title="Section header sample" />
    </div>
  );
}

const SECTIONS = [
  { title: "STATS & NUMBERS", items: [
    { n: "01", name: "Stat Card", C: StatCardViz },
    { n: "02", name: "Status Counts Row", C: StatusCounts },
    { n: "03", name: "Time Totals Trio", C: TimeTrio },
    { n: "04", name: "CountUp Number", C: CountViz },
  ]},
  { title: "CHARTS", items: [
    { n: "05", name: "Category Bar Chart", C: CategoryBar },
    { n: "06", name: "Status Donut", C: StatusDonut },
    { n: "07", name: "Hours Bar Chart", C: HoursBar },
    { n: "08", name: "Specification List", C: SpecList },
    { n: "09", name: "Live Sparkline", C: SparkViz },
    { n: "10", name: "Pulse Wave", C: PulseViz },
  ]},
  { title: "RINGS & BARS", items: [
    { n: "11", name: "Animated Ring", C: RingViz },
    { n: "12", name: "Focus Ring Timer", C: FocusRing },
    { n: "13", name: "Bar Grow", C: BarViz },
  ]},
  { title: "GOALS & PROJECTS", items: [
    { n: "14", name: "Goal Progress Card", C: GoalCard },
    { n: "15", name: "Project Card", C: ProjectCard },
    { n: "16", name: "Priority Matrix", C: PriorityMatrix },
  ]},
  { title: "PLANNING & TIME", items: [
    { n: "17", name: "Week Grid", C: WeekGrid },
    { n: "18", name: "Day Plan Timeline", C: DayPlan },
    { n: "19", name: "Timeline (Chronological)", C: Timeline },
    { n: "20", name: "Mini Calendar", C: MiniCalendar },
  ]},
  { title: "LISTS & UI", items: [
    { n: "21", name: "Task Rows", C: TaskRows },
    { n: "22", name: "Filter Toolbar", C: FilterToolbar },
    { n: "23", name: "Task Profile Grid", C: ProfileGrid },
    { n: "24", name: "Context Dropdown", C: ContextDrop },
    { n: "25", name: "Idea Masonry", C: IdeaMasonry },
    { n: "26", name: "Status Badges", C: BadgeRow },
    { n: "27", name: "Glass Primitives", C: Primitives },
  ]},
];

export default function GraphGallery2() {
  return (
    <div className="min-h-screen bg-metal px-5 lg:px-10 py-8 pb-24">
      <div className="mb-8">
        <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-marble/60 hover:text-storm transition-colors">← Terug naar OS</Link>
        <h1 className="text-storm text-3xl font-display font-semibold tracking-tight mt-1.5">Graph Gallery 2 · /glass</h1>
        <p className="text-marble/60 text-sm mt-1">Alle visuele elementen & grafieken uit de /glass-pagina's — genummerd & benoemd.</p>
      </div>
      {SECTIONS.map((sec, si) => (
        <section key={si} className="mb-10">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-display font-semibold tabular-nums leading-none" style={{ color: URGENT_HEX }}>{String(si + 1).padStart(2, "0")}</span>
            <h2 className="text-lg font-display font-semibold tracking-tight text-storm">{sec.title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sec.items.map(({ n, name, C }) => (
              <Item key={n} n={n} name={name}><C /></Item>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}