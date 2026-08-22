import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader, CheckList, URGENT } from "@/system/widgets/primitives";
import { layeredContentPad } from "@/system/widgets/primitives/shellCode";
import { useAgendaChecklist } from "@/self/widgets/editorial13/CheckableShell";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusPillar;
const LIGHT = "hsl(var(--d-focus-light))"; // cream
const NEUT = "hsl(var(--smoke))";          // warm neutraal (niet-urgent)
const DUR_MIN = 15, DUR_MAX = 180, H_MIN = 18, H_MAX = 78;

function durHeight(dur) {
  const d = Math.max(DUR_MIN, Math.min(DUR_MAX, dur || 60));
  return Math.round(H_MIN + ((d - DUR_MIN) / (DUR_MAX - DUR_MIN)) * (H_MAX - H_MIN));
}

function PlanningBars({ items }) {
  return (
    <div className="flex items-end gap-2 h-[92px]">
      {items.map((it, i) => {
        const num = String(i + 1).padStart(2, "0");
        const color = it.color || "var(--tile-accent)";
        const status = it.active ? "active" : it.done ? "done" : "idle";
        const targetH = status === "done" ? durHeight(it.duration) : 16;
        return (
          <div key={it.id || i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
            <span className="text-[12px] font-display font-bold tabular-nums leading-none mb-1" style={{ color: status === "done" ? color : "rgba(255,255,255,0.4)" }}>{num}</span>
            {status === "active" && (
              <motion.span className="mb-1 h-4 w-4 rounded-full" style={{ background: color }} animate={{ y: [0, -9, 0] }} transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }} />
            )}
            <motion.div className="w-full rounded-[10px]" animate={{ height: targetH }} transition={{ type: "spring", stiffness: 180, damping: 20 }} style={{ height: 16, backgroundColor: status === "done" ? color : "rgba(255,255,255,0.16)" }} />
          </div>
        );
      })}
    </div>
  );
}

/** WhatMattersFocusWidget — P·16x9·L·SIDE · "What's Happening?"
 *  Focus-twin van What Matters. Foto = focusPillar. Live staafgrafiek per
 *  agenda-item + afvinkbare checklist (done → staaf groeit). Burgundy/cream. */
export default function WhatMattersFocusWidget() {
  const { openModule } = usePanel();
  const { items: rawItems, total, closed, close, reopen } = useAgendaChecklist();
  const [states, setStates] = useState({});
  const cycle = (i) => setStates((s) => {
    const cur = s[i] || "idle";
    const next = cur === "idle" ? "active" : cur === "active" ? "done" : "idle";
    return { ...s, [i]: next };
  });
  const PALETTE = ["var(--tile-accent)", NEUT, LIGHT];
  const items = rawItems.map((it, i) => {
    const st = states[i] || "idle";
    const color = it.urgent ? URGENT : PALETTE[i % 3];
    return { ...it, done: st === "done", active: st === "active", color };
  });
  const doneCount = items.filter((it) => it.done).length;

  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);
  const weekday = now.toLocaleDateString("nl-NL", { weekday: "long" });
  const dayNum = now.getDate();
  const month = now.toLocaleDateString("nl-NL", { month: "short" });
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  return (
    <div className="w-full h-[300px]">
      <PhotoGlassLayeredWidget shape="16:9" photo={PHOTO} glassPosition="left" glassFraction={0.40} overhang={0} domain="focus" radius="large" onClick={() => openModule("agenda")} overlay="bg-gradient-to-t from-black/45 via-black/22 to-black/12"
        photoChildren={
          <div className="absolute inset-0 flex flex-col gap-2" style={layeredContentPad("left", 0.40)}>
            <WidgetHeader type="agenda" label="What's Happening?" count={total ? `${doneCount}/${total}` : ""} />
            <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">A PLAN FOR TODAY!</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>{weekday} {dayNum} {month} · {hh}:{mm}</p>
            <div className="flex-1 min-h-2" />
            <PlanningBars items={items} />
          </div>
        }
      >
        <div className="flex flex-col gap-1.5 h-full" onClick={(e) => e.stopPropagation()}>
          {total > 0 ? (
            <CheckList items={items} onToggle={cycle} closed={closed} onClose={close} onReopen={reopen} maxH="100%" />
          ) : (
            <p className="text-[11px] text-white/70 px-2 py-1">Niets op de agenda vandaag.</p>
          )}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}