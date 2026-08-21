import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader, BrandPhoto, CheckList, URGENT } from "@/system/widgets/primitives";
import { useAgendaChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";
const PISTACHIO = "hsl(var(--giulia-pistachio))"; // 2e accentkleur (GIULIA)
const DUR_MIN = 15, DUR_MAX = 180, H_MIN = 30, H_MAX = 116;

/** Staafhoogte op basis van afspraakduur (min). */
function durHeight(dur) {
  const d = Math.max(DUR_MIN, Math.min(DUR_MAX, dur || 60));
  return Math.round(H_MIN + ((d - DUR_MIN) / (DUR_MAX - DUR_MIN)) * (H_MAX - H_MIN));
}

/** PlanningBars — grote visuele blokken (geen dunne lijntjes). Elk agenda-
 *  item is een stevig blok; bij afvinken groeit het tot een staaf waarvan de
 *  hoogte afhangt van de duur. Nummers als grafisch element erboven. 1e accent
 *  (olive) en 2e accent (pistachio) wisselen; urgent → #d5e24a. */
function PlanningBars({ items }) {
  return (
    <div className="flex items-end gap-2 h-[128px]">
      {items.map((it, i) => {
        const num = String(i + 1).padStart(2, "0");
        const urgent = !!it.urgent;
        const soft = i % 2 === 1;
        const color = urgent ? URGENT : soft ? PISTACHIO : "var(--tile-accent)";
        const targetH = it.done ? durHeight(it.duration) : 20;
        return (
          <div key={it.id || i} className="flex-1 flex flex-col items-center justify-end h-full">
            <span
              className="text-[13px] font-display font-bold tabular-nums leading-none mb-1.5"
              style={{ color: it.done ? color : "rgba(255,255,255,0.4)" }}
            >
              {num}
            </span>
            <motion.div
              className="w-full rounded-[12px]"
              animate={{ height: targetH }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              style={{ height: 20, backgroundColor: it.done ? color : "rgba(255,255,255,0.16)" }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** What Matters? — referentie-widget op het GIULIA-skelet, op dashboard-maat
 *  (span-2). Links: titel "Your day in steps." + datum/tijd + grote staaf-
 *  grafiek. Rechts: foto volledig bedekt door de genummerde checklist
 *  (scrollbaar, geen zichtbare scrollbar). */
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
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  return (
    <WidgetShell domain="giulia" radius="large" size="2x2" className="min-h-[320px]">
      <div className="flex flex-1 min-h-0">
        {/* LINKS — titel + datum/tijd + grote staafgrafiek */}
        <div className="flex-[3] relative p-5 sm:p-6 flex flex-col min-w-0">
          <WidgetHeader type="tasks" label="What Matters?" count={total ? `${doneCount}/${total}` : ""} />

          <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">
            Your day in steps.
          </h3>
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">
            {weekday} {dayNum} {month} · {hh}:{mm}
          </p>

          <div className="flex-1" />

          <PlanningBars items={items} />
        </div>

        {/* RECHTS — foto volledig bedekt door de genummerde checklist */}
        <div className="flex-[2] p-0 min-w-0 relative">
          <BrandPhoto
            src={PHOTO}
            className="relative h-full w-full rounded-[22px] shadow-[-30px_24px_60px_-18px_rgba(0,0,0,0.45)]"
            overlay=""
          >
            <div className="absolute inset-0 p-3 flex flex-col gap-1.5">
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