import React, { useMemo } from "react";
import CountUp from "@/system/widgets/CountUp";
import { BudgetDonut } from "@/life/food/foodCharts";
import { SAND } from "@/life/food/lifeColors";
import { ContextGrid, ActionRow } from "@/self/components/SelfViz";
import { WEEK, CATEGORIES, weekMealCount, todaysDinner, TOTAL_BUDGET } from "@/life/food/staticMenu";

/** FoodPreview — grafisch glas-paneel in LIFE-stijl. Vast weekmenu:
 *  reusachtig tellend cijfer, budget-donut, boodschappen-samenvatting
 *  en het avond-menu van de hele week. */
export default function FoodPreview() {
  const dinner = useMemo(() => todaysDinner(), []);

  return (
    <div className="space-y-6 text-ivory">
      {/* HERO */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold">Food · deze week</p>
        <h2 className="text-[40px] leading-[0.95] font-display font-semibold tracking-[-0.03em] mt-1.5">± €50 WEEK</h2>
        <p className="text-sm text-ivory/55 mt-2 italic">Vast 7-daags menu — boodschappenlijst voor ALDI België.</p>
      </div>

      {/* Reusachtig cijfer */}
      <div className="glass-card-2 rounded-2xl p-5 flex items-end gap-5">
        <span className="text-[72px] leading-[0.78] font-display font-semibold tabular-nums" style={{ color: SAND }}><CountUp value={weekMealCount} /></span>
        <div className="mb-3 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">maaltijden deze week</p>
          <p className="text-xs text-ivory/45 mt-1.5 truncate">vanavond: {dinner?.name ?? "—"}</p>
        </div>
      </div>

      {/* Budget + boodschappen */}
      <div className="glass-card-2 rounded-2xl p-5 flex items-center gap-5">
        <BudgetDonut cost={TOTAL_BUDGET} budget={TOTAL_BUDGET} size={132} thickness={15} accent={SAND} track="hsl(var(--ivory) / 0.14)" textClass="text-ivory" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-2">Boodschappen</p>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map((c) => (
              <div key={c.title} className="flex items-baseline justify-between text-xs">
                <span className="text-ivory/80 truncate">{c.emoji} {c.title}</span>
                <span className="text-ivory/45 font-mono shrink-0">{c.subtotal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu van de week */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/45 font-semibold mb-3">Avondeten · deze week</p>
        <div className="space-y-2">
          {WEEK.map((d) => {
            const din = d.meals.find((m) => m.slot === "Avondeten");
            return (
              <div key={d.day} className="flex items-baseline gap-3 px-4 py-2.5 rounded-xl glass-card-2">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-ivory/45 w-12 shrink-0">{d.day.slice(0, 3)}</span>
                <span className="text-sm font-display font-medium truncate flex-1">{din?.name ?? "—"}</span>
                {din?.time && <span className="text-[10px] font-mono text-ivory/40 shrink-0">{din.time}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <ContextGrid items={[
        { label: "BUDGET", text: `±€${TOTAL_BUDGET} — binnen budget.` },
        { label: "MAALTIJDEN", text: `${weekMealCount} vastgelegd deze week.` },
        { label: "VANAVOND", text: dinner?.name ?? "—" },
      ]} />
      <ActionRow actions={[
        { label: "Open Food", primary: true, color: "#d8dab3", to: "/life/food" },
      ]} />
    </div>
  );
}