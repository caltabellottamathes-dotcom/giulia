import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { fmtEuro } from "@/lib/financeUtils";

const EASE = [0.16, 1, 0.3, 1];

/** ExpenseAllocationBar — de nieuwe 'Maandelijkse verdeling' op de Inkomen-tab.
 *  De bar is verdeeld in álle individuele lasten (elk segment = één last in
 *  de kleur van zijn wallet); rest = 'Vrij'. Eronder een lijst zoals bij de
 *  oorspronkelijke maandelijkse verdeling. */
export default function ExpenseAllocationBar() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { realtime: true });
  const { data: incomes } = useEntityList("Income", { realtime: true });

  const { segs, total, leftover } = useMemo(() => {
    const colorOf = (id) => (portfolios || []).find((p) => p.id === id)?.color || "#9c9c9c";
    const walletOf = (id) => (portfolios || []).find((p) => p.id === id)?.name || "—";
    const totalIncome = (incomes || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const exps = (expenses || [])
      .filter((e) => e.status !== "done" && (Number(e.expected_amount ?? e.amount) || 0) > 0)
      .map((e) => ({ id: e.id, title: e.title, amount: Number(e.expected_amount ?? e.amount) || 0, color: colorOf(e.portfolio_id), wallet: walletOf(e.portfolio_id) }))
      .sort((a, b) => b.amount - a.amount);
    const spent = exps.reduce((s, e) => s + e.amount, 0);
    const left = Math.max(0, totalIncome - spent);
    const base = totalIncome > 0 ? totalIncome : spent;
    return { segs: exps, total: base, leftover: left };
  }, [portfolios, expenses, incomes]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">Maandelijkse verdeling · per last</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">{total > 0 ? `${fmtEuro(total)} / mnd` : "—"}</p>
      </div>

      {/* bar — per individuele last */}
      <div className="flex items-stretch w-full h-[clamp(22px,2.6vw,34px)] gap-[2px] rounded-full overflow-hidden">
        {segs.length === 0 && <p className="text-[10px] text-foreground/40 self-center px-2">Geen lasten.</p>}
        {segs.map((s) => {
          const w = total > 0 ? (s.amount / total) * 100 : 0;
          return <motion.div key={s.id} className="h-full min-w-0" style={{ background: s.color }} initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 0.5, ease: EASE }} title={`${s.title} · ${fmtEuro(s.amount)}`} />;
        })}
        {leftover > 0 && (
          <motion.div className="h-full min-w-0" style={{ background: "hsl(var(--life-ridge) / 0.5)" }} initial={{ width: 0 }} animate={{ width: `${total > 0 ? (leftover / total) * 100 : 0}%` }} transition={{ duration: 0.5, ease: EASE }} title={`Vrij · ${fmtEuro(leftover)}`} />
        )}
      </div>

      {/* lijst eronder */}
      <div className="mt-3 space-y-1.5 max-h-[200px] overflow-y-auto no-scrollbar">
        {segs.map((s) => (
          <div key={s.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-muted-foreground truncate">{s.title}</span>
              <span className="text-[10px] text-muted-foreground/70 shrink-0 hidden sm:inline">{s.wallet}</span>
            </span>
            <span className="font-display font-semibold tabular-nums shrink-0">{fmtEuro(s.amount)}</span>
          </div>
        ))}
        {leftover > 0 && (
          <div className="flex items-center justify-between text-sm pt-1.5 border-t border-foreground/10">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: "hsl(var(--life-ridge) / 0.5)" }} /><span className="font-semibold">Vrij</span></span>
            <span className="font-display font-semibold tabular-nums" style={{ color: "hsl(var(--life-ridge))" }}>{fmtEuro(leftover)}</span>
          </div>
        )}
      </div>
    </div>
  );
}