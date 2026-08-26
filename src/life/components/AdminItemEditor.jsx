import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassButton from "@/system/components/glass/GlassButton";
import { logLifeActivity } from "@/lib/lifeActivity";

const TYPES = [
  { v: "payment", l: "Betaling" },
  { v: "insurance", l: "Verzekering" },
  { v: "contract", l: "Contract" },
  { v: "renewal", l: "Verlenging" },
  { v: "subscription", l: "Abonnement" },
];
const RECURRENCE = [
  { v: "none", l: "Eenmalig" },
  { v: "monthly", l: "Maandelijks" },
  { v: "quarterly", l: "Per kwartaal" },
  { v: "annual", l: "Jaarlijks" },
];
const STATUS = [
  { v: "open", l: "Open" },
  { v: "done", l: "Afgerond" },
  { v: "overdue", l: "Te laat" },
];

const inputCls = "w-full rounded-xl glass-1 px-3 py-2.5 text-sm outline-none focus:border-olive transition";
const labelCls = "text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-1.5 block";

export default function AdminItemEditor({ open, item, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const isNew = !item?.id;

  useEffect(() => {
    if (open) {
      setForm(
        item
          ? { ...item, amount: item.amount ?? "", due_date: item.due_date || "" }
          : { title: "", type: "payment", amount: "", due_date: "", recurrence: "none", status: "open", notes: "" }
      );
    }
  }, [open, item]);

  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title?.trim()) return;
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type || "payment",
        amount: form.amount === "" ? null : Number(form.amount),
        due_date: form.due_date || null,
        recurrence: form.recurrence || "none",
        status: form.status || "open",
        notes: form.notes || "",
      };
      if (isNew) {
        await base44.entities.AdminObligation.create(payload);
        await logLifeActivity("Admin", "created", `${payload.title} toegevoegd`);
      } else {
        await base44.entities.AdminObligation.update(item.id, payload);
        await logLifeActivity("Admin", "updated", `${payload.title} bewerkt`);
      }
      onSaved?.();
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    if (isNew) { onClose?.(); return; }
    setBusy(true);
    try {
      await base44.entities.AdminObligation.delete(item.id);
      await logLifeActivity("Admin", "deleted", `${item.title} verwijderd`);
      onDeleted?.();
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "-100%" }} animate={{ x: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-0 top-0 bottom-0 w-full max-w-md glass-2 rounded-r-[32px] p-6 overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 left-4 inline-flex items-center justify-center w-9 h-9 rounded-full glass-1 hover:bg-foreground/10 transition">
          <X className="w-4 h-4" />
        </button>

        <div className="mt-10 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">{isNew ? "Nieuwe vaste last" : "Item bewerken"}</p>
            <h2 className="text-2xl font-display font-semibold mt-1">{isNew ? "Toevoegen" : form.title || "Bewerken"}</h2>
          </div>

          <div>
            <label className={labelCls}>Titel</label>
            <input value={form.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="bv. Huur, Verzekering, Abonnement" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Type</label>
              <select value={form.type || "payment"} onChange={(e) => set("type", e.target.value)} className={inputCls}>
                {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Frequentie</label>
              <select value={form.recurrence || "none"} onChange={(e) => set("recurrence", e.target.value)} className={inputCls}>
                {RECURRENCE.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Bedrag (€)</label>
              <input type="number" step="0.01" value={form.amount ?? ""} onChange={(e) => set("amount", e.target.value)} placeholder="0,00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Betaaldatum</label>
              <input type="date" value={form.due_date || ""} onChange={(e) => set("due_date", e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status || "open"} onChange={(e) => set("status", e.target.value)} className={inputCls}>
              {STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Notities</label>
            <textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Begunstigde, referentie, rekeningnummer…" className={`${inputCls} resize-none`} />
          </div>

          <div className="flex gap-2 pt-2">
            <GlassButton variant="primary" size="sm" disabled={busy || !form.title?.trim()} onClick={save}>
              <Check className="w-3.5 h-3.5 mr-1.5" />{busy ? "Opslaan…" : "Opslaan"}
            </GlassButton>
            {!isNew && (
              <GlassButton variant="glass" size="sm" disabled={busy} onClick={del}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />Verwijderen
              </GlassButton>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}