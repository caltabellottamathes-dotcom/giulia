import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { Empty, Card, Stat, Progress } from "@/system/panels/previewParts";
import { therapyStatusColor, therapyStatusLabel, fmtDate, fmtTime } from "@/lib/selfUtils";
import { Heart, Plus, Search, Sliders, Calendar, Users, Target, FileText, TrendingUp, ArrowUpRight } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "appointments", label: "Appointments" },
  { key: "people", label: "People" },
  { key: "goals", label: "Goals" },
  { key: "notes", label: "Notes" },
  { key: "progress", label: "Progress" },
];

export default function TherapyPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "overview");
  const [trajectories, setTrajectories] = useState([]);
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "therapy", therapist_name: "" });

  const load = async () => {
    try {
      const [t, e, c] = await Promise.all([
        base44.entities.TherapyTrajectory.list().catch(() => []),
        base44.entities.CalendarEvent.filter({ domain: "self" }).catch(() => []),
        base44.entities.Contact.list().catch(() => []),
      ]);
      setTrajectories(t || []); setEvents(e || []); setContacts(c || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (trajectories || []).filter((t) => t.status === "active"), [trajectories]);
  const allGoals = useMemo(() => active.reduce((arr, t) => [...arr, ...(t.goals || []).map((g) => ({ goal: g, trajectory: t.title }))], []), [active]);
  const allNotes = useMemo(() => active.reduce((arr, t) => [...arr, ...(t.notes || []).map((n) => ({ note: n, trajectory: t.title }))], []), [active]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.TherapyTrajectory.create({ title: form.title.trim(), type: form.type, therapist_name: form.therapist_name || undefined, status: "active" }); setForm({ title: "", type: "therapy", therapist_name: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const setTab2 = (t) => { setTab(t); navigate(`/self/therapy?tab=${t}`, { replace: true }); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="self-therapy" image={IMAGES.selfTherapy} icon={Heart} eyebrow="SELF" title="Therapy" subtitle="Trajecten, afspraken en begeleiding"
        actions={
          <div className="flex items-center gap-2">
            <GlassButton variant="glass" size="icon" onClick={() => navigate("/search")}><Search className="h-4 w-4" /></GlassButton>
            <GlassButton variant="glass" size="icon"><Sliders className="h-4 w-4" /></GlassButton>
            <GlassButton variant="primary" size="md" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Traject</GlassButton>
          </div>
        } />

      {showAdd && (
        <GlassPanel level={2} className="p-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Traject toevoegen</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Naam" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none">
              {["therapy", "coaching", "counseling", "support", "other"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={form.therapist_name} onChange={(e) => setForm((f) => ({ ...f, therapist_name: e.target.value }))} placeholder="Therapeut" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40" style={{ background: "hsl(var(--self-primary))" }}><Plus className="h-4 w-4" /> Voeg toe</button>
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
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Actief" value={active.length} accent={SAGE} />
                <Stat label="Doelen" value={allGoals.length} accent="hsl(var(--self-accent-deep))" />
                <Stat label="Notities" value={allNotes.length} accent={SAGE} />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.length ? active.map((t) => (
                  <GlassPanel key={t.id} level={2} className="p-5">
                    <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: therapyStatusColor(t.status) }}>{therapyStatusLabel(t.status)}</p>
                    <h3 className="text-xl font-display font-semibold mt-1">{t.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t.therapist_name || "—"} · {t.type}</p>
                    {t.progress > 0 && <div className="mt-3"><Progress value={t.progress} accent={SAGE} /></div>}
                    {t.next_appointment && <p className="text-[11px] text-muted-foreground mt-2">Volgende: {fmtDate(t.next_appointment)}</p>}
                  </GlassPanel>
                )) : <Empty text="Geen actieve trajecten." />}
              </div>
            </div>
          )}

          {tab === "appointments" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Therapie-afspraken worden opgeslagen als agenda-events met domain=self.</p>
              <div className="space-y-2">
                {events.length ? events.slice(0, 20).map((e) => (
                  <Card key={e.id} accent={SAGE}>
                    <p className="text-sm font-semibold">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground">{fmtDate(e.start)} · {fmtTime(e.start)} · {e.location || "—"}</p>
                  </Card>
                )) : <Empty text="Geen therapie-afspraken." />}
              </div>
            </div>
          )}

          {tab === "people" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.length ? contacts.map((c) => (
                <GlassPanel key={c.id} level={2} className="p-5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Contact</p>
                  <h3 className="text-lg font-display font-semibold mt-1">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{c.company || c.role || "—"}</p>
                  {c.email && <p className="text-[11px] text-muted-foreground mt-2">{c.email}</p>}
                </GlassPanel>
              )) : <Empty text="Geen betrokken personen." />}
            </div>
          )}

          {tab === "goals" && (
            <div className="space-y-2">
              {allGoals.length ? allGoals.map((g, i) => (
                <Card key={i} accent={SAGE}>
                  <p className="text-sm font-semibold">{g.goal}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Traject: {g.trajectory}</p>
                </Card>
              )) : <Empty text="Geen doelen vastgelegd." />}
            </div>
          )}

          {tab === "notes" && (
            <div className="space-y-2">
              {allNotes.length ? allNotes.map((n, i) => (
                <Card key={i} accent="hsl(var(--self-accent-deep))">
                  <p className="text-sm">{n.note}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Traject: {n.trajectory}</p>
                </Card>
              )) : <Empty text="Geen notities." />}
            </div>
          )}

          {tab === "progress" && (
            <div className="space-y-6">
              {active.length ? active.map((t) => (
                <GlassPanel key={t.id} level={2} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-display font-semibold">{t.title}</h3>
                    <span className="text-2xl font-display font-semibold tabular-nums" style={{ color: SAGE }}>{t.progress || 0}%</span>
                  </div>
                  <Progress value={t.progress} accent={SAGE} />
                </GlassPanel>
              )) : <Empty text="Geen voortgang — geen actieve trajecten." />}
            </div>
          )}
        </>
      )}
    </div>
  );
}