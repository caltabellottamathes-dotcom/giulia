import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHero from "@/components/glass/PageHero";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { tagDomain } from "@/lib/domainUtils";
import { Home, Plus, Check, Clock } from "lucide-react";

const CATEGORIES = [
  { v: "household", l: "Schoonmaak / huis" },
  { v: "grocery", l: "Boodschappen" },
  { v: "maintenance", l: "Onderhoud" },
  { v: "routine", l: "Terugkerende routine" },
  { v: "other", l: "Overig" },
];

export default function HouseholdPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", category: "household", deadline: "" });

  const load = async () => {
    try { const t = await base44.entities.Task.list("deadline").catch(() => []); setTasks(t || []); } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const allHousehold = useMemo(() => (tasks || []).filter((t) => t.domain === "life" && t.category === "household"), [tasks]);
  const open = allHousehold.filter((t) => t.status !== "completed" && t.status !== "archived");
  const done = allHousehold.filter((t) => t.status === "completed");
  const grouped = useMemo(() => {
    const m = {}; open.forEach((t) => { (m[t.category || "other"] = m[t.category || "other"] || []).push(t); });
    return m;
  }, [open]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.Task.create({ title: form.title.trim(), domain: "life", category: form.category, deadline: form.deadline || undefined, status: "today", priority: "medium" }); setForm({ title: "", category: "household", deadline: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const complete = async (t) => { try { await base44.entities.Task.update(t.id, { status: "completed" }); await load(); } catch { /* ignore */ } };

  const catLabel = (v) => CATEGORIES.find((c) => c.v === v)?.l || "Overig";

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-household" image={IMAGES.notebookChair} icon={Home} eyebrow="LIFE" title="Huishouden" subtitle="Schoonmaak, boodschappen, onderhoud en routines op orde"
        actions={<GlassButton variant="primary" size="md" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Toevoegen</GlassButton>} />

      <div className="grid sm:grid-cols-3 gap-3">
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Open</p><p className="text-3xl font-display font-semibold mt-1 text-life-blue">{open.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Afgerond</p><p className="text-3xl font-display font-semibold mt-1">{done.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Categorieën</p><p className="text-3xl font-display font-semibold mt-1">{Object.keys(grouped).length}</p></GlassPanel>
      </div>

      {showAdd && (
        <GlassPanel level={2} className="p-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Huishoudtaak toevoegen</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Taak (bv. badkamer schoonmaken)" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue">
              {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
            </select>
          </div>
          <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className="mt-4 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
          <button onClick={add} disabled={!form.title.trim()} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40" style={{ background: "hsl(var(--life-blue-deep))" }}><Plus className="w-4 w-4" /> Voeg toe</button>
        </GlassPanel>
      )}

      {loading ? <p className="text-sm text-muted-foreground">Laden…</p> : open.length ? (
        Object.entries(grouped).map(([cat, items]) => (
          <GlassPanel level={2} className="p-6" key={cat}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">{catLabel(cat)} <span className="text-foreground/40">· {items.length}</span></p>
            <div className="divide-y divide-border/30">
              {items.map((t) => (
                <div key={t.id} className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    {t.deadline && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> t/m {t.deadline}</p>}
                  </div>
                  <button onClick={() => complete(t)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ivory transition" style={{ background: "hsl(var(--life-blue))" }}><Check className="w-3.5 h-3.5" /> Afronden</button>
                </div>
              ))}
            </div>
          </GlassPanel>
        ))
      ) : (
        <GlassPanel level={2} className="p-12 text-center"><p className="text-sm text-muted-foreground">Het huis is op orde.</p></GlassPanel>
      )}

      {done.length > 0 && (
        <GlassPanel level={2} className="p-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Geschiedenis</p>
          <div className="divide-y divide-border/20">
            {done.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center py-2.5">
                <p className="text-sm flex-1 truncate text-muted-foreground line-through">{t.title}</p>
                <Check className="w-4 h-4 text-life-blue" />
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}