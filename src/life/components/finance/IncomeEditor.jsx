import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassButton from "@/system/components/glass/GlassButton";
import { logLifeActivity } from "@/lib/lifeActivity";
import { FREQ_LABELS } from "@/lib/financeUtils";

const STATUS = [{ v: "expected", l: "Verwacht" }, { v: "received", l: "Ontvangen" }, { v: "partial", l: "Gedeeltelijk" }, { v: "missed", l: "Gemist" }];

const inputCls = "w-full rounded-xl glass-1 px-3 py-2.5 text-sm outline-none focus:border-olive transition";
const labelCls = "text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-1.5 block";

export default function IncomeEditor({ open, item, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const isNew = !item?.id;

  useEffect(() => {
    if (open) {
      setForm(item ? { ...item } : { description: "", amount: "", frequency: "monthly", expected_date: "", category: "", received_amount: "", status: "expected" });
    }
  }, [open, item]);

  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v) => (v === "" || v === undefined || v === null ? null : Number(v));

  const save = async () => {
    if (!form.amount) return;
    setBusy(true);
    try {
      const payload = {
        description: form.description || "",
        amount: num(form.amount) ?? 0,
        frequency: form.frequency || "monthly",
        expected_date: form.expected_date || null,
        category: form.category || "",
        received_amount: num(form.received_amount),
        status: form.status || "expected",
        recurring: form.frequency !== "once",
      };
      if (isNew) {
        await base44.entities.Income.create(payload);
        await logLifeActivity("Finance", "created", `Inkomen ${form.description || ""} toegevoegd`);
      } else {
        await base44.entities.Income.update(item.id, payload);
        await logLifeActivity("Finance", "updated", `Inkomen ${form.description || ""} bewerkt`);
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
      await base44.entities.Income.delete(item.id);
      await logLifeActivity("Finance", "deleted", `Inkomen verwijderd`);
      onDeleted?.();
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="absolute left-0 top-0 bottom-0 w-full max-w-md glass-2 rounded-r-[32px] p-6 overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 left-4 inline-flex items-center justify-center w-9 h-9 rounded-full glass-1 hover:bg-foreground/10 transition"><X className="w-4 h-4" /></button>
        <div className="mt-10 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">{isNew ? "Nieuwe inkomstenbron" : "Inkomen bewerken"}</p>
            <h2 className="text-2xl font-display font-semibold mt-1">{isNew ? "Toevoegen" : form.description || "Bewerken"}</h2>
          </div>

          <div>
            <label className={labelCls}>Bron / beschrijving</label>
            <input value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="bv. Salaris, Uitkering, Freelance" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Bedrag (€)</label>
              <input type="number" step="0.01" value={form.amount ?? ""} onChange={(e) => set("amount", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Frequentie</label>
              <select value={form.frequency || "monthly"} onChange={(e) => set("frequency", e.target.value)} className={inputCls}>
                {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Verwachte datum</label>
              <input type="date" value={form.expected_date || ""} onChange={(e) => set("expected_date", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Categorie</label>
              <input value={form.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="Salaris, Bijstand…" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Ontvangen bedrag (€)</label>
              <input type="number" step="0.01" value={form.received_amount ?? ""} onChange={(e) => set("received_amount", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status || "expected"} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <GlassButton variant="primary" size="sm" disabled={busy || !form.amount} onClick={save}><Check className="w-3.5 h-3.5 mr-1.5" />{busy ? "Opslaan…" : "Opslaan"}</GlassButton>
            {!isNew && <GlassButton variant="glass" size="sm" disabled={busy} onClick={del}><Trash2 className="w-3.5 h-3.5 mr-1.5" />Verwijderen</GlassButton>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}