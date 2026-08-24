import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { CONTACTS } from "@/self/widgets/editorial2/SocialOrbit";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/bfc15b81f_ALOT_SOCIAL.jpeg";
const CENTER = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/3da3623a2_SOCIALCIRCLEPROFILE.jpg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3"; // fresh ≤7d
const RIDGE = "#b1bec6";    // 8–14d
const OLIVE = "#94925d";     // 15–21d
const SMOKE = "hsl(var(--smoke))"; // >21d vergeten

/** orbitColor — 4 tiers (uitgebreid met Olive + Smoke), verschaald naar
 *  recentie: vers = pistachio (sterk), oud = smoke (vaag). */
function orbitColor(days) {
  if (days <= 7) return PISTACHIO;
  if (days <= 14) return RIDGE;
  if (days <= 21) return OLIVE;
  return SMOKE;
}
function orbitOpacity(days) {
  if (days <= 7) return 0.95;
  if (days <= 14) return 0.6;
  if (days <= 21) return 0.42;
  return 0.28;
}

/** SocialLifeWidget — 01 · WHAT SOCIAL LIFE?
 *  3:2 (zelfde hoogte als 04). Foto full-bleed ZONDER overlay. Rechts een
 *  glaspanel (zelfde glas als andere widgets) met WidgetHeader (equalizer-
 *  embleem) + de #16 SocialOrbit: zelfde data (CONTACTS) + afstanden, 5
 *  duidelijke rings, uitgebreid kleurenlogica (pistachio/ridge/olive/smoke). */
export default function SocialLifeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: whatsapps } = useEntityList("WhatsAppMessage", { sort: "-timestamp", realtime: true, externalTick: learnTick });

  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  const RINGS = [12, 22, 32, 42, 48];

  return (
    <div className="relative w-full aspect-[3/2] rounded-[28px] overflow-hidden" onClick={() => openModule("social")} style={{ cursor: "pointer" }}>
      {/* foto full-bleed, géén overlay */}
      <img src={PHOTO} alt="What Social Life" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      {/* glas rechts — zelfde glas als andere widgets (04) */}
      <div
        className="absolute inset-y-0 right-0 w-[64%] rounded-l-[24px] flex flex-col p-4 overflow-hidden"
        style={{ "--tile-accent": PISTACHIO, background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.18), 0 12px 36px -16px rgba(0,0,0,0.18)", color: IVORY }}
      >
        <span className="pointer-events-none absolute inset-0 rounded-l-[24px] ring-1 ring-inset ring-white/10" />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${PISTACHIO} 18%, ${PISTACHIO} 82%, transparent)` }} />

        <WidgetHeader type="social" label="What Social Life?" count={`${interactions} interacties`} />

        <div className="flex-1 relative min-h-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-[260px] max-h-[260px] aspect-square">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {RINGS.map((rr, i) => (
                <circle key={i} cx="50" cy="50" r={rr} fill="none" stroke={IVORY} strokeWidth="0.4" opacity={0.1 + i * 0.03} strokeDasharray="1.6 2.4" />
              ))}
              {CONTACTS.map((c, i) => {
                const rad = (c.a * Math.PI) / 180;
                const x = 50 + Math.cos(rad) * c.r;
                const y = 50 + Math.sin(rad) * c.r;
                const col = orbitColor(c.days);
                const op = orbitOpacity(c.days);
                return (
                  <g key={i}>
                    <line x1="50" y1="50" x2={x} y2={y} stroke={col} strokeWidth="0.6" opacity={op} />
                    <circle cx={x} cy={y} r="2.8" fill={col} />
                  </g>
                );
              })}
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full overflow-hidden ring-2" style={{ "--tw-ring-color": IVORY }}>
              <img src={CENTER} alt="" className="h-full w-full object-cover" draggable={false} />
            </div>
            {CONTACTS.map((c, i) => {
              const rad = (c.a * Math.PI) / 180;
              const x = 50 + Math.cos(rad) * c.r;
              const y = 50 + Math.sin(rad) * c.r;
              const col = orbitColor(c.days);
              return (
                <motion.div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, color: IVORY }} animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
                  <span className="text-[11px] font-bold whitespace-nowrap leading-none">{c.name}</span>
                  <span className="text-[8px] mt-0.5" style={{ color: col }}>{c.days}d</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}