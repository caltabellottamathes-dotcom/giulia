import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader, BrandPhoto, CheckList, URGENT } from "@/system/widgets/primitives";
import { useAgendaChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";
const PISTACHIO = "hsl(var(--giulia-pistachio))"; // 2e accentkleur (GIULIA)
// variatie in vorm — elk item groeit naar een eigen hoogte
const MAGNITUDES = [0.5, 0.85, 0.38, 0.72, 0.6, 0.95, 0.46, 0.78];

/** PlanningBars — bolletjes die groeien. Elk agenda-item is een bolletje; bij
 *  afvinken groeit het tot een staaf. Nummers als grafisch element erboven.
 *  1e accent (olive) en 2e accent (pistachio) wisselen; urgent → #d5e24a. */
function PlanningBars({ items }) {
  return (
    <div className="flex items-end gap-2 h-[96px]">
      {items.map((it, i) => {
        const num = String(i + 1).padStart(2, "0");
        const urgent = !!it.urgent;
        const soft = i % 2 === 1;
        const color = urgent ? URGENT : soft ? PISTACHIO : "var(--tile-accent)";
        const targetH = it.done ? Math.round(18 + MAGNITUDES[i % MAGNITUDES.length] * 56) : 10;
        return (
          <div key={it.id || i} className="flex-1 flex flex-col items-center justify-end h-full">
            <span
              className="text-[9px] font-display font-bold tabular-nums leading-none mb-1.5"
              style={{ color: it.done ? color : "rgba(255,255,255,0.32)" }}
            >
              {num}
            </span>
            <motion.span
              className="w-3 rounded-full"
              animate={{ height: targetH }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ height: 10, backgroundColor: it.done ? color : "rgba(255,255,255,0.22)" }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** What Matters? — referentie-widget op het GIULIA-skelet, op dashboard-maat
 *  (span-2). Titel/subtitel identiek gestijld aan Social Pulse. Links: titel
 *  + datum + bolletjes-staafgrafiek. Rechts: foto tot tegen de rand, afgerond,
 *  schaduw op het glas. Checklist toont enkel de agenda van vandaag. */
export default function WhatMattersWidget() {
  const { items, toggle, doneCount, total, closed, close, reopen } = useAgendaChecklist();

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
        {/* LINKS — titel + datum boven, bolletjes-staafgrafiek onder */}
        <div className="flex-[3] relative p-5 sm:p-6 flex flex-col min-w-0">
          <WidgetHeader type="tasks" label="What Matters?" count={total ? `${doneCount}/${total}` : ""} />

          <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current mt-3">
            Planning
          </h3>
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5 text-current">
            {weekday} · {dayNum} {month}
          </p>

          <div className="flex-1" />

          <PlanningBars items={items} />
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