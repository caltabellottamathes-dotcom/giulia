import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { calcForecast, fmtEuro } from "@/lib/financeUtils";

const FALLBACK = ["#595f34", "#7c8a98", "#b2bfc7", "#a98b6a", "#94925d", "#d8dab3"];

/** WalletSineChart — kleurrijke saldi-ontwikkeling waarin elke wallet zijn eigen
 *  sinus-achtige lijn krijgt (reserveringen omhoog, betalingen omlaag). Kleur per
 *  wallet via portfolio.color. Recharts achter de schermen; strak gestyled. */
export default function WalletSineChart({ portfolios, expenses, months = 12 }) {
  const { data, lines } = useMemo(() => {
    const series = calcForecast(portfolios || [], expenses || [], months);
    const data = [];
    for (let i = 0; i < months; i++) {
      const row = { label: series[0]?.points[i]?.label || "" };
      series.forEach((s) => { row[s.name] = s.points[i]?.balance ?? 0; });
      data.push(row);
    }
    const lines = series.map((s, idx) => ({
      name: s.name,
      color: (portfolios || []).find((p) => p.id === s.portfolio_id)?.color || FALLBACK[idx % FALLBACK.length],
    }));
    return { data, lines };
  }, [portfolios, expenses, months]);

  if (lines.length === 0) return <p className="text-sm text-muted-foreground italic">Nog geen wallets.</p>;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: 6, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--foreground) / 0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={38} tickFormatter={(v) => `€${Math.round(Number(v) / 1000)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--foreground) / 0.1)", background: "hsl(var(--warm-white))", fontSize: 11, boxShadow: "0 12px 30px -14px rgba(0,0,0,0.3)" }}
              formatter={(v) => fmtEuro(v)}
            />
            {lines.map((l) => (
              <Line key={l.name} type="monotone" dataKey={l.name} stroke={l.color} strokeWidth={2.4} dot={false} tension={0.38} isAnimationActive />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {lines.map((l) => (
          <div key={l.name} className="flex items-center gap-1.5">
            <span className="h-[3px] w-4 rounded-full" style={{ background: l.color }} />
            <span className="text-[10px] text-muted-foreground truncate">{l.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}