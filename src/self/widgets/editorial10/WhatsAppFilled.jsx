import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { PulseRings, FlowDots } from "./shapes";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtAgo } from "@/lib/selfUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/911803ba6_Apply_a_consistent_editorial_documentary_2026062200563.jpeg";

/** WhatsAppFilled — puls-ringen achter de teller + stromende bericht-dots. · 16:9 */
export default function WhatsAppFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("WhatsAppMessage", { sort: "-timestamp", limit: 200, externalTick: learnTick });
  const unread = useMemo(() => (data || []).filter((m) => m.direction === "received" && m.status === "unread"), [data]);
  const drafts = useMemo(() => (data || []).filter((m) => m.giulia_suggested && m.direction === "sent" && m.status !== "read"), [data]);
  const recent = (data || []).filter((m) => m.direction === "received").slice(0, 2);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("whatsapp")} aspectRatio="16 / 9" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Who's Texting?</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">WHATSAPP</h3></>}>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center" style={{ width: 76, height: 76 }}>
          <PulseRings color={BURG} size={76} />
          <motion.span className="text-[30px] font-display font-semibold tabular-nums leading-none z-10" style={{ color: BURG }} key={unread.length} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 12 }}>{unread.length}</motion.span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 mb-1">ongelezen</p>
          <FlowDots count={6} color={SAGE_SOFT} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={recent[0]?.id || "e"} className="text-[12px] truncate mt-1.5" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>{recent[0]?.message || "Geen berichten"}</motion.p>
          </AnimatePresence>
          <span className="text-[9px] opacity-50">{recent[0] ? fmtAgo(recent[0].timestamp) : ""}</span>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full self-start" style={{ background: SAGE_SOFT, color: "#fff" }}>{drafts.length} concept</span>
      </div>
    </FilledGlassCard>
  );
}