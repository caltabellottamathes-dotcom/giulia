import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, ActionBtn } from "@/system/panels/previewParts";
import { stateLabel, moodLabel, fmtAgo } from "@/lib/selfUtils";
import { BLUE, SAND, TRACK, moodScore } from "@/glass/components/self/palette";
import { Plus, ArrowUpRight, Activity as ActivityIcon, Battery, Heart, Sparkles } from "lucide-react";

const circ = (r) => 2 * Math.PI * r;

function sparklinePts(values, max = 100) {
  if (!values.length) return "0,30 100,30";
  const w = 100, h = 50;
  const step = w / (values.length - 1 || 1);
  return values.map((v, i) => `${(i * step).toFixed(1)},${(h - (Math.min(v, max) / max) * h).toFixed(1)}`).join(" ");
}

export default function DailyStatePanel() {
  const navigate = useNavigate();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [form, setForm] = useState({ state: "neutral", energy: 50, capacity: 50, mood: "neutral", need: "", reflection: "" });

  const load = async () => {
    try {
      const list = await base44.entities.SelfCheckIn.list("-timestamp", 20).catch(() => []);
      setCheckIns(list || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const latest = checkIns[0];
  const needs = useMemo(() => latest?.needs || [], [latest]);

  const saveCheckIn = async () => {
    try {
      await base44.entities.SelfCheckIn.create({
        state: form.state, energy: Number(form.energy), capacity: Number(form.capacity),
        mood: form.mood, needs: form.need ? [form.need] : [], reflection: form.reflection || undefined,
        timestamp: new Date().toISOString(), source: "manual", check_in_type: "manual",
      });
      setForm({ state: "neutral", energy: 50, capacity: 50, mood: "neutral", need: "", reflection: "" });
      setShowCheckIn(false); await load();
    } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  const energy = latest?.energy ?? 0;
  const capacity = latest?.capacity ?? 0;
  const mood = moodScore(latest?.mood);
  const stateText = latest ? stateLabel(latest.state).toUpperCase() : "CHECK IN";

  const VALUES = [
    { v: energy, l: "ENERGY", c: BLUE, pts: sparklinePts(checkIns.slice(0, 7).reverse().map((c) => c.energy ?? 0)) },
    { v: capacity, l: "CAPACITY", c: SAND, pts: sparklinePts(checkIns.slice(0, 7).reverse().map((c) => c.capacity ?? 0)) },
    { v: mood, l: "MOOD", c: SAND, pts: sparklinePts(checkIns.slice(0, 7).reverse().map((c) => moodScore(c.mood))) },
  ];
  const ARCS = [
    { pct: energy, r: 38, c: BLUE, label: "E" },
    { pct: capacity, r: 28, c: SAND, label: "C" },
    { pct: mood, r: 18, c: SAND, label: "M" },
  ];
  const eHist = checkIns.slice(0, 7).reverse().map((c) => c.energy ?? 0);

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Daily State</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{stateText}</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{latest ? `Last check-in ${fmtAgo(latest.timestamp)}` : "Nog geen check-in vandaag."}</p>
        <button onClick={() => navigate("/self/daily-state")} className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: BLUE }}>
          Open Daily State <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3-column sparkline numbers */}
      <div className="grid grid-cols-3 divide-x divide-ivory/10 border-y border-ivory/10">
        {VALUES.map((x) => (
          <div key={x.l} className="py-4 px-3">
            <p className="text-ivory text-3xl font-bold tabular-nums leading-none">{x.v}</p>
            <p className="text-[9px] tracking-[0.2em] mt-2" style={{ color: x.c }}>{x.l}</p>
            <svg viewBox="0 0 100 50" className="w-full h-7 mt-2" preserveAspectRatio="none">
              <polyline points={x.pts} fill="none" stroke={x.c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
      </div>

      {/* Concentric rings + area chart */}
      <div className="flex flex-col sm:flex-row gap-5 items-center">
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {ARCS.map((a) => (
              <g key={a.label}>
                <circle cx="50" cy="50" r={a.r} fill="none" stroke={TRACK} strokeWidth="4" />
                <circle cx="50" cy="50" r={a.r} fill="none" stroke={a.c} strokeWidth="4" strokeLinecap="round" strokeDasharray={circ(a.r)} strokeDashoffset={circ(a.r) - (a.pct / 100) * circ(a.r)} />
              </g>
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-ivory text-xs font-bold">{stateText}</span>
            <span className="text-ivory/40 text-[8px] tracking-wider mt-0.5">STATE</span>
          </div>
        </div>
        <div className="flex-1 w-full">
          <p className="text-ivory/45 text-[9px] uppercase tracking-[0.2em] mb-2">Energy trend</p>
          <svg viewBox="0 0 200 80" className="w-full h-20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dsAreaMini" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity="0.4" />
                <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
              </linearGradient>
            </defs>
            {eHist.length > 1 && (
              <>
                <path d={`M0,${80 - (eHist[0] / 100) * 70} ${eHist.map((v, i) => `L${(i / (eHist.length - 1)) * 200},${80 - (v / 100) * 70}`).join(" ")} L200,80 L0,80 Z`} fill="url(#dsAreaMini)" />
                <path d={`M0,${80 - (eHist[0] / 100) * 70} ${eHist.map((v, i) => `L${(i / (eHist.length - 1)) * 200},${80 - (v / 100) * 70}`).join(" ")}`} fill="none" stroke={BLUE} strokeWidth="2" />
                <circle cx="200" cy={80 - (eHist[eHist.length - 1] / 100) * 70} r="4" fill={SAND} />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Current need */}
      {needs.length > 0 && (
        <div className="glass-card-2 rounded-2xl p-4 border-l-2" style={{ borderColor: SAND }}>
          <p className="text-[9px] uppercase tracking-[0.24em] text-ivory/45 font-semibold mb-1.5">Belangrijkste behoefte</p>
          <p className="text-sm font-medium">{needs[0]}</p>
          {needs[1] && <p className="text-[11px] text-ivory/45 mt-0.5">+{needs.length - 1} meer</p>}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Check-in" icon={Sparkles} onClick={() => setShowCheckIn((v) => !v)} />
          <ActionBtn label="State" icon={ActivityIcon} onClick={() => navigate("/self/daily-state?tab=state")} />
          <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/daily-state")} />
        </div>
      </div>

      {/* Check-in form */}
      {showCheckIn && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-3 animate-fade-up">
          <p className="text-[10px] uppercase tracking-wide text-ivory/55 font-semibold">Nieuwe check-in</p>
          <div className="grid grid-cols-2 gap-2.5">
            <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory outline-none">
              {["calm", "charged", "neutral", "low", "overwhelmed"].map((s) => <option key={s} value={s} className="text-charcoal">{stateLabel(s)}</option>)}
            </select>
            <select value={form.mood} onChange={(e) => setForm((f) => ({ ...f, mood: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory outline-none">
              {["good", "neutral", "low", "anxious", "tired", "energetic"].map((m) => <option key={m} value={m} className="text-charcoal">{moodLabel(m)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[11px] text-ivory/55">Energy: {form.energy}%
              <input type="range" min="0" max="100" value={form.energy} onChange={(e) => setForm((f) => ({ ...f, energy: e.target.value }))} className="w-full" style={{ accentColor: BLUE }} />
            </label>
            <label className="text-[11px] text-ivory/55">Capacity: {form.capacity}%
              <input type="range" min="0" max="100" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className="w-full" style={{ accentColor: BLUE }} />
            </label>
          </div>
          <input value={form.need} onChange={(e) => setForm((f) => ({ ...f, need: e.target.value }))} placeholder="Belangrijkste behoefte nu" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <textarea value={form.reflection} onChange={(e) => setForm((f) => ({ ...f, reflection: e.target.value }))} placeholder="Reflectie (optioneel)" rows={2} className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none resize-none" />
          <button onClick={saveCheckIn} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal transition" style={{ background: BLUE }}><Plus className="w-4 h-4" /> Check-in opslaan</button>
        </div>
      )}
    </div>
  );
}