import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn, Stat } from "@/system/panels/previewParts";
import { therapyStatusColor, therapyStatusLabel, fmtDate, fmtTime } from "@/lib/selfUtils";
import { Plus, Calendar, ArrowUpRight, FileText, Target, TrendingUp } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

const SUBNAV = [
  { key: "", label: "Trajecten" },
  { key: "?tab=appointments", label: "Afspraken" },
  { key: "?tab=goals", label: "Doelen" },
  { key: "?tab=notes", label: "Notities" },
  { key: "?tab=progress", label: "Voortgang" },
];

/** Therapy panel — actieve trajecten en volgende afspraak. */
export default function TherapyPanel() {
  const navigate = useNavigate();
  const [trajectories, setTrajectories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "therapy", therapist_name: "" });

  const load = async () => {
    try { const list = await base44.entities.TherapyTrajectory.list().catch(() => []); setTrajectories(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (trajectories || []).filter((t) => t.status === "active"), [trajectories]);
  const next = useMemo(() => active.filter((t) => t.next_appointment).sort((a, b) => new Date(a.next_appointment) - new Date(b.next_appointment))[0], [active]);
  const totalGoals = useMemo(() => active.reduce((n, t) => n + (t.goals?.length || 0), 0), [active]);
  const totalNotes = useMemo(() => active.reduce((n, t) => n + (t.notes?.length || 0), 0), [active]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.TherapyTrajectory.create({ title: form.title.trim(), type: form.type, therapist_name: form.therapist_name || undefined, status: "active" }); setForm({ title: "", type: "therapy", therapist_name: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Therapy</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{active.length} actief</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{next ? `Volgende: ${fmtDate(next.next_appointment)} ${fmtTime(next.next_appointment)}` : "Geen afspraak gepland"}</p>
        <nav className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          {SUBNAV.map((s) => (
            <button key={s.key} onClick={() => navigate(`/self/therapy${s.key}`)} className="text-[11px] uppercase tracking-[0.16em] font-medium text-ivory/45 hover:text-ivory transition-colors border-b border-transparent hover:border-ivory/30 pb-0.5">
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Stat label="Open doelen" value={totalGoals} accent={SAGE} />
        <Stat label="Notities" value={totalNotes} accent="hsl(var(--self-accent-deep))" />
      </div>

      {/* Active trajectories */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Actieve trajecten</p>
        {active.length ? (
          <div className="flex flex-col gap-2">
            {active.slice(0, 4).map((t) => (
              <Card key={t.id} accent={therapyStatusColor(t.status)} onClick={() => navigate("/self/therapy")}>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{t.title}</p>
                    <p className="text-[11px] text-ivory/45">{t.therapist_name || "—"} · {therapyStatusLabel(t.status)}</p>
                  </div>
                  {t.progress > 0 && <span className="text-[10px] tabular-nums text-ivory/55">{t.progress}%</span>}
                </div>
              </Card>
            ))}
          </div>
        ) : <Empty text="Geen actieve trajecten." />}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Traject" icon={Plus} onClick={() => setShowAdd((v) => !v)} />
          <ActionBtn label="Afspraak" icon={Calendar} onClick={() => navigate("/self/therapy?tab=appointments")} />
          <ActionBtn label="Notitie" icon={FileText} onClick={() => navigate("/self/therapy?tab=notes")} />
          <ActionBtn label="Doel" icon={Target} onClick={() => navigate("/self/therapy?tab=goals")} />
          <ActionBtn label="Voortgang" icon={TrendingUp} onClick={() => navigate("/self/therapy?tab=progress")} />
          <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/therapy")} />
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-2.5 animate-fade-up">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Traject naam" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <div className="flex gap-2">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
              {["therapy", "coaching", "counseling", "support", "other"].map((t) => <option key={t} value={t} className="text-charcoal">{t}</option>)}
            </select>
            <input value={form.therapist_name} onChange={(e) => setForm((f) => ({ ...f, therapist_name: e.target.value }))} placeholder="Therapeut naam" className="flex-1 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory placeholder:text-ivory/40 outline-none" />
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: SAGE }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}
    </div>
  );
}