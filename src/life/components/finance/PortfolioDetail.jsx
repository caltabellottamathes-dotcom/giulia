import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Pencil, CheckCircle2, TrendingUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { logLifeActivity } from "@/lib/lifeActivity";
import HealthBadge from "./HealthBadge";
import { calcPortfolio, calcForecast, fmtEuro, FREQ_LABELS, monthsUntil } from "@/lib/financeUtils";

/** PortfolioDetail — slide-in detail voor één portefeuille. */
export default function PortfolioDetail({ portfolio, expenses, transactions, onEditPortfolio, onAddExpense, onEditExpense, onDone, onChange, onClose }) {
  const [txAmount, setTxAmount] = useState("");
  if (!portfolio) return null;
  const calc = calcPortfolio(portfolio, expenses);
  const linked = (expenses || []).filter((e) => e.portfolio_id === portfolio.id);
  const openExpenses = linked.filter((e) => e.status !== "done");
  const txs = (transactions || []).filter((t) => t.portfolio_id === portfolio.id).slice(0, 12);
  const actual = Number(portfolio.monthly_reservation_actual) || calc.recommended_monthly;
  const balance = Number(portfolio.current_balance) || 0;
  const series = calcForecast([portfolio], expenses, 6);
  const points = series[0]?.points || [];
  const savingsShort = portfolio.kind === "sparen" && portfolio.savings_target_amount ? Math.max(0, portfolio.savings_target_amount - balance) : null;
  const savingsDate = portfolio.savings_target_date ? monthsUntil(portfolio.savings_target_date) : null;

  const logTx = async (type) => {
    const amt = Number(txAmount);
    if (!amt) return;
    const abs = Math.abs(amt);
    const delta = type === "expense" ? -abs : abs;
    await base44.entities.Transaction.create({ portfolio_id: portfolio.id, date: new Date().toISOString().slice(0, 10), amount: abs, type, status: "completed", note: type === "reservation" ? "Reservering" : "Betaling" });
    await base44.entities.Portfolio.update(portfolio.id, { current_balance: (Number(portfolio.current_balance) || 0) + delta });
    await logLifeActivity("Finance", type, `${type === "reservation" ? "Reservering" : "Betaling"} ${fmtEuro(abs)} bij ${portfolio.name}`);
    setTxAmount("");
    onChange?.();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="absolute right-0 top-0 bottom-0 w-full max-w-lg glass-2 rounded-l-[32px] p-6 overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 left-4 inline-flex items-center justify-center w-9 h-9 rounded-full glass-1 hover:bg-foreground/10 transition"><X className="w-4 h-4" /></button>

        <div className="mt-10 space-y-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">{portfolio.category || "Portefeuille"}</p>
              <h2 className="text-2xl font-display font-semibold tracking-tight">{portfolio.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{portfolio.goal || portfolio.description || ""}</p>
            </div>
            <HealthBadge status={calc.status} size="lg" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/55 backdrop-blur-md border border-white/60 p-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Huidig saldo</p>
              <p className="text-2xl font-display font-semibold tabular-nums" style={{ color: "hsl(var(--life-olive))" }}>{fmtEuro(balance)}</p>
            </div>
            <div className="rounded-xl bg-white/55 backdrop-blur-md border border-white/60 p-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Reservering / mnd</p>
              <p className="text-2xl font-display font-semibold tabular-nums">{fmtEuro(actual)}</p>
              <p className="text-[10px] text-muted-foreground">aanbevolen {fmtEuro(calc.recommended_monthly)}</p>
            </div>
            <div className="rounded-xl bg-white/55 backdrop-blur-md border border-white/60 p-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Volgende betaling</p>
              <p className="text-lg font-display font-semibold tabular-nums">{fmtEuro(calc.next_expected_payment)}</p>
              <p className="text-[10px] text-muted-foreground">{calc.next_payment_date ? new Date(calc.next_payment_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</p>
            </div>
            <div className="rounded-xl bg-white/55 backdrop-blur-md border border-white/60 p-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">Gewenst / buffer</p>
              <p className="text-lg font-display font-semibold tabular-nums">{fmtEuro(portfolio.target_balance || 0)}</p>
              <p className="text-[10px] text-muted-foreground">buffer {fmtEuro(portfolio.desired_buffer || 0)}</p>
            </div>
          </div>

          {savingsShort !== null && (
            <div className="rounded-xl border border-foreground/12 p-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mb-1">Spaardoel</p>
              <p className="text-sm">Nog <strong className="tabular-nums">{fmtEuro(savingsShort)}</strong> te gaan{savingsDate !== null ? ` · ${savingsDate} mnd tot ${new Date(portfolio.savings_target_date).toLocaleDateString("nl-NL", { month: "short", year: "numeric" })}` : ""}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onEditPortfolio} className="inline-flex items-center gap-1.5 rounded-full bg-plum text-ivory px-3.5 py-1.5 text-xs font-semibold"><Pencil className="w-3.5 h-3.5" />Bewerk pot</button>
            <button onClick={onAddExpense} className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 text-foreground px-3.5 py-1.5 text-xs font-semibold"><Plus className="w-3.5 h-3.5" />Last toevoegen</button>
          </div>

          {/* Forecast mini */}
          <div>
            <div className="flex items-center gap-1.5 mb-2"><TrendingUp className="w-3.5 h-3.5 text-muted-foreground" /><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Forecast (6 mnd)</p></div>
            <div className="flex items-end gap-1 h-20">
              {points.map((p, i) => {
                const max = Math.max(...points.map((x) => Math.abs(x.balance)), 1);
                const h = Math.max(4, (Math.abs(p.balance) / max) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t" style={{ height: `${h}%`, background: p.balance < 0 ? "hsl(var(--life-urgent))" : "hsl(var(--life-olive))", opacity: 0.55 + (i / points.length) * 0.45 }} />
                    <span className="text-[8px] text-muted-foreground">{p.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linked expenses */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Gekoppelde lasten ({openExpenses.length} open)</p>
            <div className="space-y-2">
              {openExpenses.length === 0 && <p className="text-sm text-muted-foreground italic">Geen open lasten.</p>}
              {openExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/55 backdrop-blur-md border border-white/60 p-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-display font-semibold truncate">{e.title}</p>
                    <p className="text-[10px] text-muted-foreground">{FREQ_LABELS[e.frequency] || e.frequency} · {fmtEuro(e.expected_amount ?? e.amount)}{e.next_payment_date ? ` · ${new Date(e.next_payment_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onEditExpense(e)} className="p-1.5 rounded-lg hover:bg-foreground/10 transition"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDone(e)} className="p-1.5 rounded-lg hover:bg-foreground/10 transition"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions */}
          {txs.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Transacties</p>
              <div className="space-y-1.5">
                {txs.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.date ? new Date(t.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"} · {t.type}</span>
                    <span className="font-display font-semibold tabular-nums" style={{ color: t.type === "expense" ? "hsl(var(--life-olive))" : "hsl(var(--life-ridge))" }}>{t.type === "expense" ? "−" : "+"}{fmtEuro(t.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction logger */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Transactie toevoegen</p>
            <div className="flex gap-2">
              <input type="number" step="0.01" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="0,00" className="flex-1 min-w-0 rounded-xl glass-1 px-3 py-2 text-sm outline-none" />
              <button onClick={() => logTx("reservation")} disabled={!txAmount} className="inline-flex items-center gap-1 rounded-xl bg-foreground/10 px-3 py-2 text-xs font-semibold disabled:opacity-40"><ArrowDownLeft className="w-3.5 h-3.5" />Reservering</button>
              <button onClick={() => logTx("expense")} disabled={!txAmount} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-ivory disabled:opacity-40" style={{ background: "hsl(var(--life-olive))" }}><ArrowUpRight className="w-3.5 h-3.5" />Betaling</button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Reservering verhoogt het saldo, betaling verlaagt het.</p>
          </div>

          {portfolio.notes && <p className="text-sm text-muted-foreground italic border-t border-foreground/10 pt-3">{portfolio.notes}</p>}
        </div>
      </motion.div>
    </div>
  );
}