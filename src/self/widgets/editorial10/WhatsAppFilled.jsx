import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { fmtAgo } from "@/lib/selfUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/911803ba6_Apply_a_consistent_editorial_documentary_2026062200563.jpeg";

/** WhatsAppFilled — glas-groot + foto-klein: ongelezen + Giulia-concepten. · 16:9 */
export default function WhatsAppFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("WhatsAppMessage", { sort: "-timestamp", limit: 200, externalTick: learnTick });
  const unread = useMemo(() => (data || []).filter((m) => m.direction === "received" && m.status === "unread"), [data]);
  const drafts = useMemo(() => (data || []).filter((m) => m.giulia_suggested && m.direction === "sent" && m.status !== "read"), [data]);
  const recent = (data || []).filter((m) => m.direction === "received").slice(0, 3);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("whatsapp")} aspectRatio="16 / 9" photoSide="right"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Who's Texting?</p><h3 className="text-[28px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">WHATSAPP</h3></>}>
      <div className="flex items-end gap-3">
        <span className="text-[40px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{unread.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">ongelezen</p>
        <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: SAGE_SOFT, color: "#fff" }}>{drafts.length} concept</span>
      </div>
      <div className="flex flex-col gap-1.5 mt-2">
        {recent.map((m, i) => (
          <motion.div key={m.id} className="flex items-center gap-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: BURG }} />
            <span className="text-[12px] truncate flex-1">{m.message}</span>
            <span className="text-[9px] opacity-50">{fmtAgo(m.timestamp)}</span>
          </motion.div>
        ))}
        {!recent.length && <p className="text-[12px] opacity-60">Geen berichten.</p>}
      </div>
    </FilledGlassCard>
  );
}