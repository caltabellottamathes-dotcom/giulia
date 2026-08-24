import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { useLearningSync } from "@/hooks/useLearningSync";
import { socialPulse } from "@/lib/domainUtils";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/bfc15b81f_ALOT_SOCIAL.jpeg";
const CENTER = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/3da3623a2_SOCIALCIRCLEPROFILE.jpg";
const DEEP = "hsl(var(--d-life-deep))";   // ridge sky
const LIGHT = "hsl(var(--d-life-light))"; // whipped pistachio
const IVORY = "hsl(var(--ivory))";

/** SocialLifeWidget — P·4:5 · PhotoCard-strip boven + GlassShell beneden.
 *  GlassShell-inhoud = Close Circle (SocialOrbit #16): centraal portret met
 *  cirkelende contacten; radius = recentie, pistachio = wachtend. Alleen
 *  LIFE-kleuren — geen Urgent. */
export default function SocialLifeWidget() {
  const { openModule } = usePanel();
  const learnTick = useLearningSync();
  const { data: contacts } = useEntityList("Contact", { realtime: true, externalTick: learnTick });
  const { data: emails } = useEntityList("Email", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: whatsapps } = useEntityList("WhatsAppMessage", { sort: "-timestamp", realtime: true, externalTick: learnTick });
  const { data: plans } = useEntityList("SocialPlan", { realtime: true, externalTick: learnTick });

  const pulse = useMemo(() => socialPulse(contacts), [contacts]);
  const overdueCount = pulse.filter((p) => p.overdue).length;

  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  const activePlans = (plans || []).filter((p) => p.status === "planned" || p.status === "confirmed").length;

  const orbit = useMemo(() => {
    return pulse.slice(0, 6).map((p, i, arr) => ({
      name: p.contact.name,
      days: p.since,
      overdue: p.overdue,
      r: 24 + Math.min(p.since, 26) * 0.5,
      a: arr.length > 1 ? (i / arr.length) * 360 : 0,
    }));
  }, [pulse]);

  const headline = interactions >= 10 ? "A LOT HAPPENING" : overdueCount > 3 ? "QUIETER" : "CONNECTED";

  return (
    <div className="relative w-full aspect-[4/5] rounded-[28px] overflow-hidden" onClick={() => openModule("social")} style={{ cursor: "pointer", color: IVORY }}>
      {/* PhotoCard-strip boven */}
      <img src={PHOTO} alt="What Social Life" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute top-0 inset-x-0 h-[38%] flex flex-col p-4 pb-3" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.04))", textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>
        <WidgetHeader type="social" label="What Social Life?" count={overdueCount ? `${overdueCount} wacht` : "bij"} />
        <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{headline}</h3>
        <div className="flex items-end gap-2.5 mt-auto">
          <span className="text-[44px] leading-[0.8] font-display font-semibold tabular-nums" style={{ color: overdueCount ? LIGHT : IVORY }}>{interactions}</span>
          <p className="text-[9px] uppercase tracking-[0.18em] opacity-70 mb-1 leading-tight">interacties<br />30 dagen</p>
        </div>
      </div>

      {/* GlassShell beneden met Close Circle (#16) */}
      <div className="absolute bottom-0 inset-x-0 h-[62%] rounded-t-[28px] flex flex-col p-4 overflow-hidden"
        style={{ background: "rgba(120,128,133,0.18)", backdropFilter: "blur(28px) saturate(1.4)", WebkitBackdropFilter: "blur(28px) saturate(1.4)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 -16px 34px -14px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] uppercase tracking-[0.22em] font-bold">Social Pulse · close circle</span>
          <span className="text-[8px] uppercase tracking-[0.14em] opacity-55">{orbit.length} mensen · {activePlans} plannen</span>
        </div>
        <div className="flex-1 relative flex items-center justify-center min-h-0">
          <div className="relative w-full h-full max-w-[340px] max-h-[340px] aspect-square">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {[24, 34, 44].map((rr, i) => (
                <circle key={i} cx="50" cy="50" r={rr} fill="none" stroke={IVORY} strokeWidth="0.4" opacity="0.18" strokeDasharray="2 2.5" />
              ))}
              {orbit.map((c, i) => {
                const rad = (c.a * Math.PI) / 180;
                const x = 50 + Math.cos(rad) * c.r;
                const y = 50 + Math.sin(rad) * c.r;
                return (
                  <g key={i}>
                    <line x1="50" y1="50" x2={x} y2={y} stroke={c.overdue ? LIGHT : DEEP} strokeWidth="0.6" opacity={c.overdue ? 0.8 : 0.45} />
                    <circle cx={x} cy={y} r="2.6" fill={c.overdue ? LIGHT : DEEP} />
                  </g>
                );
              })}
            </svg>
            {/* centraal portret */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full overflow-hidden ring-2" style={{ "--tw-ring-color": IVORY }}>
              <img src={CENTER} alt="" className="h-full w-full object-cover" draggable={false} />
            </div>
            {/* labels */}
            {orbit.map((c, i) => {
              const rad = (c.a * Math.PI) / 180;
              const x = 50 + Math.cos(rad) * c.r;
              const y = 50 + Math.sin(rad) * c.r;
              return (
                <motion.div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%` }} animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <span className="text-[8.5px] font-bold whitespace-nowrap leading-none">{c.name}</span>
                  <span className="text-[7px] opacity-55 mt-0.5">{c.days}d</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}