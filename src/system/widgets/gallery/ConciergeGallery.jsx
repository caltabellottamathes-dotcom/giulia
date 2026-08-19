import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { ACCENT } from "./palette";

const A = ACCENT.giulia;

/** Concierge — "Wat kan Giulia?" Chat-preview met live typing animatie. */
export default function ConciergeGallery() {
  const { openChat } = usePanel();
  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openChat()} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="flex flex-col h-full">
        <div className="p-5 flex flex-col flex-1 min-h-0">
          <WidgetHeader label="Ask Me!" count="online" />
          <h3 className="text-[22px] leading-[1.0] font-display font-semibold tracking-[-0.03em] text-current">VRAGEN?</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">Giulia luistert</p>
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%]" style={{ background: "rgba(255,255,255,0.06)" }}>
              <p className="text-[12px] text-ivory/85 leading-snug">Hoe laat is mijn volgende afspraak?</p>
            </div>
            <motion.div className="rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[80%] self-end flex items-center gap-1" style={{ background: A }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              {[0, 1, 2].map(i => (
                <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-charcoal/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }} />
              ))}
            </motion.div>
          </div>
        </div>
        <BrandPhoto src={IMAGES.giuliaConcierge} className="h-14 w-full" overlay="bg-gradient-to-t from-charcoal/60 to-transparent">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.24em] text-ivory/80 font-semibold">Stel een vraag →</span>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}