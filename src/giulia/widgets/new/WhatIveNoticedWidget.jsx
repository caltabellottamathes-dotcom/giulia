import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/5f19aeb8d_Noticed_.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";    // olijf
const LIGHT = "hsl(var(--d-giulia-light))";  // pistachio
const URGENT = "hsl(var(--d-giulia-urgent))"; // urgent

/** WhatIveNoticedWidget — "WHAT I'VE NOTICED" · P·1x1·B·STRIP (gelaagd).
 *  Shell = foto + gradient-overlay + XL multivalue gauge-ring (3 concentrische
 *  bogen: Observaties / Self / Journal) gecentreerd boven. Card = onderste
 *  strip: header met geanimeerd icoon + "WHAT I'VE NOTICED" + 3 groepen met
 *  telling. Kleursysteem: GIULIA + Urgent. */

const GROUPS = [
  { key: "observaties", label: "Observaties", r: 50, color: DEEP },
  { key: "self", label: "Self", r: 38, color: LIGHT },
  { key: "journal", label: "Journal", r: 26, color: "hsl(var(--ridge))" },
];

export default function WhatIveNoticedWidget() {
  const { openModule } = usePanel();
  const [counts, setCounts] = useState({ observaties: 0, self: 0, journal: 0 });

  useEffect(() => {
    Promise.all([
      base44.entities.Insight.list("-created_date", 200).then((r) => (r || []).length).catch(() => 0),
      base44.entities.SelfInsight.list("-created_date", 200).then((r) => (r || []).length).catch(() => 0),
      base44.entities.JournalEntry.list("-created_date", 200).then((r) => (r || []).length).catch(() => 0),
    ]).then(([o, s, j]) => setCounts({ observaties: o, self: s, journal: j }));
  }, []);

  const total = counts.observaties + counts.self + counts.journal;
  const max = Math.max(3, counts.observaties, counts.self, counts.journal);

  return (
    <div className="w-full h-[300px]">
      <PhotoGlassLayeredWidget
        shape="1:1"
        photo={PHOTO}
        glassPosition="bottom"
        glassFraction={0.34}
        overhang={0}
        domain="giulia"
        radius="large"
        onClick={() => openModule("insights")}
        overlay="bg-gradient-to-t from-black/30 via-black/12 to-transparent"
        photoChildren={
          <div className="absolute" style={{ left: "50%", top: "43%", transform: "translate(-50%,-50%)" }}>
            <div className="relative w-[250px] h-[250px]">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <g transform="rotate(-90 60 60)">
                  {GROUPS.map((ring, idx) => {
                    const circ = 2 * Math.PI * ring.r;
                    const frac = Math.min(1, counts[ring.key] / 50);
                    const offset = circ * (1 - frac);
                    return (
                      <g key={ring.key}>
                        <circle cx="60" cy="60" r={ring.r} fill="none" stroke={ring.color} strokeOpacity="0.18" strokeWidth="7" />
                        <motion.circle
                          cx="60" cy="60" r={ring.r} fill="none" stroke={ring.color} strokeWidth="7" strokeLinecap="round"
                          strokeDasharray={circ}
                          initial={{ strokeDashoffset: circ }}
                          animate={{ strokeDashoffset: offset }}
                          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: idx * 0.12 }}
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: "white" }}>
                <CountUp value={total} className="text-[44px] font-display font-bold leading-none" />
                <span className="text-[8px] uppercase tracking-[0.24em] opacity-70 mt-0.5">totaal</span>
              </div>
            </div>
          </div>
        }
      >
        {/* strip-card: header + 3 groepen */}
        <WidgetHeader type="energy" label="WHAT I'VE NOTICED." />
        <div className="flex justify-between gap-1 mt-1.5">
          {GROUPS.map((g) => (
            <button key={g.key} onClick={(e) => { e.stopPropagation(); openModule("insights"); }} className="flex items-center gap-1.5 text-left hover:opacity-80 transition">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: g.color }} />
              <div className="flex flex-col leading-none">
                <span className="text-[7.5px] uppercase tracking-[0.16em] opacity-50">{g.label}</span>
                <span className="text-[20px] font-display font-bold tabular-nums">{counts[g.key]}</span>
              </div>
            </button>
          ))}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}