import React, { useMemo } from "react";
import { Pencil, Check, Trash2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";

const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const effDate = (o) => o?.next_payment_date || o?.due_date;

/** LastenManageList — beheerlijst met ALLE openstaande vaste lasten (ongeacht
 *  de maand). Bewerk opent de expense-stage; Betaald voert de volledige
 *  betaling uit (status done + saldo uit wallet + transactie); Verwijder
 *  verwijdert de last. */
export default function LastenManageList({ expenses, portfolios, onReload, onDeleteExpense }) {
  const { toast } = useToast();
  const pots = useMemo(() => (portfolios || []).filter((p) => !p.archived), [portfolios]);
  const colorOf = (pid) => pots.find((p) => p.id === pid)?.color || "hsl(var(--smoke))";
  const nameOf = (pid) => pots.find((p) => p.id === pid)?.name || "—";

  const list = useMemo(() => {
    return (expenses || [])
      .filter((e) => (e.status || "open") !== "done" && e.frequency && e.frequency !== "once")
      .sort((a, b) => (effDate(a) || "").localeCompare(effDate(b) || ""));
  }, [expenses]);

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
      onReload && onReload();
      window.dispatchEvent(new CustomEvent("giulia:admin-reload"));
    } catch {
      toast({ title: "Betaling mislukt", variant: "destructive" });
    }
  };

  return (
    <div className="w-full rounded-[20px] graph-paper overflow-hidden" style={{ boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" }}>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: MUTED }}>Alle vaste lasten · beheren</p>
          <p className="text-base font-display font-bold mt-0.5" style={{ color: INK }}>{list.length} open lasten</p>
        </div>
        <button onClick={nieuw} className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.06] hover:bg-foreground/[0.1] px-3 py-1.5 text-[11px] font-bold transition">
          <Plus className="w-3.5 h-3.5" /> Nieuw
        </button>
      </div>
      <div className="px-3 pb-3 max-h-[420px] overflow-y-auto no-scrollbar">
        {list.length === 0 && <p className="text-xs italic px-2 py-4" style={{ color: MUTED }}>Geen openstaande vaste lasten.</p>}
        <div className="space-y-1.5">
          {list.map((e) => (
            <div key={e.id} className="flex items-center gap-2 rounded-xl bg-foreground/[0.04] px-2.5 py-2">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: colorOf(e.portfolio_id) }} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-display font-semibold truncate" style={{ color: INK }}>{e.title}</p>
                <p className="text-[10px]" style={{ color: MUTED }}>{nameOf(e.portfolio_id)} · {FREQ_LABELS[e.frequency] || e.frequency}{effDate(e) ? ` · ${effDate(e)}` : ""}</p>
              </div>
              <span className="text-[13px] font-mono tabular-nums font-bold shrink-0" style={{ color: INK }}>{fmtEuro(e.expected_amount || 0)}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => edit(e)} title="Bewerk" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-foreground/10 transition" style={{ color: MUTED }}><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => pay(e)} title="Betaald" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-foreground/10 transition" style={{ color: MUTED }}><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => onDeleteExpense && onDeleteExpense(e)} title="Verwijder" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-destructive/15 transition" style={{ color: MUTED }}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}