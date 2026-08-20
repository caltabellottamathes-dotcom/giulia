import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import CountUp from "@/system/widgets/CountUp";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { useLearningSync } from "@/hooks/useLearningSync";
import { PLUM, SAGE, PLUM_FAINT } from "@/self/widgets/editorial3/editorial3Data";

const CATS = [
  { k: "important", label: "belangrijk", color: PLUM },
  { k: "newsletter", label: "nieuws", color: SAGE },
  { k: "advertising", label: "reclame", color: PLUM_FAINT },
  { k: "junk", label: "rommel", color: "hsl(var(--destructive))" },
  { k: "other", label: "overig", color: "hsl(var(--muted-foreground))" },
];

/** EmailFlowUltimate — grote type "POST" + ongelezen-teller + gestapelde
 *  categoriebalk van echte Emails + "wacht op antwoord"-chip. · 16:9 */
export default function EmailFlowUltimate() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data, loading } = useEntityList("Email", { sort: "-timestamp", limit: 200, externalTick: learnTick });
  const unread = useMemo(() => (data || []).filter((e) => e.status === "unread"), [data]);
  const awaiting = useMemo(() => (data || []).filter((e) => e.awaiting_response).length, [data]);
  const cats = useMemo(() => CATS.map((c) => ({ ...c, v: unread.filter((e) => (e.category || "other") === c.k).length })), [unread]);
  const total = unread.length || 1;
  const [grow, setGrow] = useState(false);
  useEffect(() => { setGrow(true); }, [data]);

  return (
    <WidgetShell size="1x1" radius="large" interactive onClick={() => openModule("email")} className="min-h-0" style={{ aspectRatio: "16 / 9", "--tile-accent": PLUM }}>
      <div className="flex flex-col h-full p-3 gap-2" style={{ color: PLUM }}>
        <WidgetHeader label="Online Postoffice." count={loading ? "…" : `${unread.length} ongelezen`} />
        <div className="flex items-end justify-between flex-1 min-h-0">
          <motion.h3 className="text-[30px] leading-[0.86] font-display font-semibold tracking-[-0.04em]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>POST</motion.h3>
          <div className="text-right">
            <CountUp value={unread.length} className="text-[44px] font-display font-semibold tabular-nums leading-none" />
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-55 mt-0.5">in inbox</p>
          </div>
        </div>
        <div>
          <div className="h-3 rounded-full overflow-hidden flex" style={{ background: PLUM_FAINT }}>
            {cats.map((c, i) => c.v > 0 && (
              <motion.div key={c.k} style={{ background: c.color }} initial={{ width: 0 }} animate={{ width: grow ? `${(c.v / total) * 100}%` : 0 }} transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: "easeOut" }} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex gap-2.5 flex-wrap">
              {cats.filter((c) => c.v > 0).slice(0, 4).map((c) => (
                <span key={c.k} className="flex items-center gap-1 text-[8px] uppercase tracking-wider opacity-70"><span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />{c.label}</span>
              ))}
            </div>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: SAGE, color: PLUM }}>{awaiting} wacht</span>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}