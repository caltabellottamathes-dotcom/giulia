import React from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";
import { SELF_PHOTO } from "@/self/widgets/editorial/selfEditorial";

/** ApprovalStack — VISUAL LIST · 1:1. Gestapelde approval-kaarten (echte
 *  data) met diepte — bovenste kaart gelicht, image + type + status + motion. */
const CAT_COLOR = { urgent: "hsl(var(--destructive))", communication: SAGE, projects: PLUM, intern: PLUM, proactive: PLUM };

export default function ApprovalStack() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data } = useEntityList("Approval", { filter: { status: "pending" }, sort: "-created_date", limit: 6, externalTick: learnTick });
  const list = (data || []).slice(0, 4);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => openModule("approvals")} className="min-h-0" style={{ aspectRatio: "1 / 1", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-1" style={{ color: PLUM }}>
        <div className="flex items-center justify-between">
          <WidgetHeader label="Stack · wachten" />
          <span className="text-[16px] font-display font-semibold tabular-nums">{list.length}</span>
        </div>
        <div className="flex-1 relative min-h-0">
          {list.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[16px] font-display font-semibold opacity-40">leeg</span></div>
          ) : list.map((a, i) => (
            <motion.div key={a.id} className="absolute inset-x-2 rounded-xl p-2.5 flex items-center gap-2" style={{ top: `${10 + i * 16}%`, background: i === 0 ? PLUM_FAINT : "rgba(120,122,128,0.08)", border: `1px solid ${i === 0 ? PLUM : "rgba(120,122,128,0.12)"}`, zIndex: list.length - i, boxShadow: i === 0 ? "0 10px 24px -12px rgba(0,0,0,0.35)" : "none" }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: i === 0 ? 1 : 0.85, y: 0 }} transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}>
              <span className="h-8 w-1 rounded-full shrink-0" style={{ background: CAT_COLOR[a.category] || PLUM }} />
              {i === 0 && <div className="h-7 w-7 rounded-full overflow-hidden ring-1 shrink-0" style={{ "--tw-ring-color": PLUM }}><img src={SELF_PHOTO.therapy} alt="" className="h-full w-full object-cover" draggable={false} /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold truncate leading-tight">{a.title || a.description}</p>
                <p className="text-[8px] uppercase tracking-wider opacity-55">{a.type || a.category}</p>
              </div>
              {i === 0 && <span className="text-[7px] uppercase tracking-[0.14em] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: PLUM, color: "white" }}>top</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </WidgetShell>
  );
}