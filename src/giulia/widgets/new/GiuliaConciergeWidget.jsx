import React from "react";
import { motion } from "framer-motion";
import { usePanel } from "@/lib/PanelContext";
import { WidgetShell } from "@/system/widgets/primitives";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";
const URGENT = "hsl(var(--d-giulia-urgent))";
const IVORY = "hsl(var(--ivory))";

/** GiuliaConciergeWidget — dashboard-launcher voor de sleepbare Hotline.
 *  Vierkante glas-card flush onderaan met een statische bloom-preview. Klik
 *  opent de persistente, sleepbare DraggableHotline (telefoon + bloom + stem). */
export default function GiuliaConciergeWidget() {
  const { openHotline } = usePanel();
  return (
    <div className="w-full h-[400px]">
      <WidgetShell domain="giulia" radius="large" interactive onClick={openHotline} className="w-full h-full min-h-0">
        <img src={PHOTO} alt="Giulia's Hotline" className="absolute inset-0 w-full h-full object-cover" />

        <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-10 bg-gradient-to-b from-black/55 to-transparent" style={{ color: IVORY }}>
          <span className="text-[10px] uppercase tracking-[0.28em] font-bold opacity-80">GIULIA'S HOTLINE</span>
          <span className="flex items-center gap-1.5 mt-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-60">TIK OM TE BELLEN</span>
          </span>
        </div>

        {/* vierkante glas-card flush onderaan */}
        <div className="absolute inset-x-0 bottom-0 h-[260px] flex flex-col items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", boxShadow: "0 -24px 52px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
          <motion.div
            className="h-[150px] w-[150px] rounded-full"
            style={{ background: `radial-gradient(circle, ${URGENT} 0%, ${DEEP} 45%, transparent 72%)`, filter: "blur(3px)", opacity: 0.7 }}
            animate={{ scale: [0.92, 1.04, 0.92], opacity: [0.6, 0.78, 0.6] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[8px] uppercase tracking-[0.28em] font-bold opacity-50 mt-3" style={{ color: IVORY }}>open hotline</span>
        </div>
      </WidgetShell>
    </div>
  );
}