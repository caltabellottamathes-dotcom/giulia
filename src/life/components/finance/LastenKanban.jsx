import React, { useMemo } from "react";
import { Plus, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";

const DAY = 86400000;
const CARD = { background: "#f5f5f4", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" };
const DUE_SOON_DAYS = 7;

const effDate = (e) => e.next_payment_date || e.due_date;
const daysUntil = (e) => { const d = effDate(e); return d ? Math.round((new Date(d).getTime() - Date.now()) / DAY) : null; };

/** LastenKanban — 3 kolommen: Alle lasten · Op komst · Betaald. Lasten schuiven
 *  automatisch naar "Op komst" wanneer ze bijna vervallen. "Betaald" knop:
 *  markeert de last done, trekt het bedrag van de juiste wallet af en logt een
 *  Transaction. Klik op een item opent de expense-stage. */
export default function LastenKanban({ expenses, portfolios, onReload }) {
  const { toast } = useToast();
  const colorOf = (id) => (portfolios || []).find((p) => p.id === id)?.color || "#9c9c9c";
  const potName = (id) => (portfolios || []).find((p) => p.id === id)?.name || "";

  const { all, coming, paid } = useMemo(() => {
    const all = [], coming = [], paid = [];
    for (const e of expenses || []) {
      if (e.status === "done") { paid.push(e); continue; }
      const d = daysUntil(e);
      if (d != null && d <= DUE_SOON_DAYS) coming.push(e);
      else all.push(e);
    }
    const byDue = (a, b) => (daysUntil(a) ?? 9999) - (daysUntil(b) ?? 9999);
    all.sort(byDue); coming.sort(byDue);
    return { all, coming, paid };
  }, [expenses]);

  const openExpense = (id) => window.dispatchEvent(new CustomEvent("giulia:open-expense", { detail: id }));

  const pay = async (e) => {
    const amt = Number(e.expected_amount ?? e.amount) || 0;
    const today = new Date().toISOString().slice(0, 10);
    try {
      await base44.entities.AdminObligation.update(e.id, { status: "done", last_payment_date: today, actual_amount: amt });
      if (e.portfolio_id) {
        const pot = portfolios.find((p) => p.id === e.portfolio_id);
        if (pot) await base44.entities.Portfolio.update(e.portfolio_id, { current_balance: (Number(pot.current_balance) || 0) - amt });
      }
      await base44.entities.Transaction.create({ portfolio_id: e.portfolio_id, expense_id: e.id, type: "expense", amount: amt, status: "completed", date: today, note: `Betaald: ${e.title}` });
      toast({ title: "Betaald", description: `${fmtEuro(amt)} van ${potName(e.portfolio_id) || "—"} afgeschreven` });
      onReload?.();
    } catch {
      toast({ title: "Betaling mislukt", variant: "destructive" });
    }
  };

  const Item = ({ e, showPay }) => {
    const d = daysUntil(e);
    const dueLabel = d == null ? "—" : d < 0 ? `${Math.abs(d)}d te laat` : d === 0 ? "vandaag" : `${d}d`;
    return (
      <div className="group rounded-xl bg-white/60 border border-black/[0.05] px-2.5 py-2 hover:bg-white/90 transition cursor-pointer" onClick={() => openExpense(e.id)}>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: colorOf(e.portfolio_id) }} />
          <span className="text-[12px] font-display font-semibold truncate flex-1" style={{ color: "hsl(var(--foreground))" }}>{e.title}</span>
          {showPay && (
            <button onClick={(ev) => { ev.stopPropagation(); pay(e); }} className="shrink-0 inline-flex items-center gap-1 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-bold transition">
              <Check className="w-3 h-3" /> Betaald
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>{dueLabel}{potName(e.portfolio_id) ? ` · ${potName(e.portfolio_id)}` : ""}</span>
          <span className="text-[12px] font-display font-bold tabular-nums">{fmtEuro(e.expected_amount ?? e.amount)}</span>
        </div>
      </div>
    );
  };

  const Column = ({ title, count, children, accent, onAdd }) => (
    <div className="flex flex-col rounded-[20px] p-3 min-h-0 h-full" style={CARD}>
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>{title}</p>
          <span className="text-[10px] font-mono tabular-nums" style={{ color: "hsl(var(--muted-foreground))" }}>{count}</span>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="h-6 w-6 rounded-full bg-foreground/8 hover:bg-foreground/15 flex items-center justify-center transition" aria-label="Nieuwe last">
            <Plus className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1.5">
        {count === 0 && <p className="text-[11px] italic" style={{ color: "hsl(var(--muted-foreground))" }}>Geen items.</p>}
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
      <Column title="Alle lasten" count={all.length} accent="#94925d" onAdd={() => openExpense("new")}>
        {all.map((e) => <Item key={e.id} e={e} />)}
      </Column>
      <Column title="Op komst" count={coming.length} accent="#b1bec6">
        {coming.map((e) => <Item key={e.id} e={e} showPay />)}
      </Column>
      <Column title="Betaald" count={paid.length} accent="#d8dab3">
        {paid.map((e) => <Item key={e.id} e={e} />)}
      </Column>
    </div>
  );
}