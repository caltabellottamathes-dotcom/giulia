import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";
import StageSelect from "./StageSelect";

const KINDS = ["vaste_last", "onvoorzien", "sparen"];
const FREQS = ["weekly", "biweekly", "monthly", "bimonthly", "quarterly", "semiannual", "annual", "once", "variable"];
const STATUSES = ["safe", "on_track", "watch", "short", "critical"];
const PRIOS = ["low", "medium", "high"];

const input = "w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm text-ivory placeholder-ivory/40 outline-none focus:border-white/30";
const label = "text-[9px] uppercase tracking-[0.18em] text-ivory/60 font-semibold mb-1 block";
const sub = "text-[9px] text-ivory/50 mb-1 block";

/** WalletStage — toont alle informatie + data over één wallet én een complete
 *  inline editor. OS-stijl dropdowns (StageSelect). */
export default function WalletStage({ walletId, onClose }) {
  const { toast } = useToast();
  const [wallet, setWallet] = useState(null);
  const [form, setForm] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!walletId) return;
    let active = true;
    (async () => {
      try {
        const w = await base44.entities.Portfolio.get(walletId);
        if (!active) return;
        setWallet(w);
        setForm({ ...w });
        const [e, t] = await Promise.all([
          base44.entities.AdminObligation.filter({ portfolio_id: walletId }).catch(() => []),
          base44.entities.Transaction.filter({ portfolio_id: walletId }).catch(() => []),
        ]);
        if (!active) return;
        setExpenses(e || []);
        setTransactions(t || []);
      } catch { /* ignore */ }
    })();
    return () => { active = false; };
  }, [walletId]);

  if (!wallet || !form) {
    return <div className="h-full flex items-center justify-center text-ivory/60"><div className="h-5 w-5 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>;
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v) => (v === "" || v == null ? 0 : Number(v));
  const reload = () => window.dispatchEvent(new CustomEvent("giulia:admin-reload"));

  const save = async () => {
    setSaving(true);
    try {
      const updates = { ...form };
      delete updates.id; delete updates.created_date; delete updates.updated_date; delete updates.created_by_id;
      await base44.entities.Portfolio.update(walletId, updates);
      toast({ title: "Wallet opgeslagen" });
      setWallet({ ...wallet, ...updates });
      reload();
    } catch {
      toast({ title: "Opslaan mislukt", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col text-ivory">
      <div className="flex items-center justify-between p-3 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-ivory/80 hover:text-ivory transition">
          <ArrowLeft className="h-3.5 w-3.5" /> terug
        </button>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: form.color || "#999" }} />
          <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{form.kind || "wallet"}</span>
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-4 space-y-5">
        <h2 className="text-[20px] font-display font-bold tracking-[-0.02em] leading-tight">{form.name}</h2>

        <div className="space-y-2">
          <p className={label}>Identiteit</p>
          <input className={input} placeholder="Naam" value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={sub}>Kleur</span>
              <input type="color" value={form.color || "#999999"} onChange={(e) => set("color", e.target.value)} className="w-full h-9 rounded-xl bg-white/10 border border-white/15 cursor-pointer" />
            </div>
            <div>
              <span className={sub}>Soort</span>
              <StageSelect value={form.kind || "vaste_last"} onChange={(v) => set("kind", v)} options={KINDS.map((k) => ({ value: k, label: k }))} />
            </div>
          </div>
          <input className={input} placeholder="Categorie" value={form.category || ""} onChange={(e) => set("category", e.target.value)} />
          <input className={input} placeholder="Doel / goal" value={form.goal || ""} onChange={(e) => set("goal", e.target.value)} />
          <textarea className={input} rows={2} placeholder="Beschrijving" value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="space-y-2">
          <p className={label}>Saldi</p>
          <div className="grid grid-cols-2 gap-2">
            <div><span className={sub}>Huidig saldo</span><input type="number" step="0.01" className={input} value={form.current_balance || 0} onChange={(e) => set("current_balance", num(e.target.value))} /></div>
            <div><span className={sub}>Gewenst doel</span><input type="number" step="0.01" className={input} value={form.target_balance || 0} onChange={(e) => set("target_balance", num(e.target.value))} /></div>
            <div><span className={sub}>Gewenste buffer</span><input type="number" step="0.01" className={input} value={form.desired_buffer || 0} onChange={(e) => set("desired_buffer", num(e.target.value))} /></div>
            <div><span className={sub}>Reservering / mnd</span><input type="number" step="0.01" className={input} value={form.monthly_reservation_actual || 0} onChange={(e) => set("monthly_reservation_actual", num(e.target.value))} /></div>
          </div>
        </div>

        <div className="space-y-2">
          <p className={label}>Planning</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={sub}>Frequentie</span>
              <StageSelect value={form.payment_frequency || "monthly"} onChange={(v) => set("payment_frequency", v)} options={FREQS.map((f) => ({ value: f, label: FREQ_LABELS[f] || f }))} />
            </div>
            <div><span className={sub}>Volgende betaling €</span><input type="number" step="0.01" className={input} value={form.next_expected_payment || 0} onChange={(e) => set("next_expected_payment", num(e.target.value))} /></div>
            <div><span className={sub}>Volgende datum</span><input type="date" className={input} value={form.next_payment_date || ""} onChange={(e) => set("next_payment_date", e.target.value)} /></div>
            <div>
              <span className={sub}>Status</span>
              <StageSelect value={form.status || "on_track"} onChange={(v) => set("status", v)} options={STATUSES.map((s) => ({ value: s, label: s }))} />
            </div>
            <div>
              <span className={sub}>Prioriteit</span>
              <StageSelect value={form.priority || "medium"} onChange={(v) => set("priority", v)} options={PRIOS.map((p) => ({ value: p, label: p }))} />
            </div>
            <div><span className={sub}>Volgorde</span><input type="number" className={input} value={form.order || 0} onChange={(e) => set("order", num(e.target.value))} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm mt-1 cursor-pointer">
            <input type="checkbox" checked={form.active !== false} onChange={(e) => set("active", e.target.checked)} /> Actief
          </label>
        </div>

        <div className="space-y-2">
          <p className={label}>Notities</p>
          <textarea className={input} rows={3} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
        </div>

        <div className="space-y-2">
          <p className={label}>Vaste lasten · {expenses.length}</p>
          {expenses.length === 0 && <p className="text-[11px] text-ivory/50 italic">Geen vaste lasten gekoppeld.</p>}
          {expenses.map((e) => (
            <div key={e.id} className="flex justify-between text-[11px] rounded-lg bg-white/10 px-2.5 py-1.5">
              <span className="truncate">{e.title}</span>
              <span className="tabular-nums font-display font-semibold ml-2">{fmtEuro(e.expected_amount ?? e.amount)}</span>
            </div>
          ))}
          <p className={label + " pt-2"}>Transacties · {transactions.length}</p>
          {transactions.length === 0 && <p className="text-[11px] text-ivory/50 italic">Geen transacties.</p>}
          {transactions.map((t) => (
            <div key={t.id} className="flex justify-between text-[11px] rounded-lg bg-white/10 px-2.5 py-1.5">
              <span className="truncate capitalize">{t.note || t.type}</span>
              <span className="tabular-nums font-display font-semibold ml-2">{fmtEuro(t.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 shrink-0 border-t border-white/10">
        <button onClick={save} disabled={saving} className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-ivory text-charcoal px-4 py-2.5 text-sm font-bold disabled:opacity-50 transition">
          <Save className="w-4 h-4" />{saving ? "Opslaan…" : "Opslaan"}
        </button>
      </div>
    </div>
  );
}