import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import GlassButton from "@/system/components/glass/GlassButton";
import { logLifeActivity } from "@/lib/lifeActivity";
import { FREQ_LABELS } from "@/lib/financeUtils";

const KINDS = [
  { v: "vaste_last", l: "Vaste last" },
  { v: "onvoorzien", l: "Onvoorzien" },
  { v: "sparen", l: "Sparen" },
];
const PRIORITIES = [
  { v: "low", l: "Laag" },
  { v: "medium", l: "Gemiddeld" },
  { v: "high", l: "Hoog" },
];
const COLORS = ["#b1bec6", "#d8dab3", "#cfd9dd", "#dfe0db", "#86837c", "#94925d", "#d5e24a"];

const inputCls = "w-full rounded-xl glass-1 px-3 py-2.5 text-sm outline-none focus:border-olive transition";
const labelCls = "text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-1.5 block";

export default function PortfolioEditor({ open, item, onClose, onSaved, onDeleted }) {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const isNew = !item?.id;

  useEffect(() => {
    if (open) {
      setForm(
        item
          ? { ...item }
          : { name: "", color: "#b1bec6", kind: "vaste_last", category: "", goal: "", current_balance: "", target_balance: "", desired_buffer: "", monthly_reservation_actual: "", payment_frequency: "monthly", priority: "medium", notes: "", active: true }
      );
    }
  }, [open, item]);

  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v) => (v === "" || v === undefined || v === null ? null : Number(v));

  const save = async () => {
    if (!form.name?.trim()) return;
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        color: form.color || "#b1bec6",
        kind: form.kind || "vaste_last",
        category: form.category || "",
        goal: form.goal || "",
        current_balance: num(form.current_balance) ?? 0,
        target_balance: num(form.target_balance) ?? 0,
        desired_buffer: num(form.desired_buffer) ?? 0,
        monthly_reservation_actual: num(form.monthly_reservation_actual) ?? 0,
        payment_frequency: form.payment_frequency || "monthly",
        priority: form.priority || "medium",
        notes: form.notes || "",
        active: form.active !== false,
      };
      if (form.kind === "sparen") {
        payload.savings_target_amount = num(form.savings_target_amount);
        payload.savings_target_date = form.savings_target_date || null;
        payload.target_balance = num(form.savings_target_amount) ?? (num(form.target_balance) ?? 0);
      }
      if (isNew) {
        await base44.entities.Portfolio.create(payload);
        await logLifeActivity("Finance", "created", `Portefeuille ${payload.name} aangemaakt`);
      } else {
        await base44.entities.Portfolio.update(item.id, payload);
        await logLifeActivity("Finance", "updated", `Portefeuille ${payload.name} bewerkt`);
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
      await base44.entities.Portfolio.update(item.id, { archived: true, active: false });
      await logLifeActivity("Finance", "archived", `Portefeuille ${item.name} gearchiveerd`);
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
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">{isNew ? "Nieuwe portefeuille" : "Portefeuille bewerken"}</p>
            <h2 className="text-2xl font-display font-semibold mt-1">{isNew ? "Toevoegen" : form.name || "Bewerken"}</h2>
          </div>

          <div>
            <label className={labelCls}>Naam</label>
            <input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="bv. Woonkosten, Verzekering auto" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Kleur</label>
            <div className="flex flex-wrap items-center gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => set("color", c)} title={c} className={`h-7 w-7 rounded-full transition ${form.color === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : "ring-1 ring-foreground/15"}`} style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Soort</label>
              <select value={form.kind || "vaste_last"} onChange={(e) => set("kind", e.target.value)} className={inputCls}>
                {KINDS.map((k) => <option key={k.v} value={k.v}>{k.l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Categorie</label>
              <input value={form.category || ""} onChange={(e) => set("category", e.target.value)} placeholder="Wonen, Verzekering…" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Doel</label>
            <input value={form.goal || ""} onChange={(e) => set("goal", e.target.value)} placeholder="Waarvoor is deze pot?" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Huidig saldo (€)</label>
              <input type="number" step="0.01" value={form.current_balance ?? ""} onChange={(e) => set("current_balance", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Gewenst saldo (€)</label>
              <input type="number" step="0.01" value={form.target_balance ?? ""} onChange={(e) => set("target_balance", e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Gewenste buffer (€)</label>
              <input type="number" step="0.01" value={form.desired_buffer ?? ""} onChange={(e) => set("desired_buffer", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Reservering / mnd (€)</label>
              <input type="number" step="0.01" value={form.monthly_reservation_actual ?? ""} onChange={(e) => set("monthly_reservation_actual", e.target.value)} placeholder="laat leeg = aanbevolen" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Betalingsfrequentie</label>
              <select value={form.payment_frequency || "monthly"} onChange={(e) => set("payment_frequency", e.target.value)} className={inputCls}>
                {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Prioriteit</label>
              <select value={form.priority || "medium"} onChange={(e) => set("priority", e.target.value)} className={inputCls}>
                {PRIORITIES.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
          </div>

          {form.kind === "sparen" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Spaardoel (€)</label>
                <input type="number" step="0.01" value={form.savings_target_amount ?? ""} onChange={(e) => set("savings_target_amount", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Gewenste einddatum</label>
                <input type="date" value={form.savings_target_date || ""} onChange={(e) => set("savings_target_date", e.target.value)} className={inputCls} />
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Notities</label>
            <textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div className="flex gap-2 pt-2">
            <GlassButton variant="primary" size="sm" disabled={busy || !form.name?.trim()} onClick={save}><Check className="w-3.5 h-3.5 mr-1.5" />{busy ? "Opslaan…" : "Opslaan"}</GlassButton>
            {!isNew && <GlassButton variant="glass" size="sm" disabled={busy} onClick={del}><Trash2 className="w-3.5 h-3.5 mr-1.5" />Archiveren</GlassButton>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}