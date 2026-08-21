import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader, BrandPhoto, BarPulse, CheckList } from "@/system/widgets/primitives";
import { useAgendaChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";

/** What Matters? — referentie-widget op het GIULIA-skelet, op dashboard-maat
 *  (span-2). Links: grafische typografie (tijd/datum wit) + ALL-CAPS titel +
 *  per-item staafgrafiek (één staafje per agenda-item, gaat omhoog bij afvinken).
 *  Rechts: foto tot tegen de rand, afgerond, schaduw op het glas. Checklist
 *  toont enkel de agenda van vandaag (CalendarEvent). */
export default function WhatMattersWidget() {
  const { items, toggle, doneCount, total, closed, close, reopen } = useAgendaChecklist();
  const barValues = items.map((it) => (it.done ? 1 : 0));

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const weekday = now.toLocaleDateString("nl-NL", { weekday: "long" });
  const dayNum = now.getDate();
  const month = now.toLocaleDateString("nl-NL", { month: "short" });
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return (
    <WidgetShell domain="giulia" radius="large" size="2x2" className="min-h-[300px]">
      <div className="flex flex-1 min-h-0">
        {/* LINKS — grafische typografie, wit, dashboard-schaal */}
        <div className="flex-[3.6] relative p-5 sm:p-6 flex flex-col min-w-0">
          <WidgetHeader type="tasks" label="What Matters?" count={total ? `${doneCount}/${total}` : ""} />

          <div className="flex-1" />

          <div className="mb-3 border-l-2 border-giulia-pistachio/50 pl-3.5">
            <p className="text-[11px] font-display font-bold uppercase tracking-[0.16em] text-current opacity-70 leading-none">
              {weekday} · {dayNum} {month}
            </p>
            <div className="flex items-baseline mt-1">
              <motion.span
                key={hh + mm}
                className="text-[2.75rem] sm:text-[3rem] leading-[0.82] font-display font-bold tabular-nums tracking-[-0.05em] text-current"
                initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
              >
                {hh}:{mm}
              </motion.span>
              <motion.span
                key={ss}
                className="text-sm font-display font-bold tabular-nums text-current ml-1"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                :{ss}
              </motion.span>
            </div>
          </div>

          <h2 className="text-[1.5rem] sm:text-[1.75rem] font-display font-bold uppercase tracking-[-0.04em] leading-[0.85] text-current mb-4">
            Dagplanning
          </h2>

          {/* per-item staafgrafiek — één staafje per agenda-item */}
          <BarPulse values={barValues} height={56} />
        </div>

        {/* RECHTS — foto tot tegen de rand, afgerond, schaduw op het glas */}
        <div className="flex-[1.4] p-0 min-w-0 relative">
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