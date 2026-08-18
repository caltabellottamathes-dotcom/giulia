import React, { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

/**
 * EmailActivityChart — kleine geanimeerde Recharts area-chart die het
 * aantal emails per dag (laatste 7 dagen) toont. Valt naadloos in het
 * glas-ontwerp door eigen CSS-variabelen te gebruiken.
 */
export default function EmailActivityChart({ emails }) {
  const data = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("nl-NL", { weekday: "short" }).slice(0, 2);
      const count = (emails || []).filter((e) => {
        const ed = new Date(e.timestamp || e.created_date);
        return ed.toISOString().slice(0, 10) === key;
      }).length;
      days.push({ label, count });
    }
    return days;
  }, [emails]);

  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id="emailActivityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--olive))" stopOpacity={0.45} />
              <stop offset="100%" stopColor="hsl(var(--olive))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--olive))"
            strokeWidth={1.5}
            fill="url(#emailActivityGrad)"
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Tooltip
            cursor={{ stroke: "hsl(var(--olive))", strokeWidth: 1, strokeDasharray: "3 3" }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              fontSize: 11,
              padding: "6px 10px",
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))", textTransform: "capitalize" }}
            formatter={(v) => [`${v} emails`, ""]}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}