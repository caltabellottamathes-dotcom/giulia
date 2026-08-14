import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHero from "@/components/glass/PageHero";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { ClipboardList, Plus, Check, Bell, FileText } from "lucide-react";

const TYPES = [
  { v: "payment", l: "Betaling" }, { v: "insurance", l: "Verzekering" },
  { v: "contract", l: "Contract" }, { v: "renewal", l: "Verlenging" }, { v: "subscription", l: "Abonnement" },
];
const RECURRENCE = [{ v: "none", l: "Eenmalig" }, { v: "monthly", l: "Maandelijks" }, { v: "quarterly", l: "Kwartaal" }, { v: "annual", l: "Jaarlijks" }];
const iso = (d) => d.toISOString().slice(0, 10);
const typeLabel = (v) => TYPES.find((t) => t.v === v)?.l || v;

export default function PersonalAdminPage() {
  const [obligations, setObligations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "payment", due_date: "", amount: "", recurrence: "none" });

  const load = async () => {
    try {
      const [o, d] = await Promise.all([base44.entities.AdminObligation.list("due_date").catch(() => []), base44.entities.Document.list().catch(() => [])]);
      setObligations(o || []); setDocuments(d || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const today = iso(new Date());
  const open = useMemo(() => (obligations || []).filter((o) => o.status !== "done"), [obligations]);
  const dueSoon = open.filter((o) => o.due_date && new Date(o.due_date) <= new Date(Date.now() + 14 * 86400000));
  const overdue = open.filter((o) => o.due_date && o.due_date < today);
  const totalAmount = open.reduce((s, o) => s + (o.amount || 0), 0);
  const grouped = useMemo(() => { const m = {}; open.forEach((o) => { (m[o.type || "other"] = m[o.type || "other"] || []).push(o); }); return m; }, [open]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.AdminObligation.create({ title: form.title.trim(), type: form.type, due_date: form.due_date || undefined, amount: form.amount ? Number(form.amount) : undefined, recurrence: form.recurrence, status: "open" }); setForm({ title: "", type: "payment", due_date: "", amount: "", recurrence: "none" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const done = async (o) => { try { await base44.entities.AdminObligation.update(o.id, { status: "done" }); await load(); } catch { /* ignore */ } };
  const remind = async (o) => { try { await base44.entities.Task.create({ title: o.title, domain: "life", deadline: o.due_date, status: "today", priority: "high" }); } catch { /* ignore */ } };
  const linkDoc = async (o, docId) => { try { await base44.entities.AdminObligation.update(o.id, { document_id: docId }); await load(); } catch { /* ignore */ } };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero page="life-personal-admin" image={IMAGES.personClipboard} icon={ClipboardList} eyebrow="LIFE" title="Persoonlijk Admin" subtitle="Betalingen, verzekeringen, contracten en terugkerende verplichtingen"
        actions={<GlassButton variant="primary" size="md" onClick={() => setShowAdd((v) => !v)}><Plus className="h-4 w-4" /> Toevoegen</GlassButton>} />

      <div className="grid sm:grid-cols-4 gap-3">
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Binnen 14 dagen</p><p className="text-3xl font-display font-semibold mt-1 text-life-blue">{dueSoon.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Te laat</p><p className="text-3xl font-display font-semibold mt-1 text-life-sand">{overdue.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Openstaand</p><p className="text-3xl font-display font-semibold mt-1">{open.length}</p></GlassPanel>
        <GlassPanel level={2} className="p-4"><p className="text-xs text-muted-foreground">Totaal bedrag</p><p className="text-3xl font-display font-semibold mt-1">€{totalAmount.toLocaleString("nl-NL")}</p></GlassPanel>
      </div>

      {showAdd && (
        <GlassPanel level={2} className="p-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">Verplichting toevoegen</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Wat moet geregeld?" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue">{TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}</select>
            <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
            <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Bedrag €" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue" />
            <select value={form.recurrence} onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value }))} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-life-blue sm:col-span-2">{RECURRENCE.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}</select>
          </div>
          <button onClick={add} disabled={!form.title.trim()} className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-40" style={{ background: "hsl(var(--life-sand))", color: "hsl(var(--charcoal))" }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </GlassPanel>
      )}

      {loading ? <p className="text-sm text-muted-foreground">Laden…</p> : Object.keys(grouped).length ? (
        Object.entries(grouped).map(([type, items]) => (
          <GlassPanel level={2} className="p-6" key={type}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">{typeLabel(type)} <span className="text-foreground/40">· {items.length}</span></p>
            <div className="divide-y divide-border/30">
              {items.map((o) => (
                <div key={o.id} className="flex items-center gap-4 py-3 flex-wrap">
                  <div className="flex-1 min-w-[160px]">
                    <p className="text-sm font-medium truncate">{o.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {o.due_date && <p className="text-xs" style={{ color: o.due_date < today ? "hsl(var(--life-sand))" : "hsl(var(--muted-foreground))" }}>t/m {o.due_date}</p>}
                      {o.amount != null && <p className="text-xs text-muted-foreground tabular-nums">€{o.amount}</p>}
                      {o.recurrence && o.recurrence !== "none" && <p className="text-xs text-muted-foreground">{o.recurrence}</p>}
                    </div>
                  </div>
                  <button onClick={() => remind(o)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-life-blue"><Bell className="w-3.5 h-3.5" /> Herinnering</button>
                  <select value={o.document_id || ""} onChange={(e) => linkDoc(o, e.target.value)} className="rounded-full border border-border bg-background px-2 py-1.5 text-xs outline-none">
                    <option value="">Document</option>
                    {documents.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button onClick={() => done(o)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ivory" style={{ background: "hsl(var(--life-blue))" }}><Check className="w-3.5 h-3.5" /> Klaar</button>
                </div>
              ))}
            </div>
          </GlassPanel>
        ))
      ) : <GlassPanel level={2} className="p-12 text-center"><p className="text-sm text-muted-foreground">Admin is bij — niets openstaand.</p></GlassPanel>}
    </div>
  );
}