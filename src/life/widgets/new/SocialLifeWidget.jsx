import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { closeCircle, daysSince, meaningfulInteractions, orbitTier, ORBIT_TIERS } from "@/lib/domainUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ae8a21262_Social_.jpeg";
const CENTER = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/3da3623a2_SOCIALCIRCLEPROFILE.jpg";
const IVORY = "hsl(var(--ivory))";

/** SocialLifeWidget — 01 · WHAT SOCIAL LIFE?
 *  Orbit aangedreven door ECHTE Contact-entities (closeCircle), gepositioneerd
 *  op 7 recency-zones (ORBIT_TIERS) — geen 1 ring per dag. Het ghost-cijfer is
 *  het aantal BETEKENISVOLLE interacties in 7 dagen (verzonden berichten +
 *  afspraken), niet ontvangen post. */
export default function SocialLifeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: contacts } = useEntityList("Contact", { realtime: true, externalTick: learnTick });
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: whatsapps } = useEntityList("WhatsAppMessage", { sort: "-timestamp", realtime: true, externalTick: learnTick });

  const mi = useMemo(() => meaningfulInteractions({ emails, whatsapps, days: 7 }), [emails, whatsapps]);

  const orbit = useMemo(() => {
    const circle = closeCircle(contacts || [])
      .slice()
      .sort((a, b) => daysSince(a.last_contact_date) - daysSince(b.last_contact_date))
      .slice(0, 8);
    return circle.map((c, i) => {
      const days = daysSince(c.last_contact_date);
      const tier = orbitTier(days);
      const total = Math.max(circle.length, 1);
      const a = (i / total) * 360 - 90;
      return { name: c.name, days, r: tier.r, color: tier.color };
    });
  }, [contacts]);

  return (
    <div className="relative w-full aspect-[4/5] rounded-[28px] overflow-hidden" onClick={() => openModule("social")} style={{ cursor: "pointer" }}>
      <img src={PHOTO} alt="What Social Life" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      <div className="absolute top-0 inset-x-0 p-3 z-10 flex items-center gap-2" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
        <span className="flex items-end gap-[2px] h-3 shrink-0">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="w-[2.5px] rounded-full" style={{ background: ORBIT_TIERS[0].color }} animate={{ height: ["28%", "100%", "42%", "78%", "28%"] }} transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.24 }} />
          ))}
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] font-bold">What Social Life?</span>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 h-[66%] rounded-t-[28px] flex items-center justify-center overflow-hidden"
        style={{ "--tile-accent": ORBIT_TIERS[0].color, background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.18), 0 12px 36px -16px rgba(0,0,0,0.18)" }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ORBIT_TIERS[0].color} 18%, ${ORBIT_TIERS[0].color} 82%, transparent)` }} />
        <span className="absolute pointer-events-none select-none" style={{ left: "-10px", bottom: "-40px", fontSize: "150px", lineHeight: "0.78", fontWeight: 800, color: IVORY, opacity: 0.13, fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>{mi.total}</span>

        <div className="relative w-full h-full max-w-[210px] max-h-[210px] aspect-square">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            {ORBIT_TIERS.map((t, i) => (
              <circle key={i} cx="50" cy="50" r={t.r} fill="none" stroke={IVORY} strokeWidth="0.4" opacity={0.08 + i * 0.018} strokeDasharray="1.4 2.2" />
            ))}
            {orbit.map((c, i) => {
              const rad = (c.a * Math.PI) / 180;
              const x = 50 + Math.cos(rad) * c.r;
              const y = 50 + Math.sin(rad) * c.r;
              const op = c.days <= 7 ? 0.95 : c.days <= 14 ? 0.6 : c.days <= 30 ? 0.42 : 0.28;
              return (
                <g key={i}>
                  <line x1="50" y1="50" x2={x} y2={y} stroke={c.color} strokeWidth="0.7" opacity={op} />
                  <circle cx={x} cy={y} r="3" fill={c.color} />
                </g>
              );
            })}
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full overflow-hidden ring-2" style={{ "--tw-ring-color": IVORY }}>
            <img src={CENTER} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
          {orbit.map((c, i) => {
            const rad = (c.a * Math.PI) / 180;
            const x = 50 + Math.cos(rad) * c.r;
            const y = 50 + Math.sin(rad) * c.r;
            return (
              <motion.div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, color: IVORY }} animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
                <span className="text-[11px] font-bold whitespace-nowrap leading-none">{c.name.split(" ")[0]}</span>
                <span className="text-[8px] mt-0.5" style={{ color: c.color }}>{c.days === Infinity ? "—" : `${c.days}d`}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}