import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtTime } from "@/lib/selfUtils";
import { SELF_PHOTO, BURGUNDY, CONCRETE } from "./selfEditorial";

const PHASES = ["Ontwaken", "Oriënt", "Ritueel", "Opstaan"];

/** Wake — editorial information object (1×2 lang).
 *  Metafoor: een verticale fase-ladder — vier sporten (Ontwaken → Opstaan),
 *  gevuld op basis van voltooide ochtendroutines. Drempel-metafoor. */
export default function WakeEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: routines } = useEntityList("SelfRoutine", { realtime: true, externalTick: learnTick });

  const morning = useMemo(() => (routines || []).filter((r) => (r.preferred_time || "").toLowerCase() === "morning" && r.status !== "archived" && r.status !== "paused"), [routines]);
  const done = morning.filter((r) => r.status === "completed").length;
  const total = morning.length || 1;
  const steps = Math.round((done / total) * PHASES.length);
  const headline = steps >= PHASES.length ? "KLAAR" : steps > 0 ? "ONTWAKEN" : "SLAAP";
  const lastDone = morning.find((r) => r.last_done)?.last_done;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfwake")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": BURGUNDY }}>
      <div className="flex flex-col h-full text-ivory">
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <WidgetHeader label="Wake" count={lastDone ? fmtTime(lastDone) : "—"} />
          <h3 className="text-[28px] leading-[0.98] font-display font-semibold tracking-[-0.03em] mt-1">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{done}/{morning.length} ochtendstappen</p>

          {/* verticale fase-ladder */}
          <div className="mt-5 flex-1 flex flex-col justify-between gap-2 min-h-0">
            {PHASES.map((p, i) => {
              const filled = i < steps;
              return (
                <div key={p} className="flex items-center gap-3">
                  <motion.span className="h-3 w-3 rounded-full shrink-0" animate={{ scale: filled ? 1.1 : 0.85, opacity: filled ? 1 : 0.35 }} style={{ background: filled ? BURGUNDY : "rgba(255,255,255,0.25)" }} />
                  <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ opacity: filled ? 0.95 : 0.45 }}>{p}</span>
                  <div className="flex-1 h-px" style={{ background: filled ? CONCRETE : "rgba(255,255,255,0.14)" }} />
                </div>
              );
            })}
          </div>
        </div>

        <BrandPhoto src={SELF_PHOTO.wake} className="h-20 w-full -mt-4 rounded-t-[20px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.3)]" overlay="bg-gradient-to-t from-charcoal/65 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/70 font-semibold">drempel · ochtend</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfwake"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}