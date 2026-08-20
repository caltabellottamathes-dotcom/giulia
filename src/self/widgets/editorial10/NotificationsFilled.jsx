import React, { useMemo } from "react";
import { motion } from "framer-motion";
import FilledGlassCard, { BURG, INK, SAGE_SOFT } from "./FilledGlassCard";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/134bbd18c_A_minimalist_deadpan_photograph_of_202606262231.jpeg";

/** NotificationsFilled — glas-groot + foto-klein: ongelezen + urgent + recent. · 1:1 */
export default function NotificationsFilled() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Notification", { sort: "-created_date", limit: 50, externalTick: learnTick });
  const unread = useMemo(() => (data || []).filter((n) => n.status === "unread"), [data]);
  const urgent = useMemo(() => unread.filter((n) => n.urgent).length, [unread]);
  const recent = unread.slice(0, 3);
  return (
    <FilledGlassCard photo={PHOTO} onClick={() => openModule("notifications")} aspectRatio="1 / 1" photoSide="left"
      top={<><p className="text-[10px] uppercase tracking-[0.24em] font-bold opacity-70">Things to See.</p><h3 className="text-[26px] leading-[0.86] font-display font-semibold tracking-[-0.04em] mt-0.5">BERICHTEN</h3></>}>
      <div className="flex items-end gap-3 mb-2">
        <span className="text-[40px] font-display font-semibold tabular-nums leading-none" style={{ color: BURG }}>{unread.length}</span>
        <p className="text-[9px] uppercase tracking-[0.2em] opacity-55 pb-1.5">ongelezen</p>
        {urgent > 0 && <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: BURG, color: "#fff" }}>{urgent} urgent</span>}
      </div>
      <div className="flex flex-col gap-1.5">
        {recent.map((n, i) => (
          <motion.div key={n.id} className="flex items-center gap-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: n.urgent ? BURG : SAGE_SOFT }} />
            <span className="text-[12px] truncate flex-1">{n.message}</span>
            <span className="text-[8px] uppercase opacity-50">{n.kind}</span>
          </motion.div>
        ))}
        {!recent.length && <p className="text-[12px] opacity-60">Alles gelezen.</p>}
      </div>
    </FilledGlassCard>
  );
}