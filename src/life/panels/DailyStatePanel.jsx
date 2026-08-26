import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { stateLabel, fmtAgo } from "@/lib/selfUtils";
import { BLUE, SAND, moodScore } from "@/glass/components/self/palette";
import { ConcentricRings, LiveAreaChart, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/life/components/SelfViz";
import CheckInFlow from "@/life/components/CheckInFlow";
import { WINDOWS, WINDOW_ORDER, currentWindowKey, isCompletedForWindow } from "@/life/components/checkInConfig";

const PISTACHIO = "#d8dab3";
const URGENT = "hsl(var(--giulia-urgent))";

/** Premium Daily-State preview — rijke grafische weergave van de
 *  check-in data: CountUp-sparklines, concentrische E/C/M-ringen, live
 *  area-chart, dagcurve (3 momenten), herinnering, context. Live elementen:
 *  PulseDot, animated cards, knipperende open-check-in. */
export default function DailyStatePanel() {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const load = async () => {
    try { const list = await base44.entities.SelfCheckIn.list("-timestamp", 30).catch(() => []); setCheckIns(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const win = currentWindowKey();
  const latest = checkIns[0];
  const todayStr = new Date().toDateString();
  const todays = useMemo(() => (checkIns || []).filter((c) => c.timestamp && new Date(c.timestamp).toDateString() === todayStr), [checkIns, todayStr]);
  const byWin = useMemo(() => { const m = {}; WINDOW_ORDER.forEach((k) => { m[k] = todays.find((c) => c.window === k); }); return m; }, [todays]);
  const latestMemory = useMemo(() => (checkIns || []).find((c) => c.memory && c.memory.trim()), [checkIns]);

  const energy = latest?.energy ?? 0;
  const capacity = latest?.capacity ?? 0;
  const mood = moodScore(latest?.mood);
  const stateText = latest ? stateLabel(latest.state).toUpperCase() : "CHECK IN";
  const needs = latest?.needs || [];

  const chartData = checkIns.slice(0, 10).reverse().map((c, i) => ({ label: `${i + 1}`, energy: c.energy ?? 0, capacity: c.capacity ?? 0, mood: moodScore(c.mood) }));
  const spark = (key) => checkIns.slice(0, 7).reverse().map((c, i) => ({ label: `${i}`, value: key === "mood" ? moodScore(c.mood) : c[key] ?? 0 }));

  const saveCheckIn = async (entity) => {
    try { await base44.entities.SelfCheckIn.create(entity); setShowCheckIn(false); await load(); } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Incheck · How I'm Doing?</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{stateText}</h2>
            {latest && <PulseDot color={capacity < 30 ? URGENT : PISTACHIO} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{latest ? `Laatste check-in ${fmtAgo(latest.timestamp)}` : "Nog geen check-in vandaag."}</p>
        </div>
        <OpenLink to="/life/daily-state" label="Open Daily State" />
      </div>

      {/* Big numbers + sparklines */}
      <div className="grid grid-cols-3 divide-x divide-ivory/10 border-y border-ivory/10">
        {[
          { v: energy, l: "ENERGY", c: BLUE, data: spark("energy") },
          { v: capacity, l: "CAPACITY", c: SAND, data: spark("capacity") },
          { v: mood, l: "MOOD", c: PISTACHIO, data: spark("mood") },
        ].map((x) => (
          <motion.div key={x.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-5 px-4">
            <p className="text-ivory text-5xl font-bold tabular-nums leading-none"><CountUp value={x.v} /></p>
            <p className="text-[10px] tracking-[0.25em] mt-3" style={{ color: x.c }}>{x.l}</p>
            <LiveAreaChart data={x.data} dataKey="value" height={50} color={x.c} gradientId={`hd-${x.l}`} />
          </motion.div>
        ))}
      </div>

      {/* Concentric rings + area chart */}
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <ConcentricRings size={140} arcs={[{ pct: energy, c: BLUE }, { pct: capacity, c: SAND }, { pct: mood, c: "rgba(216,218,179,0.7)" }]}>
            <span className="text-ivory text-sm font-bold block">{stateText}</span>
            <span className="text-ivory/40 text-[8px] tracking-wider">E · C · M</span>
          </ConcentricRings>
          <div className="flex gap-3 mt-2">
            {[{ c: BLUE, l: "E" }, { c: SAND, l: "C" }, { c: PISTACHIO, l: "M" }].map((a) => (
              <span key={a.l} className="flex items-center gap-1.5 text-[9px] tracking-wider"><span className="w-2 h-2 rounded-full" style={{ background: a.c }} />{a.l}</span>
            ))}
          </div>
        </div>
        <div className="flex-1 w-full">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Energy · Capacity · Mood trend</p>
          <LiveAreaChart data={chartData} dataKey="energy" height={180} color={BLUE} gradientId="hdMain" />
        </div>
      </div>

      {/* Dagcurve — 3 momenten vandaag */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.24em] text-ivory/45 font-semibold mb-2.5">Dagcurve · {new Date().toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}</p>
        <div className="grid grid-cols-3 gap-2.5">
          {WINDOW_ORDER.map((k) => {
            const ci = byWin[k];
            const w = WINDOWS[k];
            const done = !!ci;
            const isNow = win === k;
            const accent = done ? PISTACHIO : isNow ? URGENT : "rgba(255,255,255,0.18)";
            const keyField = k === "orient" ? ci?.need : k === "check" ? ci?.trigger?.join(" · ") : ci?.memory;
            const energyLine = ci?.energy != null ? `${ci.energy}%` : ci?.energy_trajectory || ci?.capacity_trajectory || "—";
            return (
              <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-3 flex flex-col gap-1.5 relative overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${done ? "rgba(216,218,179,0.35)" : isNow ? URGENT : "rgba(255,255,255,0.10)"}`, boxShadow: isNow && !done ? `0 0 18px ${URGENT}66` : "none" }}>
                {isNow && !done && <motion.span className="absolute inset-0 rounded-2xl pointer-events-none" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ boxShadow: `inset 0 0 0 1px ${URGENT}` }} />}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.18em]" style={{ color: accent }}>{w.label}</span>
                  <span className="text-[9px] tracking-wider text-ivory/45">{w.time}</span>
                </div>
                {done ? (
                  <>
                    <p className="text-[15px] font-display font-semibold leading-tight text-ivory">{ci.mood || stateLabel(ci.state)}</p>
                    <p className="text-[10px] text-ivory/55">{energyLine}{ci.direction ? ` · ${ci.direction}` : ""}</p>
                    {keyField && <p className="text-[10.5px] text-ivory/70 leading-snug line-clamp-2 italic">“{keyField}”</p>}
                  </>
                ) : (
                  <p className="text-[12px] font-semibold leading-tight" style={{ color: isNow ? URGENT : "rgba(255,255,255,0.4)" }}>{isNow ? "OPEN — vul in" : "gepland"}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Laatste herinnering */}
      {latestMemory && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-2 rounded-2xl p-4 border-l-2" style={{ borderColor: PISTACHIO }}>
          <p className="text-[9px] uppercase tracking-[0.24em] text-ivory/45 font-semibold mb-1.5">Wat GIULIA onthoudt</p>
          <p className="text-[15px] font-medium italic leading-snug">“{latestMemory.memory}”</p>
          <p className="text-[10px] text-ivory/40 mt-1.5">{fmtAgo(latestMemory.timestamp)}</p>
        </motion.div>
      )}

      {/* Need + context */}
      {needs.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-2 rounded-2xl p-4 border-l-2" style={{ borderColor: SAND }}>
          <p className="text-[9px] uppercase tracking-[0.24em] text-ivory/45 font-semibold mb-1.5">Belangrijkste behoefte</p>
          <p className="text-sm font-medium">{needs[0]}</p>
        </motion.div>
      )}

      <ContextGrid items={[
        { label: "LAATSTE CHECK-IN", text: latest ? `${stateLabel(latest.state)} · ${latest.energy ?? "—"}% energie · ${latest.capacity ?? "—"}% capaciteit` : "Nog geen check-in vandaag." },
        { label: "WHAT MATTERS NOW", text: capacity < 30 ? "Capaciteit is laag — plan geen zware taken." : energy < 25 ? "Energie is laag — bescherm je focus." : "Stabiele state — geen scherpe verschuivingen." },
        { label: "NOW", text: latest?.memory || latest?.reflection || "Geen reflectie vastgelegd bij laatste check-in." },
      ]} />

      <ActionRow actions={[
        { label: "Nu inchecken", primary: true, onClick: () => setShowCheckIn((v) => !v) },
        { label: "Open Daily State", to: "/life/daily-state" },
      ]} />

      <AnimatePresence>
        {showCheckIn && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl glass-card-2 p-4">
              <CheckInFlow window={win} theme="dark" onSave={saveCheckIn} onDone={() => setShowCheckIn(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}