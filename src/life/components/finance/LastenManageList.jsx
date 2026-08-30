import React, { useMemo } from "react";
import { ArrowLeft, Pencil, Check, Trash2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { useToast } from "@/components/ui/use-toast";
import { fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";

const effDate = (o) => o?.next_payment_date || o?.due_date;
const input = "w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm text-ivory placeholder-ivory/40 outline-none focus:border-white/30";

/** LastenManageList — stage-versie (donker glas). Beheer ALLE openstaande
 *  vaste lasten: bewerk (→ expense-stage), betaald (volledige betaling:
 *  status done + saldo uit wallet + transactie), verwijder, nieuw. */
export default function LastenManageList({ onClose }) {
  const { toast } = useToast();
  const { data: portfolios } = useEntityList("Portfolio", { sort: "order", limit: 50, realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { limit: 500, realtime: true });

  const pots = useMemo(() => (portfolios || []).filter((p) => !p.archived), [portfolios]);
  const colorOf = (pid) => pots.find((p) => p.id === pid)?.color || "hsl(var(--smoke))";
  const nameOf = (pid) => pots.find((p) => p.id === pid)?.name || "—";

  const list = useMemo(() => {
    return (expenses || [])
      .filter((e) => (e.status || "open") !== "done" && e.frequency && e.frequency !== "once")
      .sort((a, b) => (effDate(a) || "").localeCompare(effDate(b) || ""));
  }, [expenses]);

  const reload = () => window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
  const edit = (e) => window.dispatchEvent(new CustomEvent("giulia:open-expense", { detail: e.id }));
  const nieuw = () => window.dispatchEvent(new CustomEvent("giulia:open-expense", { detail: "new" }));

  const pay = async (e) => {
    const a = Number(e.expected_amount ?? e.amount) || 0;
    try {
      await base44.entities.AdminObligation.update(e.id, { status: "done", last_payment_date: new Date().toISOString().slice(0, 10), actual_amount: a });
      if (e.portfolio_id) {
        try {
          const pot = await base44.entities.Portfolio.get(e.portfolio_id);
          const nb = (Number(pot?.current_balance) || 0) - a;
          await base44.entities.Portfolio.update(e.portfolio_id, { current_balance: Math.round(nb * 100) / 100 });
        } catch {}
      }
      await base44.entities.Transaction.create({ portfolio_id: e.portfolio_id, expense_id: e.id, type: "expense", amount: a, status: "completed", date: new Date().toISOString().slice(0, 10), note: `Betaald · ${e.title}` });
      toast({ title: "Betaald", description: `${e.title} · ${fmtEuro(a)}` });
      reload();
    } catch {
      toast({ title: "Betaling mislukt", variant: "destructive" });
    }
  };

  const del = async (e) => {
    try { await base44.entities.AdminObligation.delete(e.id); toast({ title: "Verwijderd" }); reload(); }
    catch { toast({ title: "Verwijderen mislukt", variant: "destructive" }); }
  };

  return (
    <div className="h-full flex flex-col text-ivory">
      <div className="flex items-center justify-between p-3 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-bold text-ivory/80 hover:text-ivory transition">
          <ArrowLeft className="h-3.5 w-3.5" /> terug
        </button>
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold">Alle vaste lasten</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-3 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[18px] font-display font-bold tracking-[-0.02em] leading-tight">Beheer alle lasten</p>
            <p className="text-[11px] text-ivory/60">{list.length} openstaande vaste lasten</p>
          </div>
          <button onClick={nieuw} className="inline-flex items-center gap-1.5 rounded-full bg-ivory/15 hover:bg-ivory/25 px-3 py-1.5 text-[11px] font-bold transition border border-white/15">
            <Plus className="w-3.5 h-3.5" /> Nieuw
          </button>
        </div>

        <div className="space-y-1.5">
          {list.length === 0 && <p className="text-[11px] text-ivory/50 italic">Geen openstaande vaste lasten.</p>}
          {list.map((e) => (
            <div key={e.id} className="flex items-center gap-2 rounded-xl bg-white/8 border border-white/10 px-2.5 py-2">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: colorOf(e.portfolio_id) }} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-display font-semibold truncate">{e.title}</p>
                <p className="text-[10px] text-ivory/55">{nameOf(e.portfolio_id)} · {FREQ_LABELS[e.frequency] || e.frequency}{effDate(e) ? ` · ${effDate(e)}` : ""}</p>
              </div>
              <span className="text-[13px] font-mono tabular-nums font-bold shrink-0">{fmtEuro(e.expected_amount || 0)}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => edit(e)} title="Bewerk" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition text-ivory/70"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => pay(e)} title="Betaald" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition text-ivory/70"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => del(e)} title="Verwijder" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-destructive/30 transition text-ivory/70"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}