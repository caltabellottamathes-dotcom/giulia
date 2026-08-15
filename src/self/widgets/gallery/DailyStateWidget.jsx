import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { moodColor } from "@/lib/selfUtils";
import { PhotoCard, BehindCard } from "@/self/widgets/gallery/GlassPhoto";

const PLUM = "hsl(var(--self-primary))";
const SAGE_DEEP = "hsl(var(--self-accent-deep))";
const URGENT = "hsl(var(--self-urgent))";
const INK = "hsl(var(--foreground))";
const eCol = (v) => (v == null ? "rgba(40,30,40,0.35)" : v < 35 ? URGENT : v < 60 ? SAGE_DEEP : PLUM);

/** DailyStateWidget — glas + fotokaarten. "Living state field" op het glas;
 *  SELF-foto onder (door matglas) + een crisp kaart boven. */
export default function DailyStateWidget() {
  const { openModule } = usePanel();
  const { data: checkIns } = useEntityList("SelfCheckIn", { realtime: true, sort: "-timestamp", limit: 20 });
  const latest = (checkIns || [])[0];
  const prev = (checkIns || [])[1];
  const state = latest?.state || "neutral";
  const energy = latest?.energy ?? 50;
  const capacity = latest?.capacity ?? 50;
  const mood = latest?.mood || "neutral";
  const need = latest?.needs?.[0];
  const dE = latest && prev ? (latest.energy ?? 0) - (prev.energy ?? 0) : 0;
  const dC = latest && prev ? (latest.capacity ?? 0) - (prev.capacity ?? 0) : 0;
  const word = state === "calm" ? "CALM" : state === "charged" ? "CHARGED" : state === "overwhelmed" ? "OVERLOAD" : state === "low" ? "DEPLETED" : "STEADY";
  const low = state === "low" || state === "overwhelmed";
  const tint = low ? URGENT : SAGE_DEEP;
  const size = 28 + (capacity / 100) * 30;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfdailystate")}
      className="lg:col-span-2 min-h-[340px] text-foreground"
      style={{ "--tile-accent": SAGE_DEEP }}>
      <div className="relative h-full p-6 overflow-hidden">
        <BehindCard src={IMAGES.selfDailyState} className="absolute right-3 top-3 w-[46%] h-[48%] z-0" dim={0.12} />

        <div className="relative z-10 flex flex-col h-full">
          <WidgetHeader label="Daily State" count={state} />
          <h3 className="text-[44px] leading-[0.84] font-display font-semibold tracking-[-0.04em] mt-3" style={{ color: INK }}>{word}</h3>

          <div className="relative flex-1 my-3 min-h-[110px]">
            <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full">
              <defs>
                <radialGradient id="dsField" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={tint} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={tint} stopOpacity="0" />
                </radialGradient>
              </defs>
              <motion.circle cx="100" cy="60" r={size} fill="url(#dsField)"
                animate={{ cx: [96, 104, 96], cy: [57, 63, 57], r: [size * 0.9, size * 1.1, size * 0.9] }}
                transition={{ duration: 7 - (energy / 100) * 3, repeat: Infinity, ease: "easeInOut" }} />
              <motion.circle cx="100" cy="60" r={size * 0.5} fill={tint} fillOpacity="0.22"
                animate={{ cx: [103, 97, 103], r: [size * 0.46, size * 0.58, size * 0.46] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
              {need && <motion.circle cx="100" cy="60" r="4" fill={URGENT}
                animate={{ scale: [1, 1.7, 1], opacity: [1, 0.45, 1] }} transition={{ duration: 2.4, repeat: Infinity }} />}
            </svg>
          </div>

          <div className="flex items-end gap-7">
            <div>
              <p className="text-[40px] leading-none font-display font-semibold tabular-nums" style={{ color: eCol(energy) }}>{energy}</p>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mt-1.5" style={{ color: INK }}>Energy</p>
            </div>
            <div>
              <p className="text-[40px] leading-none font-display font-semibold tabular-nums" style={{ color: eCol(capacity) }}>{capacity}</p>
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mt-1.5" style={{ color: INK }}>Capacity</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider font-semibold">
            {dE !== 0 && <span style={{ color: dE > 0 ? SAGE_DEEP : URGENT }}>Energy {dE > 0 ? "↑" : "↓"} {Math.abs(dE)}%</span>}
            {dC !== 0 && <span style={{ color: dC > 0 ? SAGE_DEEP : URGENT }}>Capacity {dC > 0 ? "↑" : "↓"} {Math.abs(dC)}%</span>}
            {need && <span style={{ color: URGENT }}>{need}</span>}
          </div>
        </div>

        <PhotoCard src={IMAGES.selfCoatBack} className="absolute right-5 bottom-5 w-[30%] h-[24%] z-20" />
      </div>
    </WidgetShell>
  );
}