import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusPeople;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const NEUT = "hsl(var(--smoke))";

const GROUPS = [
  { key: "focus", label: "Focus", color: DEEP },
  { key: "life", label: "Life", color: LIGHT },
  { key: "self", label: "Self", color: NEUT },
];

/** PeopleFocusWidget — P·2x3·B·SIDE · "People Around Me."
 *  Foto = focusCorridor. Comparison-gauge: contacten per relatie-domein
 *  (Focus / Life / Self) + aantal contacten dat aan een beurt toe is.
 *  Data: Contact. */
export default function PeopleFocusWidget() {
  const { openModule } = usePanel();
  const { data: contacts } = useEntityList("Contact", { sort: "-created_date", limit: 200, realtime: true });

  const { counts, total, overdue } = useMemo(() => {
    const all = contacts || [];
    const c = { focus: 0, life: 0, self: 0 };
    all.forEach((p) => { if (c[p.relationship_domain] != null) c[p.relationship_domain]++; });
    const now = Date.now();
    const od = all.filter((p) => {
      if (!p.last_contact_date) return false;
      const days = (now - new Date(p.last_contact_date).getTime()) / 86400000;
      const freq = p.desired_frequency_days || 30;
      return days > freq;
    }).length;
    return { counts: c, total: all.length, overdue: od };
  }, [contacts]);
  const max = Math.max(1, counts.focus, counts.life, counts.self);

  return (
    <div className="w-full h-[380px]">
      <PhotoGlassLayeredWidget shape="2:3" photo={PHOTO} glassPosition="bottom" glassFraction={0.48} overhang={0} domain="focus" radius="large" onClick={() => openModule("people")} overlay="bg-gradient-to-t from-black/55 via-black/25 to-black/5">
        <div className="flex items-center justify-between">
          <WidgetHeader type="social" label="People Around Me." count={total ? String(total) : ""} />
          <span className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: overdue > 0 ? "hsl(var(--d-focus-urgent))" : LIGHT }}>{overdue} aan beurt</span>
        </div>

        <div className="flex flex-col gap-2.5 mt-3">
          {GROUPS.map((g, i) => {
            const val = counts[g.key];
            const frac = val / max;
            return (
              <motion.button key={g.key} onClick={(e) => { e.stopPropagation(); openModule("people"); }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }} className="text-left">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-[0.22em] font-bold" style={{ color: "hsl(var(--ivory))" }}>{g.label}</span>
                  <span className="text-[18px] font-display font-bold tabular-nums leading-none">{val}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: "0%" }} animate={{ width: `${frac * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.08 }} style={{ backgroundColor: g.color }} />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/50">Totaal</span>
          <CountUp value={total} className="text-[26px] font-display font-bold tabular-nums" />
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}