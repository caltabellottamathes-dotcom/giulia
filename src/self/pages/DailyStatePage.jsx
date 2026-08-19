import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { SectionLabel, Empty, Card, Stat, Progress } from "@/system/panels/previewParts";
import { stateColor, stateLabel, energyColor, capacityColor, moodColor, moodLabel, levelLabel, fmtTime, fmtDate, fmtAgo } from "@/lib/selfUtils";
import { Activity as ActivityIcon, Plus, Search, Sliders, Battery, Heart, Sparkles, Clock, ArrowUpRight } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

const TABS = [
  { key: "state", label: "Self State" },
  { key: "capacity", label: "Capacity" },
  { key: "energy", label: "Energy" },
  { key: "mood", label: "Mood" },
  { key: "needs", label: "Needs" },
  { key: "personal_time", label: "Personal Time" },
  { key: "self_today", label: "Self Today" },
  { key: "check_ins", label: "Check-ins" },
  { key: "history", label: "State History" },
  { key: "context", label: "Personal Context" },
];

export default function DailyStatePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "state");
  const [checkIns, setCheckIns] = useState([]);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [form, setForm] = useState({ state: "neutral", energy: 50, capacity: 50, mood: "neutral", need: "", reflection: "", context: "" });

  const load = async () => {
    try {
      const [c, t] = await Promise.all([
        base44.entities.SelfCheckIn.list("-timestamp", 50).catch(() => []),
        base44.entities.PersonalTimeBlock.list("-start").catch(() => []),
      ]);
      setCheckIns(c || []); setTimeBlocks(t || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const latest = checkIns[0];
  const todayBlocks = useMemo(() => {
    const d = new Date().toDateString();
    return (timeBlocks || []).filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled");
  }, [timeBlocks]);
  const protectedToday = todayBlocks.filter((b) => b.is_protected).reduce((s, b) => s + (b.duration_min || 0), 0);

  const saveCheckIn = async () => {
    try {
      await base44.entities.SelfCheckIn.create({
        state: form.state, energy: Number(form.energy), capacity: Number(form.capacity),
        mood: form.mood, needs: form.need ? [form.need] : [], reflection: form.reflection || undefined,
        context: form.context || undefined, timestamp: new Date().toISOString(), source: "manual", check_in_type: "manual",
      });
      setForm({ state: "neutral", energy: 50, capacity: 50, mood: "neutral", need: "", reflection: "", context: "" });
      setShowCheckIn(false); await load();
    } catch { /* ignore */ }
  };
  const setTab2 = (t) => { setTab(t); navigate(`/life/daily-state?tab=${t}`, { replace: true }); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-daily-state" image={IMAGES.selfDailyState} icon={ActivityIcon} eyebrow="LIFE" title="Daily State" subtitle="Actuele persoonlijke toestand"
        actions={
          <div className="flex items-center gap-2">
            <GlassButton variant="glass" size="icon" onClick={() => navigate("/search")}><Search className="h-4 w-4" /></GlassButton>
            <GlassButton variant="glass" size="icon"><Sliders className="h-4 w-4" /></GlassButton>
            <GlassButton variant="primary" size="md" onClick={() => setShowCheckIn((v) => !v)}><Sparkles className="h-4 w-4" /> Check-in</GlassButton>
          </div>
        } />

      {showCheckIn && (
        <GlassPanel level={2} className="p-6 animate-fade-up space-y-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Nieuwe check-in</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none">
              {["calm", "charged", "neutral", "low", "overwhelmed"].map((s) => <option key={s} value={s}>{stateLabel(s)}</option>)}
            </select>
            <select value={form.mood} onChange={(e) => setForm((f) => ({ ...f, mood: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none">
              {["good", "neutral", "low", "anxious", "tired", "energetic"].map((m) => <option key={m} value={m}>{moodLabel(m)}</option>)}
            </select>
            <label className="text-xs text-muted-foreground">Energy: {form.energy}%
              <input type="range" min="0" max="100" value={form.energy} onChange={(e) => setForm((f) => ({ ...f, energy: e.target.value }))} className="w-full" style={{ accentColor: SAGE }} />
            </label>
            <label className="text-xs text-muted-foreground">Capacity: {form.capacity}%
              <input type="range" min="0" max="100" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className="w-full" style={{ accentColor: SAGE }} />
            </label>
          </div>
          <input value={form.need} onChange={(e) => setForm((f) => ({ ...f, need: e.target.value }))} placeholder="Belangrijkste behoefte" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
          <textarea value={form.reflection} onChange={(e) => setForm((f) => ({ ...f, reflection: e.target.value }))} placeholder="Reflectie" rows={2} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none resize-none" />
          <button onClick={saveCheckIn} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory" style={{ background: "hsl(var(--self-primary))" }}><Plus className="h-4 w-4" /> Opslaan</button>
        </GlassPanel>
      )}

      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab2(t.key)} className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition" style={tab === t.key ? { background: SAGE, color: "hsl(var(--self-primary))" } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Laden…</p> : (
        <>
          {tab === "state" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <Stat label="State" value={latest ? stateLabel(latest.state) : "—"} accent={stateColor(latest?.state)} hint={latest ? fmtAgo(latest.timestamp) : "geen check-in"} />
                <Stat label="Energy" value={latest?.energy != null ? `${latest.energy}%` : "—"} accent={energyColor(latest?.energy)} hint={levelLabel(latest?.energy)} />
                <Stat label="Capacity" value={latest?.capacity != null ? `${latest.capacity}%` : "—"} accent={capacityColor(latest?.capacity)} hint={levelLabel(latest?.capacity)} />
              </div>
              {latest?.reflection && (
                <GlassPanel level={2} className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-3">Recente reflectie</p>
                  <p className="text-base text-foreground/80 italic">"{latest.reflection}"</p>
                </GlassPanel>
              )}
            </div>
          )}

          {tab === "capacity" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <GlassPanel level={2} className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Capaciteit trend</p>
                  <div className="flex items-end gap-1 h-32">
                    {checkIns.slice(0, 14).reverse().map((c, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="w-full rounded-full transition-all duration-500" style={{ height: `${c.capacity || 0}%`, background: capacityColor(c.capacity), minHeight: 4 }} />
                      </div>
                    ))}
                  </div>
                </GlassPanel>
                <GlassPanel level={2} className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Overload detectie</p>
                  {latest?.capacity < 30 ? (
                    <p className="text-base font-semibold" style={{ color: URGENT }}>Lage capaciteit — overweeg rust.</p>
                  ) : (
                    <p className="text-base text-muted-foreground">Capaciteit is voldoende.</p>
                  )}
                </GlassPanel>
              </div>
            </div>
          )}

          {tab === "energy" && (
            <div className="space-y-6">
              <GlassPanel level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Energie door de dag</p>
                <div className="flex items-end gap-1 h-32">
                  {checkIns.slice(0, 14).reverse().map((c, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="w-full rounded-full transition-all duration-500" style={{ height: `${c.energy || 0}%`, background: energyColor(c.energy), minHeight: 4 }} />
                    </div>
                  ))}
                </div>
              </GlassPanel>
              {latest?.energy < 25 && (
                <GlassPanel level={2} className="p-6">
                  <p className="text-base font-semibold" style={{ color: URGENT }}>Energie is laag — plan geen deep work vandaag.</p>
                </GlassPanel>
              )}
            </div>
          )}

          {tab === "mood" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <GlassPanel level={2} className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Mood history</p>
                  <div className="space-y-2">
                    {checkIns.slice(0, 8).map((c) => (
                      <div key={c.id} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: moodColor(c.mood) }} />
                        <span className="text-sm">{moodLabel(c.mood)}</span>
                        <span className="text-[11px] text-muted-foreground ml-auto">{fmtDate(c.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
                <GlassPanel level={2} className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Patronen</p>
                  <p className="text-sm text-muted-foreground">Terugkerende moods worden hier zichtbaar na meer check-ins.</p>
                </GlassPanel>
              </div>
            </div>
          )}

          {tab === "needs" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Behoeften uit je check-ins.</p>
              <div className="space-y-2">
                {checkIns.filter((c) => c.needs?.length).length ? (
                  checkIns.slice(0, 10).filter((c) => c.needs?.length).map((c) => (
                    <Card key={c.id} accent={URGENT}>
                      <p className="text-sm font-medium">{c.needs.join(", ")}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{fmtAgo(c.timestamp)}</p>
                    </Card>
                  ))
                ) : <Empty text="Nog geen behoeften vastgelegd." />}
              </div>
            </div>
          )}

          {tab === "personal_time" && (
            <div className="space-y-4">
              <Stat label="Beschermde tijd vandaag" value={`${Math.floor(protectedToday / 60)}h ${protectedToday % 60}m`} accent={SAGE} />
              <div className="space-y-2">
                {todayBlocks.length ? todayBlocks.map((b) => (
                  <Card key={b.id} accent={SAGE}><p className="text-sm font-medium">{b.title}</p><p className="text-[11px] text-muted-foreground">{b.type} · {b.duration_min}m</p></Card>
                )) : <Empty text="Geen persoonlijke tijd vandaag." />}
              </div>
            </div>
          )}

          {tab === "self_today" && (
            <div className="space-y-6">
              <GlassPanel level={2} className="p-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Self Today — samenvatting</p>
                <div className="space-y-3">
                  <Row label="State" value={latest ? stateLabel(latest.state) : "—"} color={stateColor(latest?.state)} />
                  <Row label="Energy" value={latest?.energy != null ? `${latest.energy}%` : "—"} color={energyColor(latest?.energy)} />
                  <Row label="Capacity" value={latest?.capacity != null ? `${latest.capacity}%` : "—"} color={capacityColor(latest?.capacity)} />
                  <Row label="Mood" value={moodLabel(latest?.mood)} color={moodColor(latest?.mood)} />
                  <Row label="Need" value={latest?.needs?.[0] || "—"} color={URGENT} />
                  <Row label="Protected" value={`${Math.floor(protectedToday / 60)}h ${protectedToday % 60}m`} color={SAGE} />
                </div>
              </GlassPanel>
            </div>
          )}

          {tab === "check_ins" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Check-in geschiedenis.</p>
              <div className="space-y-2">
                {checkIns.length ? checkIns.slice(0, 15).map((c) => (
                  <Card key={c.id} accent={stateColor(c.state)}>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{stateLabel(c.state)} · {moodLabel(c.mood)}</p>
                        <p className="text-[11px] text-muted-foreground">E:{c.energy ?? "—"}% · C:{c.capacity ?? "—"}% · {fmtAgo(c.timestamp)}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.source}</span>
                    </div>
                  </Card>
                )) : <Empty text="Nog geen check-ins." />}
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Chronologische ontwikkeling van je state.</p>
              <div className="space-y-2">
                {checkIns.length ? checkIns.slice(0, 20).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 glass-card-2 rounded-xl px-4 py-3">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ background: stateColor(c.state) }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{stateLabel(c.state)}</p>
                      <p className="text-[11px] text-muted-foreground">{fmtDate(c.timestamp)} · {fmtTime(c.timestamp)}</p>
                    </div>
                  </div>
                )) : <Empty text="Nog geen geschiedenis." />}
              </div>
            </div>
          )}

          {tab === "context" && (
            <GlassPanel level={2} className="p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Personal Context</p>
              <div className="space-y-3">
                <Row label="Current state" value={latest ? stateLabel(latest.state) : "—"} color={stateColor(latest?.state)} />
                <Row label="Current need" value={latest?.needs?.[0] || "—"} color={URGENT} />
                <Row label="Energy" value={latest?.energy < 50 ? "Declining" : latest?.energy >= 75 ? "High" : "Steady"} color={energyColor(latest?.energy)} />
                <Row label="Protected time" value={`${Math.floor(protectedToday / 60)}h ${protectedToday % 60}m`} color={SAGE} />
                {latest?.context && <p className="text-sm text-muted-foreground italic mt-2">{latest.context}</p>}
              </div>
            </GlassPanel>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</span>
      <span className="text-sm font-medium" style={{ color: color || "hsl(var(--foreground))" }}>{value}</span>
    </div>
  );
}