import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { journalTypeColor, journalTypeLabel } from "@/lib/selfUtils";
import { PhotoCard, BehindCard } from "@/self/widgets/gallery/GlassPhoto";

const PLUM = "hsl(var(--self-primary))";
const SAGE_DEEP = "hsl(var(--self-accent-deep))";
const URGENT = "hsl(var(--self-urgent))";
const INK = "hsl(var(--foreground))";

/** JournalWidget — glas + fotokaarten. Editorial verticale timeline op het
 *  glas; SELF-foto onder, crisp kaart bij een highlight-moment boven. */
export default function JournalWidget() {
  const { openModule } = usePanel();
  const { data: entries } = useEntityList("JournalEntry", { realtime: true, sort: "-date", limit: 30 });
  const today = new Date().toDateString();
  const todays = useMemo(() => (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === today).slice(0, 6), [entries, today]);

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfjournal")}
      className="lg:col-span-1 min-h-[400px] text-foreground"
      style={{ "--tile-accent": SAGE_DEEP }}>
      <div className="relative h-full p-6 overflow-hidden">
        <BehindCard src={IMAGES.selfJournal} className="absolute right-3 top-3 w-[44%] h-[30%] z-0" dim={0.16} />

        <div className="relative z-10 flex flex-col h-full">
          <WidgetHeader label="Journal" />
          <h3 className="text-[34px] leading-none font-display font-semibold tracking-[-0.03em] mt-2" style={{ color: INK }}>TODAY</h3>
          <div className="flex items-end gap-3 mt-2">
            <p className="text-[40px] leading-none font-display font-semibold tabular-nums" style={{ color: PLUM }}>{todays.length}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mb-1.5" style={{ color: INK }}>meaningful<br />moments</p>
          </div>

          <div className="mt-5 flex-1 relative pl-5">
            <div className="absolute left-1.5 top-0 bottom-0 w-px" style={{ background: "rgba(40,30,40,0.16)" }} />
            {todays.length === 0 && <p className="text-sm opacity-50" style={{ color: INK }}>Nog niets vastgelegd vandaag</p>}
            {todays.map((e, i) => {
              const big = e.is_highlight || e.type === "highlight";
              const t = e.date ? new Date(e.date).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—";
              const c = big ? URGENT : (journalTypeColor(e.type) === "hsl(var(--self-accent))" ? SAGE_DEEP : journalTypeColor(e.type));
              return (
                <motion.div key={e.id} className="relative mb-4" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <span className="absolute -left-[14px] top-1 h-2.5 w-2.5 rounded-full" style={{ background: c, boxShadow: big ? `0 0 0 4px ${URGENT}33` : "none" }} />
                  <p className="text-[9px] uppercase tracking-wider opacity-50" style={{ color: INK }}>{t} · {journalTypeLabel(e.type)}</p>
                  <p className={big ? "text-[15px] font-display font-semibold leading-tight" : "text-xs leading-snug opacity-80"} style={{ color: INK }}>{e.title}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <PhotoCard src={IMAGES.selfBench} className="absolute right-5 bottom-5 w-[40%] h-[26%] z-20" />
      </div>
    </WidgetShell>
  );
}