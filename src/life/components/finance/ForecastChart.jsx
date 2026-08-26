import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { calcForecast, fmtEuro } from "@/lib/financeUtils";

const PALETTE = [
  "hsl(var(--life-ridge))",
  "hsl(var(--life-pistachio))",
  "hsl(var(--life-dew))",
  "hsl(var(--linen))",
  "hsl(var(--smoke))",
];

/** ForecastChart — stacked area van portefeuille-saldi over 12 maanden. */
export default function ForecastChart({ portfolios, expenses, months = 12 }) {
  const { data, keys } = useMemo(() => {
    const series = calcForecast(portfolios, expenses, months);
    const keys = series.map((s) => s.portfolio_id);
    const data = [];
    for (let i = 0; i < months; i++) {
      const row = { month: series[0]?.points[i]?.label || `+${i}` };
      let total = 0;
      for (const s of series) {
        const v = s.points[i]?.balance ?? 0;
        row[s.portfolio_id] = Math.max(0, v);
        total += v;
      }
      row.total = total;
      data.push(row);
    }
    return { data, keys };
  }, [portfolios, expenses, months]);

  if (!portfolios.length) return <p className="text-sm text-muted-foreground italic">Nog geen portefeuilles om te forecasten.</p>;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            {keys.map((k, i) => {
              const p = portfolios.find((pp) => pp.id === k);
              const c = (p && p.color) ? p.color : PALETTE[i % PALETTE.length];
              return (
                <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.25} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--foreground) / 0.08)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${Math.round(v)}`} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
            formatter={(v, name) => [fmtEuro(v), portfolios.find((p) => p.id === name)?.name || name]}
          />
          {keys.map((k, i) => {
            const p = portfolios.find((pp) => pp.id === k);
            const c = (p && p.color) ? p.color : PALETTE[i % PALETTE.length];
            return <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={c} strokeWidth={1.5} fill={`url(#g-${k})`} />;
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}