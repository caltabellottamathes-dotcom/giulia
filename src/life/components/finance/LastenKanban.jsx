import React, { useMemo } from "react";
import { Plus, Check, Undo2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro, FREQ_LABELS } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";

const DAY = 86400000;
const CARD = { background: "#f5f5f4", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" };
const ITEM_SHADOW = "-10px 10px 24px -14px rgba(0,0,0,0.28)";
const DUE_SOON_DAYS = 7;

const effDate = (e) => e.next_payment_date || e.due_date;
const daysUntil = (e) => { const d = effDate(e); return d ? Math.round((new Date(d + "T00:00:00").getTime() - new Date(new Date().toDateString()).getTime()) / DAY) : null; };
const fmtFull = (d) => { if (!d) return null; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }); };

/** LastenKanban — 3 kolommen: Alle lasten · Op komst · Betaald.
 *  Elk item toont datum boven, bedrag + korte titel onder, met linkse slagschaduw.
 *  "Op komst" heeft een "Betaal"-knop; "Betaald" toont "betaald" + een
 *  terug-knop om per ongeluk betaalde lasten terug te zetten (wallet terugboekt). */
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

  const unpay = async (e) => {
    const amt = Number(e.actual_amount ?? e.expected_amount ?? e.amount) || 0;
    const today = new Date().toISOString().slice(0, 10);
    try {
      await base44.entities.AdminObligation.update(e.id, { status: "open", last_payment_date: null, actual_amount: 0 });
      if (e.portfolio_id && amt > 0) {
        const pot = portfolios.find((p) => p.id === e.portfolio_id);
        if (pot) await base44.entities.Portfolio.update(e.portfolio_id, { current_balance: (Number(pot.current_balance) || 0) + amt });
      }
      if (amt > 0) await base44.entities.Transaction.create({ portfolio_id: e.portfolio_id, expense_id: e.id, type: "adjustment", amount: -amt, status: "completed", date: today, note: `Teruggezet: ${e.title}` });
      toast({ title: "Teruggezet", description: `${e.title} staat weer open${amt > 0 ? ` · ${fmtEuro(amt)} teruggeboekt` : ""}` });
      onReload?.();
    } catch {
      toast({ title: "Terugzetten mislukt", variant: "destructive" });
    }
  };

  const Item = ({ e, mode }) => {
    const d = daysUntil(e);
    const dateStr = fmtFull(effDate(e));
    const dueLabel = d == null ? "zonder datum" : d < 0 ? `${Math.abs(d)}d te laat` : d === 0 ? "vandaag" : `over ${d}d`;
    return (
      <div className="group rounded-xl bg-white px-2.5 py-2 hover:bg-white/95 transition cursor-pointer" onClick={() => openExpense(e.id)} style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: ITEM_SHADOW }}>
        {/* info boven */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: colorOf(e.portfolio_id) }} />
          <span className="text-[9px] uppercase tracking-wide font-semibold truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
            {dateStr || "zonder datum"} · {dueLabel}
          </span>
        </div>
        {/* bedrag + korte titel onder */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[15px] font-display font-bold tabular-nums leading-none" style={{ color: "hsl(var(--foreground))" }}>{fmtEuro(e.expected_amount ?? e.amount)}</p>
            <p className="text-[11px] font-medium truncate mt-1" style={{ color: "hsl(var(--foreground))" }}>{e.title}</p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            {mode === "coming" && (
              <button onClick={(ev) => { ev.stopPropagation(); pay(e); }} className="inline-flex items-center gap-1 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-bold transition">
                <Check className="w-3 h-3" /> Betaal
              </button>
            )}
            {mode === "paid" && (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Check className="w-3 h-3" /> betaald
                </span>
                <button onClick={(ev) => { ev.stopPropagation(); unpay(e); }} className="inline-flex items-center gap-1 rounded-full bg-foreground/5 hover:bg-foreground/10 px-2 py-0.5 text-[9px] font-semibold transition" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Undo2 className="w-3 h-3" /> terug
                </button>
              </>
            )}
          </div>
        </div>
        {potName(e.portfolio_id) && (
          <p className="text-[9px] uppercase tracking-wide mt-1.5 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
            {potName(e.portfolio_id)}{FREQ_LABELS?.[e.frequency] ? ` · ${FREQ_LABELS[e.frequency]}` : ""}
          </p>
        )}
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
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2">
        {count === 0 && <p className="text-[11px] italic" style={{ color: "hsl(var(--muted-foreground))" }}>Geen items.</p>}
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
      <Column title="Alle lasten" count={all.length} accent="#94925d" onAdd={() => openExpense("new")}>
        {all.map((e) => <Item key={e.id} e={e} mode="all" />)}
      </Column>
      <Column title="Op komst" count={coming.length} accent="#b1bec6">
        {coming.map((e) => <Item key={e.id} e={e} mode="coming" />)}
      </Column>
      <Column title="Betaald" count={paid.length} accent="#d8dab3">
        {paid.map((e) => <Item key={e.id} e={e} mode="paid" />)}
      </Column>
    </div>
  );
}