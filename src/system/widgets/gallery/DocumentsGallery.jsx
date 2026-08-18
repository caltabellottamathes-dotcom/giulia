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
import { ACCENT } from "./palette";

const A = ACCENT.focus;

/** Documents — "Wat is recent?" Doc-count + type chips. */
export default function DocumentsGallery() {
  const { openModule } = usePanel();
  const t = useLearningSync();
  const { data: docs } = useEntityList("Document", { sort: "-created_date", realtime: true, externalTick: t });
  const recent = (docs || []).slice(0, 20);
  const count = recent.length;
  const types = useMemo(() => { const m = {}; recent.forEach(d => { const tp = d.type || "other"; m[tp] = (m[tp] || 0) + 1; }); return m; }, [recent]);
  const typeList = Object.entries(types).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const headline = count === 0 ? "LEEG" : count <= 5 ? "OVERZICHT" : "VEEL BESTANDEN";
  const sub = count === 0 ? "Geen documenten" : `${count} documenten`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("documents")} className="min-h-[220px]" style={{ "--tile-accent": A }}>
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <WidgetHeader label="Documenten" count={count ? `${count}` : "leeg"} />
        <h3 className="text-[26px] leading-[1.05] font-display font-semibold tracking-[-0.02em] text-current">{headline}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>
        <div className="mt-4 flex items-end gap-4">
          <CountUp value={count} className="text-[60px] leading-[0.82] font-display font-semibold tabular-nums text-current" />
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {typeList.map(([tp, n], i) => (
            <motion.div key={tp} className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,0.06)" }}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: A }} />
              <span className="text-[9px] uppercase tracking-wide text-ivory/70 font-semibold">{tp}</span>
              <span className="text-[9px] tabular-nums text-ivory/40">{n}</span>
            </motion.div>
          ))}
          {!count && <p className="text-[10px] text-ivory/30 italic">Geen documenten gevonden</p>}
        </div>
        <div className="flex-1" />
      </div>
      <BrandPhoto src={IMAGES.chairsScattered} className="h-16 w-full" overlay="bg-gradient-to-t from-charcoal/55 to-transparent">
        <div className="absolute inset-0 flex items-center px-5">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/65 font-semibold">{count ? `${typeList.length} soorten · ${count} bestanden` : "Geen bestanden"}</p>
        </div>
      </BrandPhoto>
    </WidgetShell>
  );
}