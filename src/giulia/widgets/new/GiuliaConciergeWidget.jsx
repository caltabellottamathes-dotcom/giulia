import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageSquare, Phone } from "lucide-react";
import { WidgetShell, WidgetHeader } from "@/system/widgets/primitives";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg";

/** GiuliaConciergeWidget — omgekeerd Social-gevoel, langwerpig (9:16).
 *  Foto als grote shell (full-bleed, geen overlay); daarvoor een lager,
 *  geblurd licht-glas dat alleen vanonder komt en tot tegen de randen loopt.
 *  Bovenin de beweegde header + titel; erin de EKG + status; onderaan twee
 *  elegante acties (Chat / Bel) — geen pillen. Giulia-kleuren (olijf). */
const STATES = ["Listening", "Thinking", "Processing", "Acting", "Waiting"];
const PATH = "M 0 50 L 18 50 L 24 50 L 30 28 L 36 72 L 42 40 L 48 50 L 60 50 L 66 50 L 72 34 L 78 66 L 84 50 L 100 50";

const ACC = "var(--tile-accent)"; // giulia-olijf (WidgetShell domain="giulia")
const ACC_FAINT = "color-mix(in srgb, var(--tile-accent) 22%, transparent)";

export default function GiuliaConciergeWidget() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % STATES.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <WidgetShell domain="giulia" radius="large" className="aspect-[9/16] w-[290px] min-h-0">
      {/* foto als grote shell, geen overlay */}
      <img src={PHOTO} alt="Giulia Concierge" className="absolute inset-0 w-full h-full object-cover" />

      {/* lager, geblurd licht-glas — alleen vanonder, tot tegen de randen */}
      <div
        className="absolute inset-x-0 bottom-0 px-4 pt-4 pb-5"
        style={{
          background: "rgba(248,248,244,0.50)",
          backdropFilter: "blur(22px) saturate(1.3)",
          WebkitBackdropFilter: "blur(22px) saturate(1.3)",
          color: ACC,
        }}
      >
        {/* bovenin: beweegde header + titel */}
        <WidgetHeader label="Giulia Concierge" count={STATES[idx]} type="pulse" />

        {/* EKG */}
        <div className="relative mt-1 h-10">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <line x1="0" y1="50" x2="100" y2="50" stroke={ACC_FAINT} strokeWidth="0.4" />
            <motion.path
              d={PATH} fill="none" stroke={ACC} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
            />
          </svg>
          <span className="absolute right-0 top-0 flex items-center gap-1 text-[7px] uppercase tracking-[0.18em] font-bold" style={{ color: ACC }}>
            <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: ACC }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
            online
          </span>
        </div>

        {/* status-states */}
        <div className="flex items-center justify-between mt-1 gap-0.5">
          {STATES.map((s, i) => (
            <span key={s} className="text-[6.5px] uppercase tracking-[0.08em] font-bold" style={{ opacity: i === idx ? 1 : 0.35, color: ACC }}>{s}</span>
          ))}
        </div>

        {/* chat met Giulia / bel Giulia — elegant, geen pillen */}
        <div className="flex items-center mt-3">
          <Link
            to="/chat"
            className="flex-1 inline-flex items-center justify-center gap-2 py-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold transition hover:opacity-60"
            style={{ color: ACC }}
          >
            <MessageSquare className="h-3.5 w-3.5" /> Chat
          </Link>
          <span className="h-5 w-px" style={{ background: ACC_FAINT }} />
          <Link
            to="/voice"
            className="flex-1 inline-flex items-center justify-center gap-2 py-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold transition hover:opacity-60"
            style={{ color: ACC }}
          >
            <Phone className="h-3.5 w-3.5" /> Bel Giulia
          </Link>
        </div>
      </div>
    </WidgetShell>
  );
}