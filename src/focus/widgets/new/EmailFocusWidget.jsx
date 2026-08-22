import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader, CountUp } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusMail;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const NEUT = "hsl(var(--smoke))";

const GROUPS = [
  { key: "unread", label: "Ongelezen", r: 50, color: DEEP },
  { key: "important", label: "Belangrijk", r: 38, color: LIGHT },
  { key: "drafts", label: "Concepten", r: 26, color: NEUT },
];

/** EmailFocusWidget — P·1x1·B·STRIP · "Online Postoffice."
 *  Foto = focusMetalGloves. XL gauge-ring (Ongelezen / Belangrijk / Concepten)
 *  + strip met telling. Data: Email. */
export default function EmailFocusWidget() {
  const { openModule } = usePanel();
  const { data: emails } = useEntityList("Email", { sort: "-created_date", limit: 200, realtime: true });

  const counts = useMemo(() => {
    const all = emails || [];
    return {
      unread: all.filter((e) => e.status === "unread").length,
      important: all.filter((e) => e.status === "unread" && (e.important || e.category === "important")).length,
      drafts: all.filter((e) => e.status === "draft" || ["drafts", "giulia_drafts"].includes(e.folder)).length,
    };
  }, [emails]);
  const total = counts.unread;

  return (
    <div className="w-full h-[300px]">
      <PhotoGlassLayeredWidget shape="1:1" photo={PHOTO} glassPosition="bottom" glassFraction={0.34} overhang={0} domain="focus" radius="large" onClick={() => openModule("email")} overlay="bg-gradient-to-t from-black/30 via-black/12 to-transparent"
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
                <span className="text-[8px] uppercase tracking-[0.24em] opacity-70 mt-0.5">mail</span>
              </div>
            </div>
          </div>
        }
      >
        <WidgetHeader type="social" label="ONLINE POSTOFFICE." />
        <div className="flex justify-between gap-1 mt-1.5">
          {GROUPS.map((g) => (
            <button key={g.key} onClick={(e) => { e.stopPropagation(); openModule("email"); }} className="flex items-center gap-1.5 text-left hover:opacity-80 transition">
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