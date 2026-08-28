import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useEntityList } from "@/hooks/useEntity";
import { fmtEuro } from "@/lib/financeUtils";

const EASE = [0.16, 1, 0.3, 1];

/** ExpenseAllocationBar — 'Maandelijkse verdeling' op de Inkomen-tab.
 *  Elk onderdeel is een eigen vorm met afgeronde hoeken (losse pill). Bij hover
 *  neemt dat onderdeel de volledige breedte van de balk aan; binnen de balk
 *  verschijnt dan de info van die last (titel · bedrag · wallet) voor de maand. */
export default function ExpenseAllocationBar() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { realtime: true });
  const { data: incomes } = useEntityList("Income", { realtime: true });
  const [hovered, setHovered] = useState(null);

  const { segs, total, leftover } = useMemo(() => {
    const colorOf = (id) => (portfolios || []).find((p) => p.id === id)?.color || "#9c9c9c";
    const walletOf = (id) => (portfolios || []).find((p) => p.id === id)?.name || "—";
    const totalIncome = (incomes || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const exps = (expenses || [])
      .filter((e) => e.status !== "done" && (Number(e.expected_amount ?? e.amount) || 0) > 0)
      .map((e) => ({ id: e.id, title: e.title, amount: Number(e.expected_amount ?? e.amount) || 0, color: colorOf(e.portfolio_id), wallet: walletOf(e.portfolio_id), freq: e.frequency }))
      .sort((a, b) => b.amount - a.amount);
    const spent = exps.reduce((s, e) => s + e.amount, 0);
    const left = Math.max(0, totalIncome - spent);
    const base = totalIncome > 0 ? totalIncome : spent;
    return { segs: exps, total: base, leftover: left };
  }, [portfolios, expenses, incomes]);

  // segmenten incl. 'Vrij' als laatste pil
  const rows = [...segs.map((s) => ({ ...s, kind: "exp" })), ...(leftover > 0 ? [{ id: "__vrij", title: "Vrij", amount: leftover, color: "hsl(var(--life-ridge) / 0.55)", wallet: "vrij besteedbaar", freq: null, kind: "vrij" }] : [])];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">Maandelijkse verdeling · per last</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">{total > 0 ? `${fmtEuro(total)} / mnd` : "—"}</p>
      </div>

      {/* balk — losse ronde pillen; hover → volledige breedte + info erin */}
      <div className="flex items-stretch w-full h-[clamp(40px,4.2vw,58px)] gap-2">
        {rows.length === 0 && <p className="text-[10px] text-foreground/40 self-center px-2">Geen lasten.</p>}
        {rows.map((s) => {
          const base = total > 0 ? (s.amount / total) * 100 : 0;
          const w = hovered == null ? base : hovered === s.id ? 100 : 0;
          const dark = s.kind === "exp";
          return (
            <motion.div
              key={s.id}
              className="h-full min-w-0 rounded-full overflow-hidden flex items-center cursor-pointer"
              style={{ background: s.color, color: dark ? "rgba(255,255,255,0.96)" : "hsl(var(--foreground))", boxShadow: hovered === s.id ? "0 10px 28px -10px rgba(0,0,0,0.35)" : "none" }}
              initial={{ width: 0 }}
              animate={{ width: `${w}%` }}
              transition={{ duration: 0.45, ease: EASE }}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center justify-between w-full min-w-0 px-3">
                <span className="text-[11px] font-bold truncate" style={{ textShadow: dark ? "0 1px 2px rgba(0,0,0,0.35)" : "none" }}>{s.title}</span>
                <span className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-[9px] uppercase tracking-[0.14em] opacity-70 hidden md:inline">{s.wallet}</span>
                  <span className="text-[12px] font-display font-bold tabular-nums">{fmtEuro(s.amount)}</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* legenda eronder — compacte kleurplegenda */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {segs.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-muted-foreground truncate">{s.title}</span>
            <span className="font-display font-semibold tabular-nums">{fmtEuro(s.amount)}</span>
          </div>
        ))}
        {leftover > 0 && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 rounded-full" style={{ background: "hsl(var(--life-ridge) / 0.55)" }} />
            <span className="font-semibold">Vrij</span>
            <span className="font-display font-semibold tabular-nums" style={{ color: "hsl(var(--life-ridge))" }}>{fmtEuro(leftover)}</span>
          </div>
        )}
      </div>
    </div>
  );
}