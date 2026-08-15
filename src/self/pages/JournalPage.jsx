import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { Empty, Card, Stat } from "@/system/panels/previewParts";
import { journalTypeColor, journalTypeLabel, fmtTime, fmtDate } from "@/lib/selfUtils";
import { BookOpen, Plus, Search, Sliders, Star, MessageSquare, ArrowUpRight } from "lucide-react";

const SAGE = "hsl(var(--self-accent))";

const TABS = [
  { key: "journal", label: "Journal" },
  { key: "today", label: "Today" },
  { key: "timeline", label: "Timeline" },
  { key: "highlights", label: "Highlights" },
  { key: "reflection", label: "Reflection" },
];

export default function JournalPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "journal");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "entry", content: "", is_highlight: false });

  const load = async () => {
    try { const list = await base44.entities.JournalEntry.list("-date", 100).catch(() => []); setEntries(list || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const today = useMemo(() => { const d = new Date().toDateString(); return (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === d); }, [entries]);
  const highlights = useMemo(() => (entries || []).filter((e) => e.is_highlight), [entries]);
  const reflections = useMemo(() => (entries || []).filter((e) => e.type === "reflection"), [entries]);
  const timeline = useMemo(() => (entries || []).filter((e) => e.type === "moment" || e.type === "highlight").slice(0, 30), [entries]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.JournalEntry.create({ title: form.title.trim(), type: form.type, content: form.content || undefined, date: new Date().toISOString(), is_highlight: form.is_highlight || form.type === "highlight" }); setForm({ title: "", type: "entry", content: "", is_highlight: false }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const setTab2 = (t) => { setTab(t); navigate(`/self/journal?tab=${t}`, { replace: true }); };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="self-journal" image={IMAGES.selfJournal} icon={BookOpen} eyebrow="SELF" title="Journal" subtitle="Persoonlijke geschiedenis en momenten"
        actions={
          <div className="flex items-center gap-2">
            <GlassButton variant="glass" size="icon" onClick={() => navigate("/search")}><Search className="h-4 w-4" /></GlassButton>
            <GlassButton variant="glass" size="icon"><Sliders className="h-4 w-4" /></GlassButton>
            <GlassButton variant="primary" size="md" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Entry</GlassButton>
          </div>
        } />

      {showAdd && (
        <GlassPanel level={2} className="p-6 animate-fade-up space-y-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Nieuwe journal entry</p>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Titel" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none" />
          <div className="flex gap-3">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none">
              {["entry", "moment", "reflection", "highlight", "thread"].map((t) => <option key={t} value={t}>{journalTypeLabel(t)}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={form.is_highlight} onChange={(e) => setForm((f) => ({ ...f, is_highlight: e.target.checked }))} /> Highlight</label>
          </div>
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Inhoud" rows={4} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none resize-none" />
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40" style={{ background: "hsl(var(--self-primary))" }}><Plus className="h-4 h-4" /> Voeg toe</button>
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
          {tab === "journal" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Vandaag" value={today.length} accent={SAGE} />
                <Stat label="Highlights" value={highlights.length} accent="hsl(var(--self-accent-deep))" />
                <Stat label="Totaal" value={entries.length} accent={SAGE} />
              </div>
              <div className="space-y-2">
                {entries.length ? entries.slice(0, 20).map((e) => (
                  <Card key={e.id} accent={journalTypeColor(e.type)}>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(255,255,255,0.08)", color: journalTypeColor(e.type) }}>{journalTypeLabel(e.type)}</span>
                      {e.is_highlight && <Star className="w-3 h-3 shrink-0" style={{ color: SAGE }} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        {e.content && <p className="text-[11px] text-muted-foreground truncate">{e.content}</p>}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{fmtDate(e.date)}</span>
                    </div>
                  </Card>
                )) : <Empty text="Je journal is leeg — voeg je eerste entry toe." />}
              </div>
            </div>
          )}

          {tab === "today" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">De actuele dag.</p>
              <div className="space-y-2">
                {today.length ? today.map((e) => (
                  <Card key={e.id} accent={journalTypeColor(e.type)}>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: journalTypeColor(e.type) }}>{journalTypeLabel(e.type)}</span>
                      <p className="text-sm font-medium flex-1">{e.title}</p>
                      <span className="text-[10px] text-muted-foreground">{fmtTime(e.date)}</span>
                    </div>
                    {e.content && <p className="text-xs text-muted-foreground mt-1">{e.content}</p>}
                  </Card>
                )) : <Empty text="Vandaag is nog leeg." />}
              </div>
            </div>
          )}

          {tab === "timeline" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Chronologische momenten.</p>
              <div className="space-y-2">
                {timeline.length ? timeline.map((e) => (
                  <div key={e.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ background: journalTypeColor(e.type) }} />
                      <span className="w-px flex-1 bg-border mt-1" />
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-[11px] text-muted-foreground">{fmtDate(e.date)} · {fmtTime(e.date)}</p>
                      {e.content && <p className="text-xs text-muted-foreground mt-1">{e.content}</p>}
                    </div>
                  </div>
                )) : <Empty text="Nog geen momenten op de tijdlijn." />}
              </div>
            </div>
          )}

          {tab === "highlights" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.length ? highlights.map((h) => (
                <GlassPanel key={h.id} level={2} className="p-5">
                  <Star className="w-5 h-5 mb-2" style={{ color: SAGE }} />
                  <h3 className="text-lg font-display font-semibold">{h.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{fmtDate(h.date)}</p>
                  {h.content && <p className="text-sm text-muted-foreground mt-2">{h.content}</p>}
                </GlassPanel>
              )) : <Empty text="Nog geen highlights." />}
            </div>
          )}

          {tab === "reflection" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Reflectie op de dag.</p>
              <div className="space-y-2">
                {reflections.length ? reflections.map((r) => (
                  <Card key={r.id} accent="hsl(var(--self-accent-deep))">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground">{fmtDate(r.date)}</p>
                    {r.content && <p className="text-sm text-muted-foreground mt-2 italic">"{r.content}"</p>}
                  </Card>
                )) : <Empty text="Nog geen reflecties — sluit je dag af met een reflectie." />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}