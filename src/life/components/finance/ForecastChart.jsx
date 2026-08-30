import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fmtEuro } from "@/lib/financeUtils";

const WEEKS = 16;
const FALLBACK = ["#3b6e8f", "#9c8b5a", "#6b8e7b", "#b0a6a0", "#7d7a6a", "#5a7a6b", "#8a7d5a", "#6a8294"];

/** ForecastChart — kleurrijke lijn per wallet over weken. Elke wallet krijgt
 *  een eigen fase-verschoven golf: wekelijks loopt de reservering erin, eens
 *  per ~4 weken vallen de vaste lasten eruit → sinus-achtige curve per wallet
 *  in de wallet-eigen kleur. */
export default function ForecastChart({ portfolios, expenses, months }) {
  const { data, lines } = useMemo(() => {
    const active = (portfolios || []).filter((p) => !p.archived);
    const weeks = Math.max(8, Math.min(WEEKS, (months || 12) * 4));
    const rows = [];
    for (let w = 0; w < weeks; w++) rows.push({ week: `W${w + 1}` });
    const lines = active.map((p, i) => {
      const linked = (expenses || []).filter((e) => e.portfolio_id === p.id && (e.status || "open") !== "done");
      const monthlyOut = linked.reduce((s, e) => s + (Number(e.expected_amount ?? e.amount) || 0), 0);
      const weeklyIn = (Number(p.monthly_reservation_actual) || 0) / 4.345;
      const phase = String(p.id || p.name || i).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 4;
      let bal = Number(p.current_balance) || 0;
      for (let w = 0; w < weeks; w++) {
        bal += weeklyIn;
        if (((w + phase) % 4) === 0) bal -= monthlyOut;
        rows[w][p.id] = Math.max(0, Math.round(bal * 100) / 100);
      }
      return { id: p.id, name: p.name, color: p.color || FALLBACK[i % FALLBACK.length] };
    });
    return { data: rows, lines };
  }, [portfolios, expenses, months]);

  if (!lines.length) return <p className="text-sm text-muted-foreground italic">Nog geen portefeuilles om te forecasten.</p>;

  return (
    <div className="w-full h-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 14, left: -6, bottom: 2 }}>
          <CartesianGrid strokeDasharray="2 5" stroke="hsl(var(--foreground) / 0.06)" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={1} />
          <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${Math.round(v)}`} width={46} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12, boxShadow: "0 12px 30px -12px rgba(0,0,0,0.25)" }}
            formatter={(v, name) => [fmtEuro(v), lines.find((l) => l.id === name)?.name || name]}
            labelStyle={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}
          />
          {lines.map((l) => (
            <Line key={l.id} type="monotone" dataKey={l.id} stroke={l.color} strokeWidth={2.6} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={true} animationDuration={900} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}