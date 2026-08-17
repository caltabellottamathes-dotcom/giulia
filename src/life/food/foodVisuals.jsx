import React from "react";
import { motion } from "framer-motion";
import { Coffee, Sandwich, Apple, Soup } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAY_LABELS } from "@/lib/foodUtils";

export const MEAL_ICON = { breakfast: Coffee, lunch: Sandwich, snack: Apple, dinner: Soup };

/** BudgetRing — geanimeerde SVG-ring die het budgetverbruik toont. */
export function BudgetRing({ cost, budget, size = 132, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = budget > 0 ? Math.min(1, cost / budget) : 0;
  const over = cost > budget;
  const dash = circ * pct;
  const color = over ? "hsl(var(--destructive))" : "var(--tile-accent, hsl(var(--olive)))";
  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-semibold tabular-nums leading-none">
          €{Number(cost || 0).toFixed(2).replace(".", ",")}
        </span>
        <span className="text-[10px] uppercase tracking-wider opacity-50 mt-1">/ €{Number(budget || 0).toFixed(2).replace(".", ",")}</span>
      </div>
    </div>
  );
}

/** DayDots — 7 dag-dots; gevuld wanneer de dag maaltijden heeft. */
export function DayDots({ week, weekMeals }) {
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(week.date_start + "T00:00:00");
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    return { ds, has: weekMeals.some((m) => m.date === ds), dayKey: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][i] };
  });
  return (
    <div className="flex items-center justify-between">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-wider opacity-50">{DAY_LABELS[d.dayKey]}</span>
          <motion.span
            className={cn("h-2.5 w-2.5 rounded-full", d.has ? "bg-current" : "bg-current/20")}
            animate={d.has ? { scale: [1, 1.18, 1] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
          />
        </div>
      ))}
    </div>
  );
}

export function MealTypeIcon({ type, className }) {
  const Icon = MEAL_ICON[type] || Soup;
  return <Icon className={className} strokeWidth={1.5} />;
}

export function Stat({ value, label, accent }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-display font-semibold tabular-nums leading-none" style={accent ? { color: accent } : undefined}>{value}</span>
      <span className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1">{label}</span>
    </div>
  );
}