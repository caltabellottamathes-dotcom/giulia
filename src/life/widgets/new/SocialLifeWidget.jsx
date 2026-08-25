import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { closeCircle, daysSince } from "@/lib/domainUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ae8a21262_Social_.jpeg";
const CENTER = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/3da3623a2_SOCIALCIRCLEPROFILE.jpg";
const IVORY = "hsl(var(--ivory))";
const PISTACHIO = "#d8dab3"; // fresh ≤7d
const RIDGE = "#b1bec6";    // 8–14d
const OLIVE = "#94925d";    // 15–21d
const SMOKE = "hsl(var(--smoke))"; // >21d / geen contact

function orbitColor(days) {
  if (days === Infinity) return SMOKE;
  if (days <= 7) return PISTACHIO;
  if (days <= 14) return RIDGE;
  if (days <= 21) return OLIVE;
  return SMOKE;
}
function orbitOpacity(days) {
  if (days === Infinity) return 0.28;
  if (days <= 7) return 0.95;
  if (days <= 14) return 0.6;
  if (days <= 21) return 0.42;
  return 0.28;
}
function orbitRadius(days) {
  if (days === Infinity) return 46;
  if (days <= 7) return 22;
  if (days <= 14) return 32;
  if (days <= 21) return 40;
  return 46;
}

/** SocialLifeWidget — 01 · WHAT SOCIAL LIFE?
 *  Orbit wordt nu aangedreven door ECHTE Contact-entities (closeCircle),
 *  gepositioneerd op recency (days since last_contact_date). Geen mock-data. */
export default function SocialLifeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: contacts } = useEntityList("Contact", { realtime: true, externalTick: learnTick });
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: whatsapps } = useEntityList("WhatsAppMessage", { sort: "-timestamp", realtime: true, externalTick: learnTick });

  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  // Echte close-circle contacts → orbit nodes gepositioneerd op recency.
  const orbit = useMemo(() => {
    const circle = closeCircle(contacts || []);
    return circle.slice(0, 8).map((c, i) => {
      const days = daysSince(c.last_contact_date);
      const total = Math.max(circle.length, 1);
      const a = (i / total) * 360 - 90;
      return { name: c.name, days, r: orbitRadius(days), a };
    });
  }, [contacts]);

  const RINGS = [12, 22, 32, 42, 48];

  return (
    <div className="relative w-full aspect-[4/5] rounded-[28px] overflow-hidden" onClick={() => openModule("social")} style={{ cursor: "pointer" }}>
      <img src={PHOTO} alt="What Social Life" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

      <div className="absolute top-0 inset-x-0 p-3 z-10 flex items-center gap-2" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
        <span className="flex items-end gap-[2px] h-3 shrink-0">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="w-[2.5px] rounded-full" style={{ background: PISTACHIO }} animate={{ height: ["28%", "100%", "42%", "78%", "28%"] }} transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.24 }} />
          ))}
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] font-bold">What Social Life?</span>
      </div>

      <div
        className="absolute left-0 right-0 bottom-0 h-[66%] rounded-t-[28px] flex items-center justify-center overflow-hidden"
        style={{ "--tile-accent": PISTACHIO, background: "rgba(120,128,133,0.16)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.18), 0 12px 36px -16px rgba(0,0,0,0.18)" }}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${PISTACHIO} 18%, ${PISTACHIO} 82%, transparent)` }} />
        <span className="absolute pointer-events-none select-none" style={{ left: "-10px", bottom: "-40px", fontSize: "150px", lineHeight: "0.78", fontWeight: 800, color: IVORY, opacity: 0.13, fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>{interactions}</span>

        <div className="relative w-full h-full max-w-[210px] max-h-[210px] aspect-square">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            {RINGS.map((rr, i) => (
              <circle key={i} cx="50" cy="50" r={rr} fill="none" stroke={IVORY} strokeWidth="0.45" opacity={0.1 + i * 0.03} strokeDasharray="1.6 2.4" />
            ))}
            {orbit.map((c, i) => {
              const rad = (c.a * Math.PI) / 180;
              const x = 50 + Math.cos(rad) * c.r;
              const y = 50 + Math.sin(rad) * c.r;
              const col = orbitColor(c.days);
              const op = orbitOpacity(c.days);
              return (
                <g key={i}>
                  <line x1="50" y1="50" x2={x} y2={y} stroke={col} strokeWidth="0.7" opacity={op} />
                  <circle cx={x} cy={y} r="3" fill={col} />
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
            const col = orbitColor(c.days);
            return (
              <motion.div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, color: IVORY }} animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
                <span className="text-[11px] font-bold whitespace-nowrap leading-none">{c.name.split(" ")[0]}</span>
                <span className="text-[8px] mt-0.5" style={{ color: col }}>{c.days === Infinity ? "—" : `${c.days}d`}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}