import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusMoodboard;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const NEUT = "hsl(var(--smoke))";
const ACTIVE = ["in_progress", "planning", "review", "afwerking"];

const GROUPS = [
  { key: "taken", label: "Taken", r: 50, color: DEEP },
  { key: "projecten", label: "Projecten", r: 38, color: LIGHT },
  { key: "email", label: "Email", r: 26, color: NEUT },
];

/** WhatIveNoticedFocusWidget — P·1x1·B·STRIP · "WHAT I'VE NOTICED."
 *  Focus-twin. Foto = focusMoodboard. XL gauge-ring met 3 bogen
 *  (open Taken / actieve Projecten / ongelezen Email) + strip met telling. */
export default function WhatIveNoticedFocusWidget() {
  const { openModule } = usePanel();
  const [counts, setCounts] = useState({ taken: 0, projecten: 0, email: 0 });

  useEffect(() => {
    Promise.all([
      base44.entities.Task.list("-created_date", 200).then((r) => (r || []).filter((t) => t.domain === "focus" && !["completed", "archived"].includes(t.status)).length).catch(() => 0),
      base44.entities.Project.list("-created_date", 200).then((r) => (r || []).filter((p) => ACTIVE.includes(p.status)).length).catch(() => 0),
      base44.entities.Email.list("-created_date", 200).then((r) => (r || []).filter((e) => e.status === "unread").length).catch(() => 0),
    ]).then(([t, p, e]) => setCounts({ taken: t, projecten: p, email: e }));
  }, []);

  const total = counts.taken + counts.projecten + counts.email;

  return (
    <div className="w-full h-[300px]">
      <PhotoGlassLayeredWidget shape="1:1" photo={PHOTO} glassPosition="bottom" glassFraction={0.34} overhang={0} domain="focus" radius="large" onClick={() => openModule("insights")} overlay="bg-gradient-to-t from-black/30 via-black/12 to-transparent"
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
                        <motion.circle cx="60" cy="60" r={ring.r} fill="none" stroke={ring.color} strokeWidth="7" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: idx * 0.12 }} />
                      </g>
                    );
                  })}
                </g>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: "white" }}>
                <CountUp value={total} className="text-[44px] font-display font-bold leading-none" />
                <span className="text-[8px] uppercase tracking-[0.24em] opacity-70 mt-0.5">focus</span>
              </div>
            </div>
          </div>
        }
      >
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