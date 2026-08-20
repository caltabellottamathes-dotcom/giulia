import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

const CAT_COLOR = { urgent: "hsl(var(--destructive))", communication: SAGE, projects: PLUM, intern: PLUM, proactive: PLUM };

/** ApprovalQueueUltimate — grote type "WACHTEN" + rijen van echte openstaande
 *  Approvals met categorie-strook + teller. · 2:3 */
export default function ApprovalQueueUltimate() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data, loading } = useEntityList("Approval", { filter: { status: "pending" }, sort: "-created_date", limit: 20, externalTick: learnTick });
  const list = data || [];

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => openModule("approvals")} className="min-h-0" style={{ aspectRatio: "2 / 3", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <div className="flex items-end justify-between">
          <WidgetHeader label="Waiting on You." />
          <span className="text-[28px] font-display font-semibold tabular-nums leading-none">{list.length}</span>
        </div>
        <motion.h3 className="text-[26px] leading-[0.88] font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>WACHTEN</motion.h3>
        <div className="flex-1 flex flex-col gap-1.5 min-h-0 overflow-hidden">
          {loading ? <div className="m-auto h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: PLUM_FAINT, borderTopColor: PLUM }} /> :
            list.length ? list.slice(0, 5).map((a, i) => (
              <motion.div key={a.id} className="rounded-lg px-2.5 py-2 flex items-center gap-2" style={{ background: PLUM_FAINT }} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <span className="h-6 w-1 rounded-full shrink-0" style={{ background: CAT_COLOR[a.category] || PLUM }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold truncate leading-tight">{a.title || a.description}</p>
                  <p className="text-[8px] uppercase tracking-wider opacity-55">{a.type || a.category}</p>
                </div>
              </motion.div>
            )) : <div className="text-center m-auto"><span className="text-[16px] font-display font-semibold opacity-40 block">niets</span><p className="text-[10px] opacity-50">geen openstaande</p></div>}
        </div>
      </div>
    </WidgetShell>
  );
}