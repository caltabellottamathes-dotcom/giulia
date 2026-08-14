import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionLabel, Empty, Card, ActionBtn } from "./previewParts";
import { Plus, Check, Bell, FileText } from "lucide-react";

const BLUE = "hsl(var(--life-blue))";
const SAND = "hsl(var(--life-sand))";
const iso = (d) => d.toISOString().slice(0, 10);

const TYPES = [
  { v: "payment", l: "Betaling" }, { v: "insurance", l: "Verzekering" },
  { v: "contract", l: "Contract" }, { v: "renewal", l: "Verlenging" }, { v: "subscription", l: "Abonnement" },
];

/** Personal Admin panel — AdminObligation + gekoppelde Tasks/Documents. */
export default function PersonalAdminPreview() {
  const [obligations, setObligations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", type: "payment", due_date: "", amount: "" });

  const load = async () => {
    try {
      const [o, d] = await Promise.all([
        base44.entities.AdminObligation.list("due_date").catch(() => []),
        base44.entities.Document.list().catch(() => []),
      ]);
      setObligations(o || []); setDocuments(d || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const today = iso(new Date());
  const soon = useMemo(() => (obligations || []).filter((o) => o.status !== "done").sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999")), [obligations]);

  const add = async () => {
    if (!form.title.trim()) return;
    try { await base44.entities.AdminObligation.create({ title: form.title.trim(), type: form.type, due_date: form.due_date || undefined, amount: form.amount ? Number(form.amount) : undefined, status: "open" }); setForm({ title: "", type: "payment", due_date: "", amount: "" }); setShowAdd(false); await load(); } catch { /* ignore */ }
  };
  const done = async (o) => { try { await base44.entities.AdminObligation.update(o.id, { status: "done" }); await load(); } catch { /* ignore */ } };
  const remind = async (o) => { try { await base44.entities.Task.create({ title: o.title, domain: "life", deadline: o.due_date, status: "today", priority: "high" }); } catch { /* ignore */ } };
  const linkDoc = async (o, docId) => { try { await base44.entities.AdminObligation.update(o.id, { document_id: docId }); await load(); } catch { /* ignore */ } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Persoonlijk Admin</SectionLabel>
        <button onClick={() => setShowAdd((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-charcoal transition" style={{ background: SAND }}><Plus className="w-3.5 h-3.5" /> Toevoegen</button>
      </div>

      {showAdd && (
        <div className="rounded-2xl glass-card-2 p-4 space-y-3 animate-fade-up">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Wat moet geregeld?" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory outline-none">
              {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
            <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className="rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory outline-none" />
          </div>
          <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Bedrag (optioneel)" className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
          <button onClick={add} disabled={!form.title.trim()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-40 transition" style={{ background: SAND }}><Plus className="w-4 h-4" /> Voeg toe</button>
        </div>
      )}

      {loading ? <Empty text="Laden…" /> : soon.length ? (
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 -mr-1">
          {soon.map((o) => (
            <Card key={o.id} accent={o.due_date && o.due_date < today ? SAND : BLUE}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-ivory flex-1 truncate">{o.title}</p>
                <span className="text-[9px] uppercase tracking-wide text-ivory/40">{o.type}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                {o.due_date && <p className={`text-[11px] ${o.due_date < today ? "" : "text-ivory/45"}`} style={o.due_date < today ? { color: SAND } : {}}>t/m {o.due_date}</p>}
                {o.amount != null && <p className="text-[11px] text-ivory/45 tabular-nums">€{o.amount}</p>}
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <ActionBtn label="Herinnering" icon={Bell} onClick={() => remind(o)} />
                <ActionBtn label="Afgerond" icon={Check} onClick={() => done(o)} />
                <select value={o.document_id || ""} onChange={(e) => linkDoc(o, e.target.value)} className="ml-auto rounded-full bg-white/5 border border-white/15 px-2 py-1 text-[10px] text-ivory/70 outline-none">
                  <option value="">Document</option>
                  {documents.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </Card>
          ))}
        </div>
      ) : <Empty text="Admin is bij" />}
    </div>
  );
}