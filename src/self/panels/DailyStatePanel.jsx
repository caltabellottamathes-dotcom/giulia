import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn, Stat } from "@/system/panels/previewParts";
import { stateColor, stateLabel, energyColor, capacityColor, moodColor, moodLabel, levelLabel, fmtTime, fmtAgo } from "@/lib/selfUtils";
import { Activity as ActivityIcon, Battery, Heart, Plus, ArrowUpRight, Sparkles, Clock } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Daily State panel — compacte actuele toestand met snelle acties. */
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

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Daily State</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{latest ? stateLabel(latest.state) : "Check in"}</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{latest ? `Last check-in ${fmtAgo(latest.timestamp)}` : "Nog geen check-in vandaag."}</p>
      </div>

      {/* Current metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Energy" value={latest?.energy != null ? `${latest.energy}%` : "—"} accent={energyColor(latest?.energy)} hint={levelLabel(latest?.energy)} />
        <Stat label="Capacity" value={latest?.capacity != null ? `${latest.capacity}%` : "—"} accent={capacityColor(latest?.capacity)} hint={levelLabel(latest?.capacity)} />
        <Stat label="Mood" value={moodLabel(latest?.mood)} accent={moodColor(latest?.mood)} />
      </div>

      {/* Current need */}
      {needs.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Belangrijkste behoefte</p>
          <Card accent={URGENT}>
            <p className="text-sm font-medium">{needs[0]}</p>
            {needs[1] && <p className="text-[11px] text-ivory/45 mt-0.5">+{needs.length - 1} meer</p>}
          </Card>
        </div>
      )}

      {/* Context */}
      {latest?.context && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Context</p>
          <div className="glass-card-2 rounded-2xl p-4">
            <p className="text-sm text-ivory/70">{latest.context}</p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Check-in" icon={Sparkles} onClick={() => setShowCheckIn((v) => !v)} />
          <ActionBtn label="State" icon={ActivityIcon} onClick={() => navigate("/self/daily-state?tab=state")} />
          <ActionBtn label="Energy" icon={Battery} onClick={() => navigate("/self/daily-state?tab=energy")} />
          <ActionBtn label="Mood" icon={Heart} onClick={() => navigate("/self/daily-state?tab=mood")} />
          <ActionBtn label="Need" icon={Plus} onClick={() => navigate("/self/daily-state?tab=needs")} />
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
              <input type="range" min="0" max="100" value={form.energy} onChange={(e) => setForm((f) => ({ ...f, energy: e.target.value }))} className="w-full accent-sage" style={{ accentColor: SAGE }} />
            </label>
            <label className="text-[11px] text-ivory/55">Capacity: {form.capacity}%
              <input type="range" min="0" max="100" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className="w-full" style={{ accentColor: SAGE }} />
            </label>
          </div>
          <input value={form.need} onChange={(e) => setForm((f) => ({ ...f, need: e.target.value }))} placeholder="Belangrijkste behoefte nu" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <textarea value={form.reflection} onChange={(e) => setForm((f) => ({ ...f, reflection: e.target.value }))} placeholder="Reflectie (optioneel)" rows={2} className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none resize-none" />
          <button onClick={saveCheckIn} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal transition" style={{ background: SAGE }}><Plus className="w-4 h-4" /> Check-in opslaan</button>
        </div>
      )}
    </div>
  );
}