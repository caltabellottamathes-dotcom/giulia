import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { journalTypeColor, journalTypeLabel } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** JournalWidget — "editorial timeline". Verticale timeline van de dag;
 *  highlights worden groter/getypografeerd, kleinere momenten blijven subtiel.
 *  Nieuwe momenten faden op hun juiste positie. */
export default function JournalWidget() {
  const { openModule } = usePanel();
  const { data: entries } = useEntityList("JournalEntry", { realtime: true, sort: "-date", limit: 30 });
  const today = new Date().toDateString();
  const todays = useMemo(() => (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === today).slice(0, 6), [entries, today]);

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfjournal")}
      className="lg:col-span-1 min-h-[400px]"
      style={{ background: "linear-gradient(160deg, hsl(var(--self-primary)) 0%, hsl(var(--self-primary-light)) 100%)", "--tile-accent": SAGE }}>
      <div className="p-6 h-full flex flex-col text-ivory">
        <WidgetHeader label="Journal" />
        <h3 className="text-[34px] leading-none font-display font-semibold tracking-[-0.03em] mt-2">TODAY</h3>
        <div className="flex items-end gap-3 mt-2">
          <p className="text-[40px] leading-none font-display font-semibold tabular-nums" style={{ color: SAGE }}>{todays.length}</p>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mb-1.5">meaningful<br />moments</p>
        </div>

        <div className="mt-5 flex-1 relative pl-5">
          <div className="absolute left-1.5 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.14)" }} />
          {todays.length === 0 && <p className="text-sm opacity-50">Nog niets vastgelegd vandaag</p>}
          {todays.map((e, i) => {
            const big = e.is_highlight || e.type === "highlight";
            const t = e.date ? new Date(e.date).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—";
            const c = journalTypeColor(e.type);
            return (
              <motion.div key={e.id} className="relative mb-4" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <span className="absolute -left-[14px] top-1 h-2.5 w-2.5 rounded-full" style={{ background: big ? URGENT : c, boxShadow: big ? `0 0 0 4px ${URGENT}33` : "none" }} />
                <p className="text-[9px] uppercase tracking-wider opacity-50">{t} · {journalTypeLabel(e.type)}</p>
                <p className={big ? "text-[15px] font-display font-semibold leading-tight" : "text-xs leading-snug opacity-80"}>{e.title}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </WidgetShell>
  );
}