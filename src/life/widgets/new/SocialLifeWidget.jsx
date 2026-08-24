import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { GlassPhotoWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { CONTACTS } from "@/self/widgets/editorial2/SocialOrbit";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/bfc15b81f_ALOT_SOCIAL.jpeg";
const CENTER = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/3da3623a2_SOCIALCIRCLEPROFILE.jpg";
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";

/** SocialLifeWidget — 01 · WHAT SOCIAL LIFE?
 *  Oude verhouding & ontwerp (4:5 GlassPhotoWidget, foto boven + glasinhouud),
 *  kleiner gemaakt. Volgt #16 SocialOrbit: zelfde data (CONTACTS), kleur-
 *  logica (stale=DEEP ridge, fresh=LIGHT pistachio) en afstanden (rings
 *  18/30/42). */
export default function SocialLifeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: whatsapps } = useEntityList("WhatsAppMessage", { sort: "-timestamp", realtime: true, externalTick: learnTick });

  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  const overdueCount = CONTACTS.filter((c) => c.days > 14).length;
  const headline = interactions >= 10 ? "A LOT HAPPENING" : overdueCount > 1 ? "QUIETER" : "CONNECTED";

  return (
    <div onClick={() => openModule("social")} className="cursor-pointer">
      <GlassPhotoWidget
        shape="4:5"
        photo={PHOTO}
        photoPosition="top"
        photoFraction={0.38}
        domain="life"
        photoChildren={
          <>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.28))" }} />
            <div className="absolute inset-0 flex flex-col justify-between p-3" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-[0.22em] font-bold">What Social Life?</span>
                <span className="text-[7px] uppercase tracking-[0.14em] opacity-65">{overdueCount ? `${overdueCount} wacht` : "bij"}</span>
              </div>
              <div>
                <h3 className="text-[15px] leading-[1.05] font-display font-semibold tracking-[-0.02em]">{headline}</h3>
                <div className="flex items-end gap-1.5 mt-1">
                  <span className="text-[26px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: overdueCount ? LIGHT : IVORY }}>{interactions}</span>
                  <p className="text-[7px] uppercase tracking-[0.16em] opacity-70 mb-1 leading-tight">interacties<br />30d</p>
                </div>
              </div>
            </div>
          </>
        }
      >
        <div className="flex flex-col h-full" style={{ color: DEEP }}>
          <WidgetHeader label="Social Pulse · close circle" count={`${CONTACTS.length}`} />
          <div className="flex-1 relative min-h-0 flex items-center justify-center">
            <div className="relative w-full h-full max-w-[130px] max-h-[130px] aspect-square">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                {[18, 30, 42].map((rr, i) => (
                  <circle key={i} cx="50" cy="50" r={rr} fill="none" stroke={DEEP} strokeWidth="0.4" opacity="0.18" strokeDasharray="2 2.5" />
                ))}
                {CONTACTS.map((c, i) => {
                  const rad = (c.a * Math.PI) / 180;
                  const x = 50 + Math.cos(rad) * c.r;
                  const y = 50 + Math.sin(rad) * c.r;
                  const stale = c.days > 14;
                  return (
                    <g key={i}>
                      <line x1="50" y1="50" x2={x} y2={y} stroke={stale ? DEEP : LIGHT} strokeWidth="0.6" opacity={stale ? 0.75 : 0.4} />
                      <circle cx={x} cy={y} r="2.6" fill={stale ? DEEP : LIGHT} />
                    </g>
                  );
                })}
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full overflow-hidden ring-2" style={{ "--tw-ring-color": IVORY }}>
                <img src={CENTER} alt="" className="h-full w-full object-cover" draggable={false} />
              </div>
              {CONTACTS.map((c, i) => {
                const rad = (c.a * Math.PI) / 180;
                const x = 50 + Math.cos(rad) * c.r;
                const y = 50 + Math.sin(rad) * c.r;
                return (
                  <motion.div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, color: IVORY }} animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
                    <span className="text-[9px] font-bold whitespace-nowrap leading-none">{c.name}</span>
                    <span className="text-[6px] opacity-55 mt-0.5">{c.days}d</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </GlassPhotoWidget>
    </div>
  );
}