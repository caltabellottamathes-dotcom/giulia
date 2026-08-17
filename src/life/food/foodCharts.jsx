import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis } from "recharts";
import { SAND, SAND_DEEP, PLUM } from "./lifeColors";

/** BudgetDonut — geanimeerde Recharts-donut: budgetverbruik vs resterend. */
export function BudgetDonut({ cost = 0, budget = 0, size = 148, thickness = 16, accent = PLUM, track, label = "budget", textClass = "text-foreground" }) {
  const pct = budget > 0 ? Math.min(1, cost / budget) : 0;
  const over = cost > budget;
  const used = over ? 1 : pct;
  const data = [{ v: used }, { v: Math.max(0.001, 1 - used) }];
  const trackColor = track || "hsl(var(--foreground) / 0.08)";
  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="v" innerRadius={size / 2 - thickness} outerRadius={size / 2 - 2} startAngle={90} endAngle={-270} paddingAngle={0} stroke="none" isAnimationActive animationDuration={1100}>
            <Cell fill={over ? "hsl(var(--destructive))" : accent} />
            <Cell fill={trackColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none ${textClass}`}>
        <span className="text-2xl font-display font-semibold tabular-nums leading-none">{Math.round(pct * 100)}%</span>
        <span className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1">{label}</span>
      </div>
    </div>
  );
}

/** DailyCostChart — 7 staafjes met de kost per dag; huidige dag gehighlight. */
export function DailyCostChart({ data, height = 120, accent = PLUM, baseColor, tickColor, highlightIndex }) {
  const base = baseColor || "hsl(var(--foreground) / 0.22)";
  const tick = tickColor || "hsl(var(--muted-foreground))";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
        <XAxis dataKey="day" tick={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", fill: tick }} tickLine={false} axisLine={false} />
        <Bar dataKey="cost" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900}>
          {data.map((_, i) => <Cell key={i} fill={i === highlightIndex ? accent : base} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const RATING_COLORS = { slecht: "hsl(var(--destructive))", gewoon: "hsl(var(--steel))", goed: SAND_DEEP, super: SAND };
/** RatingsChart — verdeling van beoordelingen (slecht → super). */
export function RatingsChart({ counts, height = 120, tickColor }) {
  const tick = tickColor || "hsl(var(--muted-foreground))";
  const data = [
    { name: "Slecht", v: counts.slecht || 0, fill: RATING_COLORS.slecht },
    { name: "Gewoon", v: counts.gewoon || 0, fill: RATING_COLORS.gewoon },
    { name: "Goed", v: counts.goed || 0, fill: RATING_COLORS.goed },
    { name: "Super", v: counts.super || 0, fill: RATING_COLORS.super },
  ];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 600, fill: tick }} tickLine={false} axisLine={false} />
        <Bar dataKey="v" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} maxBarSize={48}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const MEAL_COLORS = { breakfast: PLUM, lunch: SAND, snack: "hsl(var(--steel))", dinner: SAND_DEEP };
/** MealTypeDonut — verdeling van maaltijden per type. */
export function MealTypeDonut({ counts, size = 120, thickness = 14 }) {
  const data = Object.entries(counts).filter(([, v]) => v > 0).map(([k, v]) => ({ k, v, fill: MEAL_COLORS[k] || SAND }));
  if (!data.length) return null;
  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="v" nameKey="k" innerRadius={size / 2 - thickness} outerRadius={size / 2 - 2} startAngle={90} endAngle={-270} paddingAngle={2} stroke="none" isAnimationActive animationDuration={900}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}