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
import { ACCENT } from "./palette";

const A = ACCENT.focus;

/** WhatsApp — "Wie wacht op antwoord?" Ongelezen count + chat-preview. */
export default function WhatsAppGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: msgs } = useEntityList("WhatsAppMessage", { sort: "-timestamp", realtime: true, externalTick: t });
  const unread = (msgs || []).filter(m => m.direction === "received" && m.status === "unread");
  const count = unread.length;
  const last = (msgs || []).find(m => m.direction === "received");
  const headline = count === 0 ? "NIEMAND WACHT" : count === 1 ? "ÉÉN WACHT" : `${count} WACHTEN`;
  const sub = count === 0 ? "Alle bijgewerkt" : "Antwoordt wachten";

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("whatsapp")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Who's Texting?" count={count ? `${count} ongelezen` : "bij"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
          {count > 0 && <motion.span className="mb-2 h-3 w-3 rounded-full" style={{ background: A }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />}
        </div>
        {last && (
          <div className="mt-4 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[88%]" style={{ background: "rgba(255,255,255,0.06)" }}>
            <p className="text-[9px] uppercase tracking-[0.18em] opacity-40 font-semibold mb-0.5">{last.sender_name || "Onbekend"}</p>
            <p className="text-[11px] text-ivory/80 leading-snug truncate">{last.body || last.message || "..."}</p>
          </div>
        )}
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.stilettoHead} className="h-16 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} berichten wachten` : "Alle beantwoord"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}