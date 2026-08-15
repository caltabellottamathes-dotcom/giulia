import React, { useMemo } from "react";
import { motion } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import BrandPhoto from "@/system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { journalTypeColor, journalTypeLabel } from "@/lib/selfUtils";
import { SELF_PHOTO, BURGUNDY, CONCRETE } from "./selfEditorial";

/** Journal — editorial information object (1×2 lang).
 *  Metafoor: een verticale draad van entries — punten verbonden door een lijn,
 *  met een ster bij highlights. Reflectie-metafoor. */
export default function JournalEditorial() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: entries } = useEntityList("JournalEntry", { realtime: true, sort: "-date", limit: 20, externalTick: learnTick });

  const today = new Date().toDateString();
  const todayEntries = (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === today);
  const highlights = (entries || []).filter((e) => e.is_highlight);
  const thread = (entries || []).slice(0, 6);
  const headline = todayEntries[0]?.title || "SCHRIJF";

  return (
    <WidgetShell size="1x2" radius="large" interactive onClick={() => openModule("selfjournal")} className="min-h-[340px] sm:row-span-2" style={{ "--tile-accent": BURGUNDY }}>
      <div className="flex flex-col h-full text-ivory">
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <WidgetHeader label="Journal" count={todayEntries.length ? `${todayEntries.length} vandaag` : "—"} />
          <h3 className="text-[24px] leading-[1.02] font-display font-semibold tracking-[-0.03em] mt-1 line-clamp-2">{headline}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1.5">{highlights.length} highlights</p>

          {/* verticale draad */}
          <div className="mt-4 flex-1 relative min-h-0">
            <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: CONCRETE, opacity: 0.4 }} />
            <div className="space-y-2.5">
              {thread.length ? thread.map((e, i) => (
                <motion.div key={e.id} className="relative flex items-center gap-3 pl-5" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <span className="absolute left-0 h-2.5 w-2.5 rounded-full" style={{ background: e.is_highlight ? BURGUNDY : CONCRETE }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] truncate text-ivory/85">{e.title}</p>
                    <p className="text-[9px] uppercase tracking-wider opacity-45">{journalTypeLabel(e.type)}</p>
                  </div>
                  {e.is_highlight && <span className="text-[10px]" style={{ color: BURGUNDY }}>★</span>}
                </motion.div>
              )) : <p className="text-sm text-ivory/45 italic pl-5">Nog geen draad.</p>}
            </div>
          </div>
        </div>

        <BrandPhoto src={SELF_PHOTO.journal} className="h-20 w-full -mt-4 rounded-t-[20px] relative z-10 shadow-[0_-12px_28px_-12px_rgba(0,0,0,0.3)]" overlay="bg-gradient-to-t from-charcoal/65 via-charcoal/25 to-transparent">
          <div className="absolute inset-0 flex items-center justify-between px-5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/70 font-semibold">reflectie · draad</p>
            <button onClick={(e) => { e.stopPropagation(); openModule("selfjournal"); }} className="rounded-full px-3 py-1 text-[10px] font-semibold border border-ivory/30 text-ivory hover:bg-ivory/10 transition">Open</button>
          </div>
        </BrandPhoto>
      </div>
    </WidgetShell>
  );
}