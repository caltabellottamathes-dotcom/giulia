import React, { useMemo, useState } from "react";
import { Plus, Check, Undo2, Receipt } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fmtEuro } from "@/lib/financeUtils";
import { useToast } from "@/components/ui/use-toast";

const DAY = 86400000;
const CARD = { background: "#f5f5f4", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "-16px 16px 40px -16px rgba(0,0,0,0.30)" };
const ITEM_SHADOW = "-10px 10px 24px -14px rgba(0,0,0,0.28)";
const DUE_SOON_DAYS = 7;

const effDate = (e) => e.next_payment_date || e.due_date;
const daysUntil = (e) => { const d = effDate(e); return d ? Math.round((new Date(d + "T00:00:00").getTime() - new Date(new Date().toDateString()).getTime()) / DAY) : null; };
const fmtFull = (d) => { if (!d) return null; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }); };

const hexToRgba = (hex, a) => {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return `rgba(120,120,120,${a})`;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/** KanbanItem — minimaal, lager, wallet-kleur-tint. In "coming"-modus is het
 *  bedrag inline bewerkbaar vóór Betaal. */
function KanbanItem({ e, mode, color, onPay, onUnpay, onOpen }) {
  const [amt, setAmt] = useState(String(Number(e.expected_amount ?? e.amount) || 0));
  const d = daysUntil(e);
  const dateStr = fmtFull(effDate(e));
  const dueLabel = d == null ? "zonder datum" : d < 0 ? `${Math.abs(d)}d te laat` : d === 0 ? "vandaag" : `over ${d}d`;
  return (
    <div className="group rounded-lg px-2 py-1.5 cursor-pointer transition" onClick={() => onOpen(e.id)} style={{ background: hexToRgba(color, 0.14), borderLeft: `3px solid ${color}`, boxShadow: ITEM_SHADOW }}>
      <span className="block text-[9px] uppercase tracking-wide font-semibold truncate mb-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
        {dateStr || "zonder datum"} · {dueLabel}
      </span>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          {mode === "coming" ? (
            <div className="flex items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
              <span className="text-[12px] font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>€</span>
              <input
                type="number" inputMode="decimal" value={amt}
                onChange={(ev) => setAmt(ev.target.value)}
                className="w-[72px] bg-transparent text-[15px] font-display font-bold tabular-nums leading-none outline-none border-b border-foreground/20 focus:border-foreground/60"
                style={{ color: "hsl(var(--foreground))" }}
              />
            </div>
          ) : (
            <p className="text-[15px] font-display font-bold tabular-nums leading-none" style={{ color: "hsl(var(--foreground))" }}>{fmtEuro(e.expected_amount ?? e.amount)}</p>
          )}
          <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: "hsl(var(--foreground))" }}>{e.title}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          {mode === "coming" && (
            <button onClick={(ev) => { ev.stopPropagation(); onPay(e, amt); }} className="inline-flex items-center gap-1 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-bold transition">
              <Check className="w-3 h-3" /> Betaal
            </button>
          )}
          {mode === "paid" && (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Check className="w-3 h-3" /> betaald
              </span>
              <button onClick={(ev) => { ev.stopPropagation(); onUnpay(e); }} className="inline-flex items-center gap-1 rounded-full bg-foreground/5 hover:bg-foreground/10 px-2 py-0.5 text-[9px] font-semibold transition" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Undo2 className="w-3 h-3" /> terug
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** KanbanColumn — stabiele top-level kolom (geen state) zodat bewerkbare
 *  item-states niet verloren gaan bij herrenders van de ouder. */
function KanbanColumn({ title, count, children, accent, onAdd, onHeaderClick, flipped }) {
  return (
    <div className="flex flex-col rounded-[20px] p-3 min-h-0 h-full" style={CARD}>
      <div className="flex items-center justify-between mb-2 shrink-0">
        <button disabled={!onHeaderClick} onClick={onHeaderClick} className={`flex items-center gap-2 ${onHeaderClick ? "cursor-pointer hover:opacity-70" : "cursor-default"}`}>
          <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>{title}</p>
          <span className="text-[10px] font-mono tabular-nums" style={{ color: "hsl(var(--muted-foreground))" }}>{count}</span>
        </button>
        {onHeaderClick && (
          <button onClick={onHeaderClick} className={`h-6 w-6 rounded-full flex items-center justify-center transition ${flipped ? "bg-foreground text-background" : "bg-foreground/8 hover:bg-foreground/15"}`} aria-label="kassabon" title="Kassabon">
            <Receipt className="w-3.5 h-3.5" />
          </button>
        )}
        {onAdd && !onHeaderClick && (
          <button onClick={onAdd} className="h-6 w-6 rounded-full bg-foreground/8 hover:bg-foreground/15 flex items-center justify-center transition" aria-label="Nieuwe last">
            <Plus className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1.5">
        {!flipped && count === 0 && <p className="text-[11px] italic" style={{ color: "hsl(var(--muted-foreground))" }}>Geen items.</p>}
        {children}
      </div>
    </div>
  );
}

/** LastenKanban — 3 kolommen: Alle lasten · Op komst · Betaald.
 *  De 3e kolom (Betaald) kan omklappen naar een editorial 'kassabon' met alle
 *  betaalde lasten + totaal. */
export default function LastenKanban({ expenses, portfolios, onReload }) {
  const { toast } = useToast();
  const colorOf = (id) => (portfolios || []).find((p) => p.id === id)?.color || "#9c9c9c";
  const potName = (id) => (portfolios || []).find((p) => p.id === id)?.name || "";
  const [flipped, setFlipped] = useState(false);

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

  const pay = async (e, amount) => {
    const amt = Number(amount) || 0;
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

  // Editorial 'kassabon' van alle betaalde lasten.
  const ReceiptView = () => {
    const total = paid.reduce((s, e) => s + (Number(e.actual_amount ?? e.expected_amount ?? e.amount) || 0), 0);
    return (
      <div className="h-full flex flex-col">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>Kassabon · betaald</p>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1 font-mono text-[10px]" style={{ color: "hsl(var(--foreground))" }}>
          {paid.length === 0 && <p className="italic" style={{ color: "hsl(var(--muted-foreground))" }}>Nog niets betaald.</p>}
          {paid.map((e) => {
            const amt = Number(e.actual_amount ?? e.expected_amount ?? e.amount) || 0;
            const c = colorOf(e.portfolio_id);
            return (
              <div key={e.id} className="flex items-baseline gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full shrink-0 mt-1" style={{ background: c }} />
                <span className="truncate flex-1">{e.title}</span>
                <span className="tracking-[0.25em] text-foreground/25">·</span>
                <span className="tabular-nums shrink-0">{fmtEuro(amt)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-foreground/15 flex items-baseline justify-between font-mono">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Totaal</span>
          <span className="text-[15px] font-display font-bold tabular-nums">{fmtEuro(total)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
      <KanbanColumn title="Alle lasten" count={all.length} accent="#94925d" onAdd={() => openExpense("new")}>
        {all.map((e) => <KanbanItem key={e.id} e={e} mode="all" color={colorOf(e.portfolio_id)} onPay={pay} onUnpay={unpay} onOpen={openExpense} />)}
      </KanbanColumn>
      <KanbanColumn title="Op komst" count={coming.length} accent="#b1bec6">
        {coming.map((e) => <KanbanItem key={e.id} e={e} mode="coming" color={colorOf(e.portfolio_id)} onPay={pay} onUnpay={unpay} onOpen={openExpense} />)}
      </KanbanColumn>
      <KanbanColumn title="Betaald" count={paid.length} accent="#d8dab3" onHeaderClick={() => setFlipped((f) => !f)} flipped={flipped}>
        {flipped ? <ReceiptView /> : paid.map((e) => <KanbanItem key={e.id} e={e} mode="paid" color={colorOf(e.portfolio_id)} onPay={pay} onUnpay={unpay} onOpen={openExpense} />)}
      </KanbanColumn>
    </div>
  );
}