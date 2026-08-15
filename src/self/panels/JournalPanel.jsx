import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn } from "@/system/panels/previewParts";
import { journalTypeColor, journalTypeLabel, fmtTime, fmtDate } from "@/lib/selfUtils";
import { Plus, ArrowUpRight, BookOpen, Star, MessageSquare, Sparkles } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

/** Journal panel — actuele dag, momenten en highlights. */
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
    return (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === d);
  }, [entries]);
  const moments = useMemo(() => today.filter((e) => e.type === "moment" || e.type === "highlight"), [today]);
  const highlights = useMemo(() => (entries || []).filter((e) => e.is_highlight).slice(0, 3), [entries]);
  const openThreads = useMemo(() => (entries || []).filter((e) => e.type === "thread"), [entries]);

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
        <p className="text-sm text-ivory/55 mt-1.5 italic">{openThreads.length ? `${openThreads.length} open thread${openThreads.length > 1 ? "s" : ""}` : "Vandaag is leeg — voeg iets toe."}</p>
      </div>

      {/* Today's moments */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Vandaag</p>
        {today.length ? (
          <div className="flex flex-col gap-2">
            {today.slice(0, 5).map((e) => (
              <Card key={e.id} accent={journalTypeColor(e.type)} onClick={() => navigate("/self/journal")}>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: journalTypeColor(e.type) }}>{journalTypeLabel(e.type)}</span>
                  <p className="text-sm font-medium truncate flex-1">{e.title}</p>
                  <span className="text-[10px] text-ivory/45">{fmtTime(e.date)}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : <Empty text="Nog niets vandaag." />}
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45 font-semibold mb-2.5">Highlights</p>
          <div className="flex flex-col gap-1.5">
            {highlights.map((h) => (
              <div key={h.id} className="flex items-center gap-2 glass-card-2 rounded-xl px-3.5 py-2.5">
                <Star className="w-3.5 h-3.5 shrink-0" style={{ color: SAGE }} />
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
          <ActionBtn label="Reflectie" icon={BookOpen} onClick={() => navigate("/self/journal?tab=reflection")} />
          <ActionBtn label="Highlights" icon={Star} onClick={() => navigate("/self/journal?tab=highlights")} />
          <ActionBtn label="Threads" icon={MessageSquare} onClick={() => navigate("/self/journal?tab=timeline")} />
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
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: SAGE }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}
    </div>
  );
}