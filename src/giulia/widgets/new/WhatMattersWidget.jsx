import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader, BrandPhoto, FillBar, CheckList } from "@/system/widgets/primitives";
import { useTaskChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";

/** What Matters? — referentie-widget op het GIULIA-skelet.
 *  Vorm: breed (aspect-video). Elementen: tasks-header + live datum/tijd +
 *  FillBar (pistachio→olive) + BrandPhoto + CheckList. Plaatsing: foto rechts
 *  tegen de rand, tijd laag verankerd net boven de balk. */
export default function WhatMattersWidget() {
  const { items, toggle, doneCount, total, closed, close, reopen } = useTaskChecklist();
  const pct = total ? doneCount / total : 0;
  const enriched = items.map((it) => ({ ...it, urgent: /overdue|achterop|dringend|over time/i.test(it.sub || "") }));

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
    <div className="w-full aspect-video">
      <WidgetShell domain="giulia" radius="large" size="full" className="h-full">
        <div className="flex flex-1 min-h-0">
          {/* LINKS — grafische typografie, tijd laag verankerd */}
          <div className="flex-[3] relative p-6 sm:p-8 flex flex-col min-w-0">
            <WidgetHeader type="tasks" label="What Matters?" count={total ? `${doneCount}/${total}` : ""} />

            <div className="flex-1" />

            <div className="mb-5">
              <p className="text-xl sm:text-2xl font-display font-bold uppercase tracking-[0.14em] text-current opacity-[0.65] leading-none">
                {weekday} · {dayNum} {month}
              </p>
              <div className="flex items-baseline mt-1.5">
                <motion.span
                  key={hh + mm}
                  className="text-[5.5rem] sm:text-[6.5rem] leading-[0.82] font-display font-bold tabular-nums tracking-[-0.05em] text-current"
                  initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                >
                  {hh}:{mm}
                </motion.span>
                <motion.span
                  key={ss}
                  className="text-2xl sm:text-3xl font-display font-bold tabular-nums text-current ml-1"
                  animate={{ opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  :{ss}
                </motion.span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-current opacity-60">Voortgang</span>
              <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-current opacity-60 tabular-nums">
                {Math.round(pct * 100)}%
              </span>
            </div>
            <FillBar value={pct} height={12} />
          </div>

          {/* RECHTS — foto tot tegen de rand, geen overlay, alleen schaduw-gradient onderaan */}
          <div className="flex-[1.6] p-0 min-w-0 relative">
            <BrandPhoto
              src={PHOTO}
              className="relative h-full w-full"
              overlay="bg-gradient-to-t from-black/55 via-black/10 to-transparent"
            >
              <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1.5 max-h-[80%]">
                <CheckList
                  items={enriched}
                  onToggle={toggle}
                  closed={closed}
                  onClose={close}
                  onReopen={reopen}
                  maxH="100%"
                />
              </div>
            </BrandPhoto>
          </div>
        </div>
      </WidgetShell>
    </div>
  );
}