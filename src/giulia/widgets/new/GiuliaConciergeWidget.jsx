import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageSquare, Phone } from "lucide-react";
import { WidgetShell, WidgetHeader } from "@/system/widgets/primitives";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg";

/** GiuliaConciergeWidget — "GIULIA'S HOTLINE".
 *  Foto als grote shell. Bovenaan de beweegde header op de foto; onderaan een
 *  hoger, transparant glas (zoals de What-Matters-checklist: rgba white 0.10
 *  + blur 8px) met afgeronde bovenhoeken en een omhooglopende schaduw. Minder
 *  tekst, sterkere Giulia-gekleurde visuals: EKG-hero (olijf→urgent, gloed) +
 *  live-puls + activiteitsstaven (pistachio/urgent) + elegante Chat/Bel. */
const STATES = ["Listening", "Thinking", "Processing", "Acting", "Waiting"];
const PATH = "M 0 50 L 18 50 L 24 50 L 30 28 L 36 72 L 42 40 L 48 50 L 60 50 L 66 50 L 72 34 L 78 66 L 84 50 L 100 50";

const DEEP = "hsl(var(--d-giulia-deep))";     // olijf
const LIGHT = "hsl(var(--d-giulia-light))";   // pistachio
const URGENT = "hsl(var(--d-giulia-urgent))"; // urgent geelgroen
const IVORY = "hsl(var(--ivory))";

export default function GiuliaConciergeWidget() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % STATES.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <WidgetShell domain="giulia" radius="large" className="aspect-[9/16] w-[290px] min-h-0">
      {/* foto als grote shell, geen overlay */}
      <img src={PHOTO} alt="Giulia's Hotline" className="absolute inset-0 w-full h-full object-cover" />

      {/* bovenaan in de foto: beweegde header + titel (licht op de foto) */}
      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/45 to-transparent" style={{ color: IVORY }}>
        <WidgetHeader label="GIULIA'S HOTLINE" type="pulse" />
      </div>

      {/* donkere gloed achter het glas voor leesbaarheid (foto blijft shell) */}
      <div className="absolute bottom-0 inset-x-0 h-[58%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />

      {/* hoger, transparant glas — alleen vanonder, afgeronde bovenhoeken, omhooglopende schaduw */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-[24px] px-4 pt-5 pb-6"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 -28px 60px -14px rgba(0,0,0,0.50), 0 -10px 22px -10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      >
        {/* EKG-hero — olijf→urgent, gloed, met live-puls rechts (geen tekst) */}
        <div className="relative h-[72px]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
            <defs>
              <linearGradient id="gk" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={DEEP} />
                <stop offset="62%" stopColor={DEEP} />
                <stop offset="100%" stopColor={URGENT} />
              </linearGradient>
            </defs>
            <line x1="0" y1="50" x2="100" y2="50" stroke={LIGHT} strokeWidth="0.5" strokeOpacity="0.3" />
            <motion.path
              d={PATH} fill="none" stroke="url(#gk)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 5px rgba(213,226,74,0.45))" }}
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
            />
          </svg>
          <motion.span
            className="absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full"
            style={{ background: URGENT, boxShadow: "0 0 8px rgba(213,226,74,0.7)" }}
            animate={{ scale: [1, 1.45, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* activiteitsstaven — visuele status, pistachio + urgent (geen tekst) */}
        <div className="flex items-end justify-between gap-1.5 h-12 mt-3">
          {STATES.map((s, i) => {
            const active = i === idx;
            return (
              <motion.div
                key={s} className="flex-1 rounded-full"
                style={{ background: active ? URGENT : LIGHT, opacity: active ? 1 : 0.55 }}
                animate={{ height: active ? ["72%", "100%", "72%"] : ["28%", "52%", "28%"] }}
                transition={{ duration: active ? 1.1 : 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
              />
            );
          })}
        </div>

        {/* chat met Giulia / bel Giulia — elegant, geen pillen */}
        <div className="flex items-center mt-3">
          <Link
            to="/chat"
            className="flex-1 inline-flex items-center justify-center gap-2 py-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold transition hover:opacity-70"
            style={{ color: IVORY }}
          >
            <MessageSquare className="h-3.5 w-3.5" style={{ color: DEEP }} /> Chat
          </Link>
          <span className="h-5 w-px" style={{ background: LIGHT, opacity: 0.5 }} />
          <Link
            to="/voice"
            className="flex-1 inline-flex items-center justify-center gap-2 py-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold transition hover:opacity-70"
            style={{ color: IVORY }}
          >
            <Phone className="h-3.5 w-3.5" style={{ color: DEEP }} /> Bel
          </Link>
        </div>
      </div>
    </WidgetShell>
  );
}