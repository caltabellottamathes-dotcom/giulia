import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { stateLabel, energyColor, fmtAgo } from "@/lib/selfUtils";
import { SELF_PHOTO, BURGUNDY, CONCRETE } from "./selfEditorial";

/** Daily State — editorial information object (1×2 lang).
 *  Metafoor: een verticale energiekolom + capacity-balk + 6-punts statustimeline.
 *  De staat verandert de headline (IN RHYTHM / CHARGED / OVERLOAD / DEPLETED). */
export default function DailyStateEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: checkIns } = useEntityList("SelfCheckIn", { realtime: true, sort: "-timestamp", limit: 12, externalTick: learnTick });

  const latest = (checkIns || [])[0];
  const state = latest?.state || "neutral";
  const energy = latest?.energy;
  const capacity = latest?.capacity;

  const headline = !latest ? "MEET" : state === "calm" ? "IN RHYTHM" : state === "charged" ? "CHARGED" : state === "overwhelmed" ? "OVERLOAD" : state === "low" ? "DEPLETED" : "STEADY";

  const recent = useMemo(() => {
    const a = Array.from({ length: 6 }, () => null);
    (checkIns || []).slice(0, 6).forEach((c, i) => { a[5 - i] = c.energy ?? 0; });
    return a;
  }, [checkIns]);

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfdailystate")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": BURGUNDY }}>
      <div className="flex flex-col h-full text-ivory">
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <WidgetHeader label="Daily State" count={latest ? fmtAgo(latest.timestamp) : "—"} />
          <h3 className="text-[28px] leading-[0.98] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{stateLabel(state)}</p>

          {/* verticale energiekolom + capacity */}
          <div className="mt-4 flex items-stretch gap-4 flex-1 min-h-0">
            <div className="relative w-3 rounded-full bg-ivory/10 overflow-hidden">
              <motion.div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ background: energyColor(energy) }} initial={{ height: 0 }} animate={{ height: `${energy ?? 0}%` }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-50">Energy</p>
                <span className="text-[44px] leading-none font-display font-semibold tabular-nums" style={{ color: energyColor(energy) }}>{energy ?? "—"}</span>
              </div>
              <div className="mt-3">
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mb-1">Capacity {capacity != null ? `${capacity}%` : "—"}</p>
                <div className="h-1.5 rounded-full bg-ivory/10 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: CONCRETE }} animate={{ width: `${capacity ?? 0}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
            </div>
          </div>

          {/* 6-punts state timeline */}
          <div className="mt-4 flex items-center gap-1.5">
            {recent.map((v, i) => (
              <span key={i} className="flex-1 h-1.5 rounded-full" style={{ background: v != null ? energyColor(v) : "rgba(255,255,255,0.12)", opacity: v != null ? 0.9 : 0.3 }} />
            ))}
          </div>
        </div>

        <BrandPhoto src={SELF_PHOTO.dailyState} className="h-20 w-full -mt-4 rounded-t-[20px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.3)]" overlay="bg-gradient-to-t from-charcoal/65 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/70 font-semibold">state · gemeten</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfdailystate"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}