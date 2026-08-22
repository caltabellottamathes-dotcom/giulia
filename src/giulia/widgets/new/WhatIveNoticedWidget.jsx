import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassPhotoLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/c78cbf3f8_What_Ive_Noticed.jpeg";
const DEEP = "hsl(var(--d-giulia-deep))";    // olijf
const LIGHT = "hsl(var(--d-giulia-light))";  // pistachio
const URGENT = "hsl(var(--d-giulia-urgent))"; // urgent geelgroen

/** WhatIveNoticedWidget — G·1x1·T·STRIP (gelaagd).
 *  Foto-strip boven: uploaded foto + header "What I've noticed.".
 *  Glas-shell eronder: grote live geanimeerde multi-value gauge-ring met de
 *  3 hoofdonderwerpen van inzichten — Observaties, Self, Journal. Drie
 *  concentrische bogen (olijf / pistachio / urgent) animeren naar hun waarde.
 *  Kleursysteem: GIULIA + Urgent. */

const RINGS = [
  { key: "observaties", label: "Observaties", r: 50, color: DEEP },
  { key: "self", label: "Self", r: 39, color: LIGHT },
  { key: "journal", label: "Journal", r: 28, color: URGENT },
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
    <div className="w-[340px]">
      <GlassPhotoLayeredWidget
        shape="1:1"
        photo={PHOTO}
        photoPosition="top"
        photoFraction={0.30}
        overhang={0.05}
        domain="giulia"
        radius="large"
        photoOverlay="bg-gradient-to-t from-black/40 via-black/10 to-transparent"
        photoChildren={
          <div className="absolute inset-0 px-4 pt-3 flex items-start justify-between">
            <WidgetHeader label="What I've noticed." type="pulse" />
          </div>
        }
      >
        {/* grote live multi-value gauge ring */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="relative w-[150px] h-[150px]">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <g transform="rotate(-90 60 60)">
                {RINGS.map((ring, idx) => {
                  const circ = 2 * Math.PI * ring.r;
                  const frac = max ? counts[ring.key] / max : 0;
                  const offset = circ * (1 - frac);
                  return (
                    <g key={ring.key}>
                      <circle cx="60" cy="60" r={ring.r} fill="none" stroke={ring.color} strokeOpacity="0.14" strokeWidth="7" />
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <CountUp value={total} className="text-[26px] font-display font-bold leading-none" />
              <span className="text-[8px] uppercase tracking-[0.24em] opacity-50 mt-0.5">totaal</span>
            </div>
          </div>
        </div>

        {/* legenda — 3 onderwerpen, klik opent insights */}
        <div className="flex justify-between gap-1 shrink-0 pt-1">
          {RINGS.map((ring) => (
            <button key={ring.key} onClick={() => openModule("insights")} className="flex items-center gap-1.5 text-left hover:opacity-80 transition">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: ring.color }} />
              <div className="flex flex-col leading-none">
                <span className="text-[7.5px] uppercase tracking-[0.16em] opacity-50">{ring.label}</span>
                <span className="text-[13px] font-display font-bold tabular-nums">{counts[ring.key]}</span>
              </div>
            </button>
          ))}
        </div>
      </GlassPhotoLayeredWidget>
    </div>
  );
}