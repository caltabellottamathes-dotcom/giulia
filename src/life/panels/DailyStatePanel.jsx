import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { SectionLabel } from "@/system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { stateLabel, moodLabel, fmtAgo } from "@/lib/selfUtils";
import { BLUE, SAND, TRACK, moodScore } from "@/glass/components/self/palette";
import { AnimatedRing, ConcentricRings, LiveAreaChart, ContextGrid, ActionRow, OpenLink, PulseDot } from "@/life/components/SelfViz";
import { Plus, Sparkles } from "lucide-react";
import CheckInFlow from "@/life/components/CheckInFlow";
import { currentWindowKey } from "@/life/components/checkInConfig";

export default function DailyStatePanel() {
  const navigate = useNavigate();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const load = async () => {
    try { const list = await base44.entities.SelfCheckIn.list("-timestamp", 20).catch(() => []); setCheckIns(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const latest = checkIns[0];
  const needs = useMemo(() => latest?.needs || [], [latest]);

  const saveCheckIn = async (entity) => {
    try {
      await base44.entities.SelfCheckIn.create(entity);
      setShowCheckIn(false); await load();
    } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const energy = latest?.energy ?? 0;
  const capacity = latest?.capacity ?? 0;
  const mood = moodScore(latest?.mood);
  const stateText = latest ? stateLabel(latest.state).toUpperCase() : "CHECK IN";

  const chartData = checkIns.slice(0, 10).reverse().map((c, i) => ({
    label: `${i + 1}`, energy: c.energy ?? 0, capacity: c.capacity ?? 0, mood: moodScore(c.mood),
  }));
  const sparkData = (key) => checkIns.slice(0, 7).reverse().map((c, i) => ({ label: `${i}`, value: key === "mood" ? moodScore(c.mood) : c[key] ?? 0 }));

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Daily State</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{stateText}</h2>
            {latest && <PulseDot color={capacity < 30 ? SAND : BLUE} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{latest ? `Last check-in ${fmtAgo(latest.timestamp)}` : "Nog geen check-in vandaag."}</p>
        </div>
        <OpenLink to="/life/daily-state" label="Open Daily State" />
      </div>

      {/* 3-column big numbers with sparklines */}
      <div className="grid grid-cols-3 divide-x divide-ivory/10 border-y border-ivory/10">
        {[
          { v: energy, l: "ENERGY", c: BLUE, data: sparkData("energy") },
          { v: capacity, l: "CAPACITY", c: SAND, data: sparkData("capacity") },
          { v: mood, l: "MOOD", c: SAND, data: sparkData("mood") },
        ].map((x) => (
          <motion.div key={x.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-5 px-4">
            <p className="text-ivory text-5xl font-bold tabular-nums leading-none"><CountUp value={x.v} /></p>
            <p className="text-[10px] tracking-[0.25em] mt-3" style={{ color: x.c }}>{x.l}</p>
            <LiveAreaChart data={x.data} dataKey="value" height={50} color={x.c} gradientId={`ds-${x.l}`} />
          </motion.div>
        ))}
      </div>

      {/* Concentric rings + area chart */}
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <ConcentricRings size={140} arcs={[
            { pct: energy, c: BLUE },
            { pct: capacity, c: SAND },
            { pct: mood, c: "rgba(216,218,179,0.6)" },
          ]}>
            <span className="text-ivory text-sm font-bold block">{stateText}</span>
            <span className="text-ivory/40 text-[8px] tracking-wider">STATE FIELD</span>
          </ConcentricRings>
          <div className="flex gap-3 mt-2">
            {[
              { c: BLUE, l: "E" }, { c: SAND, l: "C" }, { c: "rgba(216,218,179,0.6)", l: "M" },
            ].map((a) => (
              <span key={a.l} className="flex items-center gap-1.5 text-[9px] tracking-wider">
                <span className="w-2 h-2 rounded-full" style={{ background: a.c }} />{a.l}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 w-full">
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Energy · Capacity · Mood trend</p>
          <LiveAreaChart data={chartData} dataKey="energy" height={180} color={BLUE} gradientId="dsMain" />
        </div>
      </div>

      {/* Current need */}
      {needs.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-2 rounded-2xl p-4 border-l-2" style={{ borderColor: SAND }}>
          <p className="text-[9px] uppercase tracking-[0.24em] text-ivory/45 font-semibold mb-1.5">Belangrijkste behoefte</p>
          <p className="text-sm font-medium">{needs[0]}</p>
          {needs[1] && <p className="text-[11px] text-ivory/45 mt-0.5">+{needs.length - 1} meer</p>}
        </motion.div>
      )}

      {/* Context section — from glass */}
      <ContextGrid items={[
        { label: "LAATSTE CHECK-IN", text: latest ? `${stateLabel(latest.state)} · ${latest.energy ?? "—"}% energie · ${latest.capacity ?? "—"}% capaciteit` : "Nog geen check-in vandaag." },
        { label: "WHAT MATTERS NOW", text: capacity < 30 ? "Capaciteit is laag — plan geen zware taken." : energy < 25 ? "Energie is laag — bescherm je focus." : "Stabiele state — geen scherpe verschuivingen." },
        { label: "NOW", text: latest?.reflection || "Geen reflectie vastgelegd bij laatste check-in." },
      ]} />

      {/* Actions — from glass */}
      <ActionRow actions={[
        { label: "Check In", primary: true, onClick: () => setShowCheckIn((v) => !v) },
        { label: "Open Daily State", to: "/self/daily-state" },
      ]} />

      {/* INCHECK — How I'm Doing? */}
      <AnimatePresence>
        {showCheckIn && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl glass-card-2 p-4">
              <CheckInFlow window={currentWindowKey() || "orient"} theme="dark" onSave={saveCheckIn} onDone={() => setShowCheckIn(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}