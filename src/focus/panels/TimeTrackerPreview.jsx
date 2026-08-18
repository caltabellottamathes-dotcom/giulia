import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import PreviewShell from "@/system/panels/PreviewShell";
import { BarGrow } from "@/glass/components/modules/viz";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";

const MID = "#94925d", LIGHT = "#d8dab3", URG = "#d5e24a";
const WEEK = [{ d: "Ma", v: 6.5 }, { d: "Di", v: 8 }, { d: "Wo", v: 5 }, { d: "Do", v: 7.5 }, { d: "Vr", v: 4 }, { d: "Za", v: 1 }, { d: "Zo", v: 0 }];

export default function TimeTrackerPreview({ onOpen }) {
  const tt = useTimeTracker();
  const [running, setRunning] = useState(false);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor(s % 3600 / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const todayH = (tt.todayMin / 60).toFixed(1);
  const PROJ = (tt.tasks || []).slice(0, 4).map((t, i) => ({ n: t.title?.slice(0, 20) || "Taak", v: ((tt.entries || []).filter(e => e.task_id === t.id).reduce((s, e) => s + (e.duration_minutes || 0), 0)) / 60, c: [MID, LIGHT, "#6b6a4a", URG][i % 4] }));
  const LOGS = (tt.entries || []).slice(0, 6).map(e => ({ id: e.id, text: `${e.task_title || "Taak"} — ${formatMinutes(e.duration_minutes || 0)}`, time: e.end_time ? new Date(e.end_time).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—" }));

  return (
    <PreviewShell index="11" section="TIME TRACKER" statement={running ? "LOPEND" : "GEPAUZEERD"} kicker={fmt(secs)} accent={URG}
      context={[
        { label: "VANDAAG", text: `${todayH} uur gelogd vandaag.` },
        { label: "WEEK", text: `${(tt.weekMin / 60).toFixed(1)} uur deze week.` },
        { label: "NU", text: running ? "Timer loopt." : "Timer gepauzeerd." },
      ]}
      actions={[{ label: running ? "Pause" : "Start", primary: true, onClick: () => setRunning(r => !r) }, { label: "Log", to: "/timetracker" }, { label: "Reset", onClick: () => setSecs(0) }, { label: "Open Tijd", to: "/timetracker" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 h-full overflow-hidden">
        <div className="flex flex-col gap-5 overflow-auto pr-1">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-marble/20 bg-marble/5 py-6">
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">NU AAN HET TRACKEN</p>
            <p className={`text-storm text-4xl font-bold tabular-nums ${running ? "text-urgent" : ""}`}>{fmt(secs)}</p>
            <button onClick={() => setRunning(r => !r)} className={`mt-4 px-6 py-2.5 rounded-full text-xs font-semibold tracking-[0.15em] uppercase transition-all active:scale-95 ${running ? "bg-urgent text-plum" : "bg-sand text-storm"}`}>{running ? "Pause" : "Start"}</button>
          </div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
            <p className="text-storm/50 text-[10px] tracking-[0.25em]">VANDAAG TOTAAL</p>
            <p className="text-storm text-3xl font-bold mt-1 tabular-nums">{todayH}h</p>
          </div>
          <div>
            <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">PER PROJECT</p>
            {PROJ.length ? PROJ.map((p, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5"><span className="text-storm/70 truncate">{p.n}</span><span className="text-storm tabular-nums">{p.v.toFixed(1)}h</span></div>
                <BarGrow value={p.v} max={5} color={p.c} delay={i * 0.1} />
              </div>
            )) : <p className="text-storm/40 text-xs">Nog geen tijd gelogd.</p>}
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">DEZE WEEK · UREN PER DAG</p>
          <div className="h-32 rounded-2xl border border-marble/20 bg-marble/5 p-3 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEK}>
                <XAxis dataKey="d" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1100}>
                  {WEEK.map((w, i) => <Cell key={i} fill={i === 1 ? URG : MID} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-3">RECENTE LOGS</p>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {LOGS.length ? LOGS.map(l => (
              <div key={l.id} className="flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 px-4 py-2.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: MID }} />
                <p className="text-sm text-storm flex-1 truncate">{l.text}</p>
                <span className="text-[10px] text-storm/40 tabular-nums shrink-0">{l.time}</span>
              </div>
            )) : <p className="text-storm/40 text-sm">Nog geen logs.</p>}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}