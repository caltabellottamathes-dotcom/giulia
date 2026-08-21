import React, { useEffect, useState } from "react";
import { WidgetShell, WidgetHeader, BrandPhoto, BarPulse, CheckList } from "@/system/widgets/primitives";
import { useAgendaChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";

/** What Matters? — referentie-widget op het GIULIA-skelet, op dashboard-maat
 *  (span-2). Links: "Planning" titel + datum + per-item staafgrafiek (één
 *  staafje per agenda-item, gaat omhoog bij afvinken). Rechts: foto tot tegen
 *  de rand, afgerond, schaduw op het glas. Checklist toont enkel de agenda
 *  van vandaag (CalendarEvent) — mock-items als de echte agenda leeg is. */
export default function WhatMattersWidget() {
  const { items, toggle, doneCount, total, closed, close, reopen } = useAgendaChecklist();
  const barValues = items.map((it) => (it.done ? 1 : 0));

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const weekday = now.toLocaleDateString("nl-NL", { weekday: "long" });
  const dayNum = now.getDate();
  const month = now.toLocaleDateString("nl-NL", { month: "short" });

  return (
    <WidgetShell domain="giulia" radius="large" size="2x2" className="min-h-[300px]">
      <div className="flex flex-1 min-h-0">
        {/* LINKS — titel + datum boven, staafgrafiek onder */}
        <div className="flex-[3] relative p-5 sm:p-6 flex flex-col min-w-0">
          <WidgetHeader type="tasks" label="What Matters?" count={total ? `${doneCount}/${total}` : ""} />

          <h2 className="mt-3 text-[1.75rem] sm:text-[2rem] font-display font-bold uppercase tracking-[0.05em] leading-[0.9] text-current">
            Planning
          </h2>
          <p className="mt-1.5 text-[11px] font-display font-bold uppercase tracking-[0.16em] text-current opacity-70 leading-none">
            {weekday} · {dayNum} {month}
          </p>

          <div className="flex-1" />

          {/* per-item staafgrafiek — één staafje per agenda-item */}
          <BarPulse values={barValues} height={56} />
        </div>

        {/* RECHTS — foto tot tegen de rand, afgerond, schaduw op het glas */}
        <div className="flex-[2] p-0 min-w-0 relative">
          <BrandPhoto
            src={PHOTO}
            className="relative h-full w-full rounded-[22px] shadow-[-30px_24px_60px_-18px_rgba(0,0,0,0.45)]"
            overlay="bg-gradient-to-t from-black/60 via-black/15 to-transparent"
          >
            <div className="absolute inset-x-0 bottom-0 p-2.5 flex flex-col gap-1.5 max-h-[82%]">
              {total > 0 ? (
                <CheckList items={items} onToggle={toggle} closed={closed} onClose={close} onReopen={reopen} maxH="100%" />
              ) : (
                <p className="text-[11px] text-white/70 px-2 py-1">Niets op de agenda vandaag.</p>
              )}
            </div>
          </BrandPhoto>
        </div>
      </div>
    </WidgetShell>
  );
}