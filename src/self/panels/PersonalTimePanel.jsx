import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn, Stat } from "@/system/panels/previewParts";
import { totalPersonalTimeToday, sumPersonalTime, fmtDuration, timeBlockColor, timeBlockLabel } from "@/lib/selfUtils";
import { Plus, Shield, ArrowUpRight, Coffee, Heart, Clock } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

const SUBNAV = [
  { key: "", label: "Vandaag" },
  { key: "?tab=protected", label: "Beschermd" },
  { key: "?tab=recovery", label: "Herstel" },
  { key: "?tab=free", label: "Vrij" },
  { key: "?tab=week", label: "Week" },
];

/** Personal Time panel — persoonlijke tijd vandaag met breakdown. */
export default function PersonalTimePanel() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "free", duration_min: 30 });

  const load = async () => {
    try { const list = await base44.entities.PersonalTimeBlock.list("-start").catch(() => []); setBlocks(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const todayBlocks = useMemo(() => {
    const d = new Date().toDateString();
    return (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled");
  }, [blocks]);
  const total = useMemo(() => todayBlocks.reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const protected_ = useMemo(() => todayBlocks.filter((b) => b.is_protected).reduce((s, b) => s + (b.duration_min || 0), 0), [todayBlocks]);
  const rest = useMemo(() => sumPersonalTime(todayBlocks, "rest"), [todayBlocks]);
  const recovery = useMemo(() => sumPersonalTime(todayBlocks, "recovery"), [todayBlocks]);
  const free = useMemo(() => sumPersonalTime(todayBlocks, "free"), [todayBlocks]);

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + (Number(form.duration_min) || 30) * 60000).toISOString();
      await base44.entities.PersonalTimeBlock.create({ title: form.title.trim(), type: form.type, start, end, duration_min: Number(form.duration_min) || 30, status: "scheduled", is_protected: form.type === "protected" });
      setForm({ title: "", type: "free", duration_min: 30 }); setShowAdd(false); await load();
    } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Personal Time</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{fmtDuration(total)}</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{protected_ > 0 ? `${fmtDuration(protected_)} beschermd` : "Geen beschermde tijd vandaag"}</p>
        <nav className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          {SUBNAV.map((s) => (
            <button key={s.key} onClick={() => navigate(`/self/personal-time${s.key}`)} className="text-[11px] uppercase tracking-[0.16em] font-medium text-ivory/45 hover:text-ivory transition-colors border-b border-transparent hover:border-ivory/30 pb-0.5">
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Rust" value={fmtDuration(rest)} accent={timeBlockColor("rest")} />
        <Stat label="Herstel" value={fmtDuration(recovery)} accent={timeBlockColor("recovery")} />
        <Stat label="Vrij" value={fmtDuration(free)} accent={timeBlockColor("free")} />
      </div>

      {/* Today's blocks */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Vandaag</p>
        {todayBlocks.length ? (
          <div className="flex flex-col gap-1.5">
            {todayBlocks.slice(0, 5).map((b) => (
              <Card key={b.id} accent={timeBlockColor(b.type)} onClick={() => navigate("/self/personal-time")}>
                <div className="flex items-center gap-2">
                  {b.is_protected && <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: SAGE }} />}
                  <span className="text-[9px] uppercase tracking-wide font-semibold" style={{ color: timeBlockColor(b.type) }}>{timeBlockLabel(b.type)}</span>
                  <p className="text-sm font-medium truncate flex-1">{b.title}</p>
                  <span className="text-[10px] tabular-nums text-ivory/55">{fmtDuration(b.duration_min)}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : <Empty text="Geen persoonlijke tijd vandaag." />}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Tijd" icon={Plus} onClick={() => setShowAdd((v) => !v)} />
          <ActionBtn label="Rust" icon={Coffee} onClick={() => { setForm({ title: "Rust moment", type: "rest", duration_min: 20 }); add(); }} />
          <ActionBtn label="Herstel" icon={Heart} onClick={() => navigate("/self/personal-time?tab=recovery")} />
          <ActionBtn label="Bescherm" icon={Shield} onClick={() => navigate("/self/personal-time?tab=protected")} />
          <ActionBtn label="Vrij" icon={Clock} onClick={() => navigate("/self/personal-time?tab=free")} />
          <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/personal-time")} />
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-2.5 animate-fade-up">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Wat ga je doen?" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <div className="flex gap-2">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
              {["rest", "recovery", "free", "protected"].map((t) => <option key={t} value={t} className="text-charcoal">{timeBlockLabel(t)}</option>)}
            </select>
            <input type="number" value={form.duration_min} onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value }))} placeholder="min" className="w-20 rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none" />
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: SAGE }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}
    </div>
  );
}