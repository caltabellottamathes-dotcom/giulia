import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, ActionBtn } from "@/system/panels/previewParts";
import { journalTypeLabel, fmtTime, fmtDate } from "@/lib/selfUtils";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { Plus, ArrowUpRight, Star, Sparkles } from "lucide-react";

const WEIGHT = { entry: "sm", moment: "md", reflection: "sm", highlight: "lg", thread: "xs" };
const dot = { xs: "w-2 h-2", sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-3.5 h-3.5" };
const barH = { xs: 8, sm: 16, md: 28, lg: 44 };

export default function JournalPanel() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "entry", content: "" });

  const load = async () => {
    try { const list = await base44.entities.JournalEntry.list("-date", 30).catch(() => []); setEntries(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const today = useMemo(() => {
    const d = new Date().toDateString();
    return (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === d).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [entries]);
  const moments = useMemo(() => today.filter((e) => e.type === "moment" || e.type === "highlight"), [today]);
  const highlights = useMemo(() => (entries || []).filter((e) => e.is_highlight).slice(0, 3), [entries]);

  const MOMENTS = today.map((e) => ({ time: fmtTime(e.date), label: e.title, weight: WEIGHT[e.type] || "sm", tag: (e.type || "entry").toUpperCase(), open: e.is_highlight }));
  const tagCounts = useMemo(() => {
    const m = {};
    for (const e of entries || []) for (const t of e.tags || []) m[t] = (m[t] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t);
  }, [entries]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.JournalEntry.create({ title: form.title.trim(), type: form.type, content: form.content || undefined, date: new Date().toISOString() }); setForm({ title: "", type: "entry", content: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };

  if (loading) return <p className="text-sm text-ivory/50">Laden…</p>;

  return (
    <div className="space-y-5 text-ivory">
      <div>
        <SectionLabel>Journal</SectionLabel>
        <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1">{moments.length} momenten</h2>
        <p className="text-sm text-ivory/55 mt-1.5 italic">{today.length ? `${today.length} entries vandaag` : "Vandaag is leeg — voeg iets toe."}</p>
        <button onClick={() => navigate("/self/journal")} className="mt-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: BLUE }}>
          Open Journal <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Vandaag</p>
        {MOMENTS.length ? (
          <div className="glass-card-2 rounded-2xl p-4 relative">
            <div className="absolute left-[44px] top-4 bottom-4 w-px bg-ivory/15" />
            {MOMENTS.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-start gap-3 py-2 relative">
                <span className="w-8 text-ivory text-[10px] font-semibold tabular-nums text-right pt-0.5">{m.time}</span>
                <span className={`z-10 mt-1 rounded-full shrink-0 ${dot[m.weight]}`} style={{ background: m.open ? SAND : BLUE }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.label}</p>
                  {!m.open && <p className="text-ivory/40 text-[9px] tracking-[0.15em] mt-0.5">{m.tag}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : <Empty text="Nog niets vandaag." />}
      </div>

      {/* Emerging tags + magnitude */}
      {MOMENTS.length > 0 && (
        <div className="glass-card-2 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/45 font-semibold">Magnitude</p>
            <div className="flex flex-wrap gap-1.5">
              {tagCounts.slice(0, 3).map((t, i) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ background: i === 0 ? "rgba(216,218,179,0.15)" : "rgba(225,231,239,0.15)", color: i === 0 ? SAND : BLUE, borderColor: i === 0 ? "rgba(216,218,179,0.3)" : "rgba(225,231,239,0.25)" }}>{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1 h-16">
            {MOMENTS.slice(0, 12).map((m, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: barH[m.weight] || 16, background: m.weight === "lg" ? SAND : BLUE }} />
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Highlights</p>
          <div className="flex flex-col gap-1.5">
            {highlights.map((h) => (
              <div key={h.id} className="flex items-center gap-2 glass-card-2 rounded-xl px-3.5 py-2.5">
                <Star className="w-3.5 h-3.5 shrink-0" style={{ color: SAND }} />
                <p className="text-sm font-medium truncate flex-1">{h.title}</p>
                <span className="text-[10px] text-ivory/45">{fmtDate(h.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Snel</p>
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="Notitie" icon={Plus} onClick={() => setShowAdd((v) => !v)} />
          <ActionBtn label="Moment" icon={Sparkles} onClick={() => { setForm({ title: "", type: "moment", content: "" }); setShowAdd(true); }} />
          <ActionBtn label="Open" icon={ArrowUpRight} onClick={() => navigate("/self/journal")} />
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-2.5 animate-fade-up">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Titel" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-ivory outline-none">
            {["entry", "moment", "reflection", "highlight", "thread"].map((t) => <option key={t} value={t} className="text-charcoal">{journalTypeLabel(t)}</option>)}
          </select>
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Inhoud" rows={3} className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none resize-none" />
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: BLUE }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}
    </div>
  );
}