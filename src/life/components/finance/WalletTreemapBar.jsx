import React, { useMemo } from "react";
import { useEntityList } from "@/hooks/useEntity";

const COLORS = ["#d0d9dd", "#595c64", "#abab69", "#8b8471", "#dbdbd6", "#d8dab3"];
const fmt = (n) => `€${Math.round(n).toLocaleString("en-US")}`;

/**
 * WalletTreemapBar — glazen horizontale treemap (glas-2): de volle breedte =
 * 100% van je inkomen. Elk gekleurd segment = 1 portefeuille; breedte ∝ de
 * som van alle expenses in die portefeuille ten opzichte van het totaal
 * inkomen. Alleggebruikt alle Personal Admin-data.
 */
export default function WalletTreemapBar() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const { data: expenses } = useEntityList("AdminObligation", { realtime: true });
  const { data: incomes } = useEntityList("Income", { realtime: true });

  const totalIncome = useMemo(
    () => (incomes || []).reduce((s, i) => s + (i.amount || 0), 0),
    [incomes]
  );

  const segments = useMemo(() => {
    const list = (portfolios || []).filter((p) => p.active !== false);
    return list
      .map((p, i) => {
        const exp = (expenses || [])
          .filter((e) => e.portfolio_id === p.id)
          .reduce((s, e) => s + (e.expected_amount || e.amount || 0), 0);
        return {
          id: p.id,
          name: p.name,
          color: COLORS[i % COLORS.length],
          amount: exp,
          pct: totalIncome > 0 ? (exp / totalIncome) * 100 : 0,
        };
      })
      .filter((s) => s.amount > 0)
      .sort((a, b) => b.pct - a.pct);
  }, [portfolios, expenses, totalIncome]);

  const covered = segments.reduce((s, x) => s + x.pct, 0);
  const free = totalIncome > 0 ? Math.max(0, 100 - covered) : 0;

  return (
    <div className="w-full h-full rounded-[18px] glass-2 flex flex-col justify-center gap-2 px-4 py-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">Income allocation</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/55">{totalIncome > 0 ? `${fmt(totalIncome)} in` : "—"}</p>
      </div>
      <div className="flex items-stretch gap-1.5 w-full h-[clamp(16px,2vw,26px)]">
        {segments.map((s) => (
          <div
            key={s.id}
            className="rounded-full flex items-center min-w-[6px] h-full overflow-hidden"
            style={{ width: `${s.pct}%`, background: s.color }}
            title={`${s.name} · ${Math.round(s.pct)}%`}
          >
            {s.pct > 14 && (
              <span className="text-[8px] font-mono text-black/70 px-2 truncate whitespace-nowrap">{s.name} {Math.round(s.pct)}%</span>
            )}
          </div>
        ))}
        {free > 0.5 && (
          <div
            className="rounded-full min-w-[6px] h-full"
            style={{ width: `${free}%`, background: "rgba(0,0,0,0.06)", border: "1px dashed rgba(0,0,0,0.18)" }}
            title="Free"
          />
        )}
        {segments.length === 0 && (
          <p className="text-[10px] text-foreground/40 self-center">{totalIncome > 0 ? "No expenses linked to wallets yet." : "No income recorded."}</p>
        )}
      </div>
    </div>
  );
}