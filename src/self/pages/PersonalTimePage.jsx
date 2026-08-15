import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { Empty, Card, Stat } from "@/system/panels/previewParts";
import { totalPersonalTimeToday, sumPersonalTime, fmtDuration, timeBlockColor, timeBlockLabel, fmtTime } from "@/lib/selfUtils";
import { Clock, Plus, Search, Sliders, Shield, Coffee, Heart, ArrowUpRight } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

const TABS = [
  { key: "personal_time", label: "Personal Time" },
  { key: "rest", label: "Rest" },
  { key: "recovery", label: "Recovery" },
  { key: "free_time", label: "Free Time" },
];

export default function PersonalTimePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "personal_time");
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "free", duration_min: 30, is_protected: false });

  const load = async () => {
    try { const list = await base44.entities.PersonalTimeBlock.list("-start", 50).catch(() => []); setBlocks(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const todayBlocks = useMemo(() => { const d = new Date().toDateString(); return (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled"); }, [blocks]);
  const total = useMemo(() => todayBlocks.reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const protectedTotal = useMemo(() => todayBlocks.filter((b) => b.is_protected).reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const rest = useMemo(() => sumPersonalTime(todayBlocks, "rest"), [todayBlocks]);
  const recovery = useMemo(() => sumPersonalTime(todayBlocks, "recovery"), [todayBlocks]);
  const free = useMemo(() => sumPersonalTime(todayBlocks, "free"), [todayBlocks]);

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + (Number(form.duration_min) || 30) * 60000).toISOString();
      await base44.entities.PersonalTimeBlock.create({ title: form.title.trim(), type: form.type, start, end, duration_min: Number(form.duration_min) || 30, status: "scheduled", is_protected: form.is_protected });
      setForm({ title: "", type: "free", duration_min: 30, is_protected: false }); setShowAdd(false); await load();
    } catch { /* ignore */ }
  };
  const setTab2 = (t) => { setTab(t); navigate(`/self/personal-time?tab=${t}`, { replace: true }); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="self-personal-time" image={IMAGES.selfPersonalTime} icon={Clock} eyebrow="SELF" title="Personal Time" subtitle="Rust, herstel en vrije tijd"
        actions={
          <div className="flex items-center gap-2">
            <GlassButton variant="glass" size="icon" onClick={() => navigate("/search")}><Search className="h-4 w-4" /></GlassButton>
            <GlassButton variant="glass" size="icon"><Sliders className="h-4 w-4" /></GlassButton>
            <GlassButton variant="primary" size="md" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Tijd</GlassButton>
          </div>
        } />

      {showAdd && (
        <GlassPanel level={2} className="p-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Persoonlijke tijd toevoegen</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Wat ga je doen?" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none">
              {["rest", "recovery", "free", "protected"].map((t) => <option key={t} value={t}>{timeBlockLabel(t)}</option>)}
            </select>
            <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} placeholder="min" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={form.is_protected} onChange={(e) => setForm((f) => ({ ...f, is_protected: e.target.checked }))} /> Beschermd</label>
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40" style={{ background: "hsl(var(--self-primary))" }}><Plus className="h-4 h-4" /> Voeg toe</button>
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
          {tab === "personal_time" && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-3">
                <Stat label="Totaal vandaag" value={fmtDuration(total)} accent={SAGE} />
                <Stat label="Beschermd" value={fmtDuration(protectedTotal)} accent="hsl(var(--self-primary-light))" />
                <Stat label="Rust" value={fmtDuration(rest)} accent={timeBlockColor("rest")} />
                <Stat label="Herstel" value={fmtDuration(recovery)} accent={timeBlockColor("recovery")} />
              </div>
              <div className="space-y-2">
                {todayBlocks.length ? todayBlocks.map((b) => (
                  <Card key={b.id} accent={timeBlockColor(b.type)}>
                    <div className="flex items-center gap-3">
                      {b.is_protected && <Shield className="w-4 h-4 shrink-0" style={{ color: SAGE }} />}
                      <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(255,255,255,0.08)", color: timeBlockColor(b.type) }}>{timeBlockLabel(b.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{b.title}</p>
                        <p className="text-[11px] text-muted-foreground">{fmtTime(b.start)} · {fmtDuration(b.duration_min)}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{b.status}</span>
                    </div>
                  </Card>
                )) : <Empty text="Geen persoonlijke tijd vandaag — plan een moment." />}
              </div>
            </div>
          )}

          {tab === "rest" && (
            <div className="space-y-4">
              <Stat label="Rust vandaag" value={fmtDuration(rest)} accent={timeBlockColor("rest")} />
              <div className="space-y-2">
                {todayBlocks.filter((b) => b.type === "rest").length ? todayBlocks.filter((b) => b.type === "rest").map((b) => (
                  <Card key={b.id} accent={timeBlockColor("rest")}>
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 shrink-0" style={{ color: timeBlockColor("rest") }} />
                      <div className="flex-1"><p className="text-sm font-medium">{b.title}</p><p className="text-[11px] text-muted-foreground">{fmtTime(b.start)} · {fmtDuration(b.duration_min)}</p></div>
                    </div>
                  </Card>
                )) : <Empty text="Geen rustmomenten vandaag." />}
              </div>
            </div>
          )}

          {tab === "recovery" && (
            <div className="space-y-4">
              <Stat label="Herstel vandaag" value={fmtDuration(recovery)} accent={timeBlockColor("recovery")} />
              <div className="space-y-2">
                {todayBlocks.filter((b) => b.type === "recovery").length ? todayBlocks.filter((b) => b.type === "recovery").map((b) => (
                  <Card key={b.id} accent={timeBlockColor("recovery")}>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 shrink-0" style={{ color: timeBlockColor("recovery") }} />
                      <div className="flex-1"><p className="text-sm font-medium">{b.title}</p><p className="text-[11px] text-muted-foreground">{fmtTime(b.start)} · {fmtDuration(b.duration_min)}</p></div>
                    </div>
                  </Card>
                )) : <Empty text="Geen herstelmomenten vandaag." />}
              </div>
            </div>
          )}

          {tab === "free_time" && (
            <div className="space-y-4">
              <Stat label="Vrije tijd vandaag" value={fmtDuration(free)} accent={timeBlockColor("free")} />
              <div className="space-y-2">
                {todayBlocks.filter((b) => b.type === "free").length ? todayBlocks.filter((b) => b.type === "free").map((b) => (
                  <Card key={b.id} accent={timeBlockColor("free")}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0" style={{ color: timeBlockColor("free") }} />
                      <div className="flex-1"><p className="text-sm font-medium">{b.title}</p><p className="text-[11px] text-muted-foreground">{fmtTime(b.start)} · {fmtDuration(b.duration_min)}</p></div>
                    </div>
                  </Card>
                )) : <Empty text="Geen vrije tijd vandaag." />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}