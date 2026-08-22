import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassPhotoLayeredWidget, WidgetHeader, CheckList, URGENT } from "@/system/widgets/primitives";
import { useAgendaChecklist } from "@/self/widgets/editorial13/CheckableShell";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg";
const PISTACHIO = "hsl(var(--giulia-pistachio))"; // 2e accentkleur (GIULIA)
const DUR_MIN = 15, DUR_MAX = 180, H_MIN = 18, H_MAX = 78;

/** Staafhoogte op basis van afspraakduur (min). */
function durHeight(dur) {
  const d = Math.max(DUR_MIN, Math.min(DUR_MAX, dur || 60));
  return Math.round(H_MIN + ((d - DUR_MIN) / (DUR_MAX - DUR_MIN)) * (H_MAX - H_MIN));
}

/** Live staafgrafiek — één staaf per agenda-item vandaag. Bij afvinken
 *  groeit de staaf tot een hoogte op basis van de duur. 1e accent (olive) en
 *  2e accent (pistachio) wisselen; urgent → #d5e24a. */
function PlanningBars({ items }) {
  return (
    <div className="flex items-end gap-2 h-[92px]">
      {items.map((it, i) => {
        const num = String(i + 1).padStart(2, "0");
        const urgent = !!it.urgent;
        const soft = i % 2 === 1;
        const color = urgent ? URGENT : soft ? PISTACHIO : "var(--tile-accent)";
        const targetH = it.done ? durHeight(it.duration) : 16;
        return (
          <div key={it.id || i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <span
              className="text-[12px] font-display font-bold tabular-nums leading-none mb-1"
              style={{ color: it.done ? color : "rgba(255,255,255,0.4)" }}
            >
              {num}
            </span>
            <motion.div
              className="w-full rounded-[10px]"
              animate={{ height: targetH }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              style={{ height: 16, backgroundColor: it.done ? color : "rgba(255,255,255,0.16)" }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** What Matters? — G·16x9·L·SIDE (gelaagd). Glas-shell rechts met titel
 *  "A plan for today!" + datum/tijd + live staafgrafiek; foto-card links met
 *  de afvinkbare agenda-checklist (done → bijbehorende staaf groeit). */
export default function WhatMattersLayeredWidget() {
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
    <div className="w-full max-w-[620px]">
      <GlassPhotoLayeredWidget
        shape="16:9"
        photo={PHOTO}
        photoPosition="left"
        photoFraction={0.40}
        overhang={0.08}
        domain="giulia"
        radius="large"
        photoOverlay="bg-gradient-to-t from-black/40 via-black/20 to-black/10"
        photoChildren={
          <div className="absolute inset-0 p-3 flex flex-col gap-1.5">
            {total > 0 ? (
              <CheckList items={items} onToggle={toggle} closed={closed} onClose={close} onReopen={reopen} maxH="100%" />
            ) : (
              <p className="text-[11px] text-white/70 px-2 py-1">Niets op de agenda vandaag.</p>
            )}
          </div>
        }
      >
        <WidgetHeader type="agenda" label="What Matters?" count={total ? `${doneCount}/${total}` : ""} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">
          A PLAN FOR TODAY!
        </h3>
        <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1">
          {weekday} {dayNum} {month} · {hh}:{mm}
        </p>
        <div className="flex-1 min-h-2" />
        <PlanningBars items={items} />
      </GlassPhotoLayeredWidget>
    </div>
  );
}