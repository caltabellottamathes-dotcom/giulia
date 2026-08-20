import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import CountUp from "@/system/widgets/CountUp";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { WEEK, weekMealCount, todaysDinner, TOTAL_BUDGET } from "@/life/food/staticMenu";
import { BudgetDonut } from "@/life/food/foodCharts";

/** FoodWidget — LIFE-banner-widget (span 2). Vast weekmenu: vanavond +
 *  tellend cijfer + budget-donut (±€50). Live: CountUp (rAF). */
export default function FoodWidget() {
  const { openModule } = usePanel();
  const open = () => openModule("food");
  const dinner = useMemo(() => todaysDinner(), []);

  return (
    <WidgetShell size="2x2" radius="xl" interactive onClick={open} className="min-h-[200px]">
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-[0.82fr_1.18fr] flex-1 min-h-[150px]">
          <div className="p-5 flex flex-col">
            <WidgetHeader label="What's for Dinner?" />
            <h3 className="text-[26px] leading-[1.02] font-display font-semibold tracking-[-0.02em]">VANAVOND</h3>
            <p className="text-[12px] tracking-tight opacity-80 mt-1.5 line-clamp-2">{dinner?.name ?? "—"}</p>
            <div className="flex-1" />
            <div className="flex items-end gap-3">
              <span className="text-[48px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: "var(--tile-accent)" }}>
                <CountUp value={weekMealCount} />
              </span>
              <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mb-1.5 leading-tight">maaltijden<br />deze week</p>
            </div>
          </div>
          <div className="p-5 border-l border-white/10 flex flex-col items-center justify-center">
            <BudgetDonut cost={TOTAL_BUDGET} budget={TOTAL_BUDGET} size={124} thickness={14} accent="var(--tile-accent)" track="hsl(var(--ivory) / 0.14)" textClass="text-ivory" />
            <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-2">±€50 budget</p>
          </div>
        </div>
        <BrandPhoto src={IMAGES.lifeFood} className="h-12 w-full" overlay="bg-gradient-to-r from-charcoal/75 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/85 font-semibold">±€50 · 7-daags menu · ALDI</p>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}