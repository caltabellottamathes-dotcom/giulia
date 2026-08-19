import React, { useMemo } from "react";
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

const A = ACCENT.system;
const KINDS = ["question", "remark", "info"];

/** Notifications — "Wat is ongelezen?" Count + soort-dots. */
export default function NotificationsGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: notifs } = useEntityList("Notification", { sort: "-created_date", realtime: true, externalTick: t });
  const unread = (notifs || []).filter(n => n.status === "unread");
  const count = unread.length;
  const byKind = useMemo(() => { const m = {}; KINDS.forEach(k => m[k] = 0); unread.forEach(n => { if (m[n.kind] != null) m[n.kind]++; }); return m; }, [unread]);
  const headline = count === 0 ? "ALLES GELEZEN" : count <= 3 ? "EEN PAAR" : "VEEL ONGELEZEN";
  const sub = count === 0 ? "Inbox schoon" : `${count} wachten op je`;

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("notifications")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="flex flex-col h-full">
        <div className="p-5 flex flex-col flex-1 min-h-0">
          <WidgetHeader label="Things to See." count={count ? `${count} nieuw` : "leeg"} />
          <h3 className="text-[22px] leading-[1.0] font-display font-semibold tracking-[-0.03em] text-current">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{sub}</p>
          <div className="mt-4 flex items-end gap-3">
            <CountUp value={count} className="text-[48px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
            {count > 0 && <motion.span className="mb-2 h-2.5 w-2.5 rounded-full" style={{ background: URGENT }} animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />}
          </div>
          <div className="mt-4 flex gap-3 flex-1 items-center">
            {KINDS.map((k, i) => {
              const n = byKind[k] || 0;
              return (
                <motion.div key={k} className="flex flex-col items-center gap-1.5" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: n ? A : "rgba(255,255,255,0.06)" }}>
                    <span className="text-[14px] tabular-nums font-semibold" style={{ color: n ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)" }}>{n}</span>
                  </div>
                  <span className="text-[7px] uppercase tracking-wide opacity-50 font-semibold">{k.slice(0, 4)}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
        <BrandPhoto src={IMAGES.feetChair} className="h-12 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
          <div className="absolute inset-0 flex items-center px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${count} ongelezen` : "Alles gelezen"}</p>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}