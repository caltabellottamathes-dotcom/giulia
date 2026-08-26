import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { stateLabel, fmtAgo } from "@/lib/selfUtils";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { LiveAreaChart, OpenLink, ActionRow, PulseDot } from "@/life/components/SelfViz";
import CheckInFlow from "@/life/components/CheckInFlow";
import { WINDOWS, WINDOW_ORDER, currentWindowKey, isCompletedForWindow } from "@/life/components/checkInConfig";

const PISTACHIO = "#d8dab3";
const URGENT = "hsl(var(--giulia-urgent))";

/** Dagcurve — vandaag 3 momenten + hun data. */
function MomentCard({ k, ci, isNow }) {
  const w = WINDOWS[k];
  const done = !!ci;
  const accent = done ? PISTACHIO : isNow ? URGENT : "rgba(255,255,255,0.18)";
  const keyField = k === "orient" ? ci?.need : k === "check" ? (ci?.trigger?.join(" · ")) : ci?.memory;
  const energyLine = ci?.energy != null ? `${ci.energy}%` : ci?.energy_trajectory || ci?.capacity_trajectory || "—";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-3 flex flex-col gap-1.5" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${done ? "rgba(216,218,179,0.35)" : isNow ? URGENT : "rgba(255,255,255,0.10)"}`, boxShadow: isNow && !done ? `0 0 18px ${URGENT}66` : "none" }}>
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
        <p className="text-[12px] font-semibold leading-tight" style={{ color: isNow ? URGENT : "rgba(255,255,255,0.4)" }}>
          {isNow ? "OPEN — vul in" : "gepland"}
        </p>
      )}
    </motion.div>
  );
}

export default function DailyStatePanel() {
  const navigate = useNavigate();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const load = async () => {
    try { const list = await base44.entities.SelfCheckIn.list("-timestamp", 30).catch(() => []); setCheckIns(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const win = currentWindowKey();
  const todayStr = new Date().toDateString();
  const todays = useMemo(() => (checkIns || []).filter((c) => c.timestamp && new Date(c.timestamp).toDateString() === todayStr), [checkIns, todayStr]);
  const byWin = useMemo(() => {
    const m = {}; WINDOW_ORDER.forEach((k) => { m[k] = todays.find((c) => c.window === k); }); return m;
  }, [todays]);

  const latest = checkIns[0];
  const latestMemory = useMemo(() => {
    return (checkIns || []).find((c) => c.memory && c.memory.trim());
  }, [checkIns]);

  const spark = (checkIns || []).slice(0, 14).reverse().map((c, i) => ({ label: `${i}`, value: c.energy ?? (c.mood ? 50 : 0) }));

  const saveCheckIn = async (entity) => {
    try { await base44.entities.SelfCheckIn.create(entity); setShowCheckIn(false); await load(); } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const stateText = latest ? stateLabel(latest.state).toUpperCase() : "CHECK IN";

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Incheck · How I'm Doing?</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{stateText}</h2>
            {latest && <PulseDot color={(latest.energy ?? 50) < 30 ? URGENT : PISTACHIO} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{latest ? `Laatste check-in ${fmtAgo(latest.timestamp)}` : "Nog geen check-in vandaag."}</p>
        </div>
        <OpenLink to="/life/daily-state" label="Open Daily State" />
      </div>

      {/* Dagcurve — 3 momenten vandaag */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.24em] text-ivory/45 font-semibold mb-2.5">Dagcurve · {new Date().toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}</p>
        <div className="grid grid-cols-3 gap-2.5">
          {WINDOW_ORDER.map((k) => <MomentCard key={k} k={k} ci={byWin[k]} isNow={win === k} />)}
        </div>
      </div>

      {/* Energie trend */}
      <div className="glass-card-2 rounded-2xl p-4">
        <p className="text-[9px] uppercase tracking-[0.22em] text-ivory/45 font-semibold mb-2">Energie trend</p>
        <LiveAreaChart data={spark} dataKey="value" height={70} color={BLUE} gradientId="hd-energy" />
      </div>

      {/* Laatste herinnering */}
      {latestMemory && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-2 rounded-2xl p-4 border-l-2" style={{ borderColor: PISTACHIO }}>
          <p className="text-[9px] uppercase tracking-[0.24em] text-ivory/45 font-semibold mb-1.5">Wat GIULIA onthoudt</p>
          <p className="text-[15px] font-medium italic leading-snug">“{latestMemory.memory}”</p>
          <p className="text-[10px] text-ivory/40 mt-1.5">{fmtAgo(latestMemory.timestamp)}</p>
        </motion.div>
      )}

      {/* Acties */}
      <ActionRow actions={[
        { label: "Nu inchecken", primary: true, onClick: () => setShowCheckIn((v) => !v) },
        { label: "Open Daily State", to: "/life/daily-state" },
      ]} />

      {/* INCHECK flow */}
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