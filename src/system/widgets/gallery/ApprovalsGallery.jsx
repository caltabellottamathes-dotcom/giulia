import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { IMAGES } from "@/lib/images";
import { ACCENT, URGENT } from "./palette";

const A = ACCENT.giulia;

/** Approvals — "Hoeveel wachten er?" Big count + pulsende categorie-dots. */
export default function ApprovalsGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: approvals } = useEntityList("Approval", { filter: { status: "pending" }, realtime: true, externalTick: t });
  const pending = (approvals || []).filter(a => a.status === "pending");
  const count = pending.length;
  const cats = {};
  pending.forEach(a => { cats[a.category || a.type || "other"] = (cats[a.category || a.type || "other"] || 0) + 1; });
  const headline = count === 0 ? "ALLES GOED" : count === 1 ? "ÉÉN WACHT" : `${count} WACHTEN`;
  const sub = count === 0 ? "Niets open" : "Giulia wacht op je";

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("approvals")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Waiting on You." count={count ? `${count} open` : "leeg"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={count} className="text-[64px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
          {count > 0 && <motion.span className="mb-2 h-3 w-3 rounded-full" style={{ background: URGENT }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />}
        </div>
        <div className="mt-5 flex gap-1.5">
          {pending.slice(0, 10).map((a, i) => (
            <motion.span key={a.id || i} className="h-2 flex-1 rounded-full" style={{ background: A }}
              initial={{ scaleY: 0.3, opacity: 0.2 }} animate={{ scaleY: 1, opacity: 0.75 }}
              transition={{ duration: 0.4, delay: i * 0.06 }} />
          ))}
          {!count && Array.from({ length: 6 }).map((_, i) => <span key={i} className="h-2 flex-1 rounded-full opacity-10" style={{ background: "currentColor" }} />)}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.leanChair} className="h-16 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${Object.keys(cats).length} soorten · ${count} wachtend` : "Alles afgehandeld"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}