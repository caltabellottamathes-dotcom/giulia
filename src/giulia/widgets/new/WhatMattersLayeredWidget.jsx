import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader, CheckList, URGENT } from "@/system/widgets/primitives";
import { useAgendaChecklist } from "@/self/widgets/editorial13/CheckableShell";
import { usePanel } from "@/lib/PanelContext";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/02f6f6d0e_Matters.jpeg";
const PISTACHIO = "hsl(var(--giulia-pistachio))"; // 2e accentkleur (GIULIA)
const BLUE = "hsl(var(--ridge))"; // 3e accentkleur — lichtblauw (niet-urgent)
const DEEP = "hsl(var(--d-giulia-deep))"; // donkere olijf — 1e accent (GIULIA)
/** Live staafgrafiek — één staaf per agenda-item vandaag. Bij afvinken
 *  groeit de staaf tot een hoogte op basis van de duur. 1e accent (olive) en
 *  2e accent (pistachio) wisselen; urgent → #d5e24a. */
function PlanningBars({ items }) {
  return (
    <div
      className="flex items-stretch gap-1 h-[42px] rounded-full p-1 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.14)" }}
    >
      {items.map((it, i) => {
        const num = String(i + 1).padStart(2, "0");
        const color = it.color || "var(--tile-accent)";
        const status = it.active ? "active" : it.done ? "done" : "idle";
        return (
          <motion.div
            key={it.id || i}
            className="h-full rounded-full flex items-center justify-center min-w-[22px] px-1"
            animate={{ flexGrow: status === "done" ? 7 : status === "active" ? 3 : 1 }}
            transition={{ type: "spring", stiffness: 170, damping: 22 }}
            style={{ backgroundColor: status === "done" ? color : "rgba(255,255,255,0.10)" }}
          >
            {status === "active" ? (
              <motion.span className="h-2 w-2 rounded-full" style={{ background: color }} animate={{ scale: [1, 1.45, 1] }} transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }} />
            ) : (
              <span className="text-[10px] font-display font-bold tabular-nums leading-none" style={{ color: status === "done" ? "white" : "rgba(255,255,255,0.5)" }}>{num}</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/** What Matters? — G·16x9·L·SIDE (gelaagd). Glas-shell rechts met titel
 *  "A plan for today!" + datum/tijd + live staafgrafiek; foto-card links met
 *  de afvinkbare agenda-checklist (done → bijbehorende staaf groeit). */
export default function WhatMattersLayeredWidget() {
  const { openModule } = usePanel();
  const { items: rawItems, total, closed, close, reopen } = useAgendaChecklist();
  const [states, setStates] = useState({});
  const cycle = (i) => setStates((s) => {
    const cur = s[i] || "idle";
    const next = cur === "idle" ? "active" : cur === "active" ? "done" : "idle";
    return { ...s, [i]: next };
  });
  const PALETTE = [DEEP, BLUE, PISTACHIO];
  const items = rawItems.map((it, i) => {
    const st = states[i] || "idle";
    const color = it.urgent ? URGENT : PALETTE[i % 3];
    return { ...it, done: st === "done", active: st === "active", color };
  });
  const doneCount = items.filter((it) => it.done).length;

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
    <div className="w-full h-[300px]">
      <PhotoGlassLayeredWidget
        shape="16:9"
        photo={PHOTO}
        glassPosition="right"
        glassFraction={0.58}
        overhang={0}
        domain="giulia"
        radius="large"
        onClick={() => openModule("jedag")}
        overlay="bg-gradient-to-r from-black/45 via-black/20 to-black/10"
        photoChildren={
          <div className="absolute left-0 top-0 bottom-0 w-[40%] p-3 flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
            {total > 0 ? (
              <CheckList items={items} onToggle={cycle} closed={closed} onClose={close} onReopen={reopen} maxH="100%" />
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
        <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: "hsl(var(--olive))" }}>
          {weekday} {dayNum} {month} · {hh}:{mm}
        </p>
        <div className="flex-1 min-h-2" />
        <PlanningBars items={items} />
      </PhotoGlassLayeredWidget>
    </div>
  );
}