import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader, BrandPhoto, ProgressRing, CheckList } from "@/system/widgets/primitives";
import { useTaskChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";
const PISTACHIO = "hsl(var(--giulia-pistachio))";

/** What Matters? — referentie-widget op het GIULIA-skelet.
 *  Vorm: aspect-video (breed). Elementen: tasks-header + live datum/tijd +
 *  ProgressRing (outerDash) + BrandPhoto + CheckList. Plaatsing: ring
 *  links-onder, foto rechts-volledig. */
export default function WhatMattersWidget() {
  const { items, toggle, doneCount, total, allDone, closed, close, reopen } = useTaskChecklist();
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
          {/* LINKS — grafische typografie */}
          <div className="flex-[2] relative p-6 sm:p-8 flex flex-col min-w-0">
            <WidgetHeader type="tasks" label="What Matters?" count={total ? `${doneCount}/${total}` : ""} />

            <div className="flex-1 flex flex-col justify-center py-2 min-h-0">
              <p className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-[0.14em] text-current opacity-[0.65] leading-none">
                {weekday} · {dayNum} {month}
              </p>
              <div className="flex items-baseline mt-2">
                <motion.span
                  key={hh + mm}
                  className="text-[6rem] sm:text-[7rem] leading-[0.82] font-display font-bold tabular-nums tracking-[-0.05em] text-current"
                  initial={{ opacity: 0.7 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                >
                  {hh}:{mm}
                </motion.span>
                <motion.span
                  key={ss}
                  className="text-3xl sm:text-4xl font-display font-bold tabular-nums text-current ml-1"
                  animate={{ opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  :{ss}
                </motion.span>
              </div>
              <motion.div
                className="h-2 rounded-full mt-3"
                style={{ background: PISTACHIO, maxWidth: 320 }}
                animate={{ width: ["24%", "68%", "24%"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="flex items-end justify-start">
              <ProgressRing
                value={pct}
                size={220}
                stroke={12}
                outerDash
                label={
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[4.5rem] font-display font-bold tabular-nums text-current leading-none tracking-[-0.04em]">
                      {Math.round(pct * 100)}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-current opacity-[0.55] mt-1 font-bold">
                      % VOLBRACHT
                    </span>
                  </div>
                }
              />
            </div>
          </div>

          {/* RECHTS — foto + transparante planning */}
          <div className="flex-[3] p-3 sm:p-4 min-w-0">
            <BrandPhoto
              src={PHOTO}
              className="relative h-full w-full rounded-[22px] overflow-hidden"
              overlay="bg-gradient-to-t from-black/55 via-transparent to-transparent"
            >
              <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1.5 max-h-[80%]">
                <CheckList
                  items={enriched}
                  onToggle={toggle}
                  accent="hsl(var(--giulia-coral))"
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