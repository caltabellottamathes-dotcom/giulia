import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTimeTracker, formatDuration, formatMinutes } from "@/lib/useTimeTracker";
import { Play, Pause, Square } from "lucide-react";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

export default function TimeTrackerPreview({ onOpen }) {
  const navigate = useNavigate();
  const tt = useTimeTracker();
  const pct = Math.min(100, (tt.elapsed / (25 * 60)) * 100);
  const r = 120, c = 2 * Math.PI * r;
  const task = (tt.tasks || []).find((t) => t.id === tt.taskId);
  const recent = (tt.entries || []).slice(0, 5);

  // Recent entries chart
  const chartData = useMemo(() => recent.slice(0, 7).map((e, i) => ({ label: `S${i + 1}`, value: Math.round((e.duration_minutes || 0)) })), [recent]);

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Time Tracker</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{formatMinutes(tt.todayMin)}</h2>
            {tt.running && <PulseDot color={FOCUS.light} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{tt.running ? "Timer loopt" : tt.paused ? "Gepauzeerd" : "Klaar om te starten"}</p>
        </div>
        <OpenLink to="/timetracker" label="Open Tijd" color={FOCUS.light} />
      </div>

      {/* Timer ring */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-8 rounded-full" style={{ background: `${FOCUS.light}10`, filter: "blur(24px)" }} />
          <div className="relative" style={{ width: 240, height: 240 }}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
              <circle cx="140" cy="140" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <motion.circle cx="140" cy="140" r={r} fill="none" stroke={FOCUS.light} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c - (pct / 100) * c }} transition={{ duration: 1, ease: "linear" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-ivory text-5xl font-display font-semibold tabular-nums">{formatDuration(tt.elapsed)}</span>
              <span className="text-[11px] tracking-[0.3em] mt-3" style={{ color: FOCUS.light }}>{task?.title?.toUpperCase().slice(0, 20) || "KIES EEN TAAK"}</span>
            </div>
          </div>
        </div>

        {/* Task selector */}
        <div className="mt-6 w-full max-w-[260px]">
          <select value={tt.taskId} onChange={(e) => tt.setTaskId(e.target.value)} disabled={tt.running || tt.paused} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-ivory outline-none disabled:opacity-60">
            <option value="">Kies een taak…</option>
            {(tt.tasks || []).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-5">
          {!tt.running && !tt.paused && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={tt.start} disabled={!tt.taskId} className="px-6 py-3 rounded-full text-charcoal text-sm font-semibold flex items-center gap-2 disabled:opacity-50 transition" style={{ background: FOCUS.light }}><Play className="w-4 h-4" /> Start</motion.button>
          )}
          {tt.running && (<motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={tt.pause} className="px-6 py-3 rounded-full glass-button text-ivory text-sm font-semibold flex items-center gap-2"><Pause className="w-4 h-4" /> Pauze</motion.button>)}
          {tt.paused && (<motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={tt.resume} className="px-6 py-3 rounded-full text-charcoal text-sm font-semibold flex items-center gap-2" style={{ background: FOCUS.light }}><Play className="w-4 h-4" /> Hervat</motion.button>)}
          {(tt.running || tt.paused) && (<motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={tt.stop} className="px-5 py-3 rounded-full glass-button text-ivory text-sm font-semibold flex items-center gap-2"><Square className="w-4 h-4" /> Stop</motion.button>)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4"><p className="text-ivory/55 text-xs">Vandaag</p><p className="text-ivory text-2xl font-display font-semibold mt-1"><CountUp value={Math.round(tt.todayMin / 60)} />u {tt.todayMin % 60}m</p></div>
        <div className="rounded-2xl border border-white/15 bg-white/[0.05] p-4"><p className="text-ivory/55 text-xs">Deze week</p><p className="text-ivory text-2xl font-display font-semibold mt-1"><CountUp value={Math.round(tt.weekMin / 60)} />u {tt.weekMin % 60}m</p></div>
      </div>

      {/* Recent chart */}
      {chartData.length > 0 && (
        <div className="glass-card-2 rounded-2xl p-5">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Recente registraties · minuten</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${FOCUS.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                {chartData.map((d, i) => <Cell key={i} fill={i === 0 ? FOCUS.light : FOCUS.mid} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent entries */}
      <SectionLabel>Recente registraties</SectionLabel>
      {recent.length ? (
        <div className="flex flex-col gap-2">
          {recent.map((e, i) => (
            <motion.div key={e.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5">
              <div className="min-w-0"><p className="text-ivory text-sm font-medium truncate">{e.task_title || "Taak"}</p><p className="text-ivory/50 text-xs">{new Date(e.end_time || e.start_time).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</p></div>
              <span className="text-ivory font-display font-semibold tabular-nums text-sm">{formatMinutes(e.duration_minutes || 0)}</span>
            </motion.div>
          ))}
        </div>
      ) : <Empty text="Nog geen tijd gelogd — start de timer" />}

      <ContextGrid items={[
        { label: "VANDAAG", text: `${formatMinutes(tt.todayMin)} tijd geregistreerd vandaag.` },
        { label: "DEZE WEEK", text: `${formatMinutes(tt.weekMin)} totaal deze week.` },
        { label: "NU", text: tt.running ? `Timer loopt voor: ${task?.title || "taak"}` : "Geen actieve timer." },
      ]} />
      <ActionRow actions={[
        { label: "Open Tijd-Tracker", primary: true, color: FOCUS.light, to: "/timetracker" },
      ]} />
    </div>
  );
}