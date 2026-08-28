import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";
import { useEntityList } from "@/hooks/useEntity";
import { useToast } from "@/components/ui/use-toast";
import StageSelect from "./StageSelect";

const TYPES = ["payment", "insurance", "contract", "renewal", "subscription"];
const FREQS = ["weekly", "biweekly", "monthly", "bimonthly", "quarterly", "semiannual", "annual", "once", "variable"];
const STATUSES = ["open", "done", "overdue"];
const CONFIDENCE = ["known", "estimated", "unknown"];

const input = "w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm text-ivory placeholder-ivory/40 outline-none focus:border-white/30";
const label = "text-[9px] uppercase tracking-[0.18em] text-ivory/60 font-semibold mb-1 block";
const sub = "text-[9px] text-ivory/50 mb-1 block";

const blank = { title: "", type: "payment", portfolio_id: "", frequency: "monthly", expected_amount: 0, next_payment_date: "", status: "open", auto_payment: false, confidence: "known", notes: "" };

/** ExpenseStage — toont alle data van één last (AdminObligation) en laat alles
 *  handmatig instellen/wijzigen. Modus "new" maakt een nieuwe last aan. */
export default function ExpenseStage({ expenseId, onClose }) {
  const { toast } = useToast();
  const { data: portfolios } = useEntityList("Portfolio", { sort: "order", limit: 50, realtime: true });
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const isCreate = expenseId === "new";

  const walletOptions = useMemo(() => (portfolios || []).filter((p) => !p.archived).map((p) => ({ value: p.id, label: p.name, color: p.color })), [portfolios]);
  const linkedWallet = (portfolios || []).find((p) => p.id === form.portfolio_id);

  useEffect(() => {
    if (!expenseId || isCreate) { setForm(blank); return; }
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const e = await base44.entities.AdminObligation.get(expenseId);
        if (!active) return;
        setForm({ ...blank, ...e });
      } catch { /* ignore */ }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [expenseId, isCreate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v) => (v === "" || v == null ? 0 : Number(v));

  const reload = () => window.dispatchEvent(new CustomEvent("giulia:admin-reload"));

  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form, expected_amount: num(form.expected_amount) };
      delete payload.id; delete payload.created_date; delete payload.updated_date; delete payload.created_by_id;
      if (isCreate) {
        const created = await base44.entities.AdminObligation.create(payload);
        toast({ title: "Last aangemaakt" });
        reload();
        onClose?.();
      } else {
        await base44.entities.AdminObligation.update(expenseId, payload);
        toast({ title: "Last opgeslagen" });
        reload();
      }
    } catch {
      toast({ title: "Opslaan mislukt", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    setBusy(true);
    try {
      await base44.entities.AdminObligation.delete(expenseId);
      toast({ title: "Last verwijderd" });
      reload();
      onClose?.();
    } catch {
      toast({ title: "Verwijderen mislukt", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-ivory/60"><div className="h-5 w-5 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>;
  }

  return (
    <div className="h-full flex flex-col text-ivory">
      <div className="flex items-center justify-between p-3 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-ivory/80 hover:text-ivory transition">
          <ArrowLeft className="h-3.5 w-3.5" /> terug
        </button>
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{isCreate ? "Nieuwe last" : form.type || "last"}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-4 space-y-5">
        <h2 className="text-[20px] font-display font-bold tracking-[-0.02em] leading-tight">{isCreate ? "Nieuwe last" : (form.title || "—")}</h2>
        {linkedWallet && <p className="text-[11px] text-ivory/60 -mt-3">{linkedWallet.name} · saldo {fmtEuro(linkedWallet.current_balance || 0)}</p>}

        <div className="space-y-2">
          <p className={label}>Identiteit</p>
          <input className={input} placeholder="Titel" value={form.title || ""} onChange={(e) => set("title", e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={sub}>Type</span>
              <StageSelect value={form.type || "payment"} onChange={(v) => set("type", v)} options={TYPES.map((t) => ({ value: t, label: t }))} />
            </div>
            <div>
              <span className={sub}>Wallet</span>
              <StageSelect value={form.portfolio_id || ""} onChange={(v) => set("portfolio_id", v)} options={walletOptions} placeholder="Geen wallet" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className={label}>Bedrag & planning</p>
          <div className="grid grid-cols-2 gap-2">
            <div><span className={sub}>Verwacht bedrag €</span><input type="number" step="0.01" className={input} value={form.expected_amount || 0} onChange={(e) => set("expected_amount", num(e.target.value))} /></div>
            <div>
              <span className={sub}>Frequentie</span>
              <StageSelect value={form.frequency || "monthly"} onChange={(v) => set("frequency", v)} options={FREQS.map((f) => ({ value: f, label: FREQ_LABELS[f] || f }))} />
            </div>
            <div><span className={sub}>Volgende betaaldatum</span><input type="date" className={input} value={form.next_payment_date || ""} onChange={(e) => set("next_payment_date", e.target.value)} /></div>
            <div>
              <span className={sub}>Status</span>
              <StageSelect value={form.status || "open"} onChange={(v) => set("status", v)} options={STATUSES.map((s) => ({ value: s, label: s }))} />
            </div>
            <div>
              <span className={sub}>Betrouwbaarheid</span>
              <StageSelect value={form.confidence || "known"} onChange={(v) => set("confidence", v)} options={CONFIDENCE.map((c) => ({ value: c, label: c }))} />
            </div>
            <div><span className={sub}>Volgorde</span><input type="number" className={input} value={form.order || 0} onChange={(e) => set("order", num(e.target.value))} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm mt-1 cursor-pointer">
            <input type="checkbox" checked={!!form.auto_payment} onChange={(e) => set("auto_payment", e.target.checked)} /> Automatische betaling
          </label>
        </div>

        <div className="space-y-2">
          <p className={label}>Notities</p>
          <textarea className={input} rows={3} value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>

      <div className="p-3 shrink-0 border-t border-white/10 flex gap-2">
        <button onClick={save} disabled={busy} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-ivory text-charcoal px-4 py-2.5 text-sm font-bold disabled:opacity-50 transition">
          {isCreate ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />}{busy ? "Bezig…" : isCreate ? "Aanmaken" : "Opslaan"}
        </button>
        {!isCreate && (
          <button onClick={del} disabled={busy} className="inline-flex items-center justify-center rounded-full bg-white/10 text-ivory px-4 py-2.5 text-sm font-bold disabled:opacity-50 transition" aria-label="Verwijderen">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}