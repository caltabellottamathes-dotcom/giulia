import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader, BrandPhoto, FillBar, CheckList } from "@/system/widgets/primitives";
import { useTaskChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";

/** What Matters? — referentie-widget op het GIULIA-skelet.
 *  Vorm: breed (aspect-video). Links: grafische typografie (tijd/datum in
 *  Giulia-kleuren) + ALL-CAPS titel + grote FillBar. Rechts: foto als
 *  zwevende afgeronde kaart met schaduw op het glas. */
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
          {/* LINKS — grafisch, groot, Giulia-kleuren */}
          <div className="flex-[3.6] relative p-6 sm:p-10 flex flex-col min-w-0">
            <WidgetHeader type="tasks" label="What Matters?" count={total ? `${doneCount}/${total}` : ""} />

            <div className="flex-1" />

            {/* tijd + datum, laag verankerd, met kleurspel */}
            <div className="mb-5 border-l-2 border-giulia-pistachio/60 pl-5">
              <p className="text-lg sm:text-xl font-display font-bold uppercase tracking-[0.16em] text-giulia-pistachio leading-none">
                {weekday} · {dayNum} {month}
              </p>
              <div className="flex items-baseline mt-1.5">
                <motion.span
                  key={hh + mm}
                  className="text-[5.5rem] sm:text-[7rem] leading-[0.82] font-display font-bold tabular-nums tracking-[-0.05em] text-giulia-dust"
                  initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                >
                  {hh}:{mm}
                </motion.span>
                <motion.span
                  key={ss}
                  className="text-2xl sm:text-3xl font-display font-bold tabular-nums text-giulia-urgent ml-1.5"
                  animate={{ opacity: [0.35, 0.9, 0.35] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  :{ss}
                </motion.span>
              </div>
            </div>

            {/* ALL-CAPS titel, zoals Social */}
            <h2 className="text-[2.75rem] sm:text-[4rem] font-display font-bold uppercase tracking-[-0.04em] leading-[0.85] text-giulia-dust mb-6">
              Dagplanning
            </h2>

            {/* grote voortgangsbalk */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-giulia-pistachio">Voortgang</span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-giulia-pistachio tabular-nums">
                {Math.round(pct * 100)}%
              </span>
            </div>
            <FillBar value={pct} height={26} />
          </div>

          {/* RECHTS — foto als zwevende afgeronde kaart, schaduw op het glas */}
          <div className="flex-[1.4] p-4 sm:p-6 min-w-0 relative flex">
            <BrandPhoto
              src={PHOTO}
              className="relative h-full w-full rounded-[22px] shadow-[-34px_34px_80px_-20px_rgba(0,0,0,0.45)]"
              overlay="bg-gradient-to-t from-black/60 via-black/15 to-transparent"
            >
              <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1.5 max-h-[82%]">
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