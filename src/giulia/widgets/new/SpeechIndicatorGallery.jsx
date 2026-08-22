import React from "react";
import { motion } from "framer-motion";

const DEEP = "hsl(var(--d-giulia-deep))";    // olijf
const LIGHT = "hsl(var(--d-giulia-light))";  // pistachio
const URGENT = "hsl(var(--d-giulia-urgent))"; // urgent
const IVORY = "hsl(var(--ivory))";

/** SpeechIndicatorGallery — een selectie bewegende visuele spraakinstitatoren,
 *  allemaal in GIULIA-kleuren, gedreven door Framer Motion (oneindige loops).
 *  Bedoeld om een stijl te kiezen voor de Hotline / voice-feedback. */

function Card({ n, name, children }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-[188px] h-[188px] rounded-[24px] flex items-center justify-center p-4 mb-2"
        style={{ background: "rgba(48,50,55,0.30)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16)" }}
      >
        {children}
      </div>
      <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-foreground/45 text-center leading-tight">
        <span style={{ color: URGENT }}>{n}</span> · {name}
      </p>
    </div>
  );
}

const Equalizer = () => (
  <div className="flex items-end gap-1 h-16 w-full justify-center">
    {Array.from({ length: 9 }).map((_, i) => (
      <motion.span key={i} className="w-1.5 rounded-full" style={{ background: i % 2 ? LIGHT : DEEP }}
        animate={{ height: ["20%", "100%", "42%", "78%", "20%"] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }} />
    ))}
  </div>
);

const Wave = () => (
  <svg width="160" height="64" viewBox="0 0 160 64" className="overflow-visible">
    <motion.g animate={{ x: [-40, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}>
      <path d="M -40 32 Q -20 6 0 32 T 40 32 T 80 32 T 120 32 T 160 32 T 200 32" fill="none" stroke={URGENT} strokeWidth="2.5" strokeLinecap="round" />
    </motion.g>
  </svg>
);

const PulseRings = () => (
  <div className="relative h-16 w-16 flex items-center justify-center">
    {[0, 1, 2].map((i) => (
      <motion.span key={i} className="absolute inset-0 rounded-full" style={{ border: `2px solid ${i === 0 ? URGENT : LIGHT}` }}
        animate={{ scale: [0.3, 1.7], opacity: [0.85, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: i * 0.6 }} />
    ))}
    <span className="h-2.5 w-2.5 rounded-full" style={{ background: URGENT }} />
  </div>
);

const RadialBurst = () => (
  <svg width="120" height="120" viewBox="0 0 120 120">
    {Array.from({ length: 16 }).map((_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return (
        <motion.line key={i} x1={60 + Math.cos(a) * 14} y1={60 + Math.sin(a) * 14} x2={60 + Math.cos(a) * 32} y2={60 + Math.sin(a) * 32}
          stroke={i % 4 === 0 ? URGENT : LIGHT} strokeWidth="2.5" strokeLinecap="round"
          animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.07 }} />
      );
    })}
  </svg>
);

const DotMatrix = () => (
  <div className="grid grid-cols-6 gap-1.5">
    {Array.from({ length: 36 }).map((_, i) => {
      const row = Math.floor(i / 6), col = i % 6;
      const d = Math.sqrt((row - 2.5) ** 2 + (col - 2.5) ** 2);
      return (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i % 5 === 0 ? URGENT : LIGHT }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.25, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: d * 0.18, ease: "easeInOut" }} />
      );
    })}
  </div>
);

const GradientBloom = () => (
  <motion.div className="h-20 w-20 rounded-full"
    style={{ background: `radial-gradient(circle, ${URGENT} 0%, ${DEEP} 45%, transparent 72%)`, filter: "blur(4px)" }}
    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.92, 0.5] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
);

const MirrorWave = () => (
  <div className="flex items-center gap-1 h-16 w-full justify-center">
    {Array.from({ length: 9 }).map((_, i) => (
      <motion.span key={i} className="w-1.5 rounded-full" style={{ background: i % 2 ? DEEP : LIGHT }}
        animate={{ height: ["12%", "90%", "12%"] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.09 }} />
    ))}
  </div>
);

const OrbitDots = () => (
  <div className="relative h-20 w-20">
    {[0, 1, 2].map((i) => (
      <motion.div key={i} className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}>
        <span className="absolute top-0 left-1/2 h-2 w-2 -ml-1 rounded-full" style={{ background: i === 0 ? URGENT : LIGHT }} />
      </motion.div>
    ))}
    <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full" style={{ background: DEEP }} />
  </div>
);

const Heartbeat = () => (
  <svg width="160" height="64" viewBox="0 0 160 64">
    <motion.path d="M 0 32 L 30 32 L 40 10 L 50 54 L 60 32 L 80 32 L 90 18 L 100 46 L 110 32 L 160 32" fill="none" stroke={URGENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      animate={{ pathLength: [0, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
  </svg>
);

const BouncingDots = () => (
  <div className="flex items-center gap-2 h-16 justify-center">
    {[0, 1, 2, 3, 4].map((_, i) => (
      <motion.span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: i % 2 ? LIGHT : URGENT }}
        animate={{ y: [0, -18, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }} />
    ))}
  </div>
);

const LiquidBlob = () => (
  <motion.div className="h-20 w-20" style={{ background: `linear-gradient(135deg, ${DEEP}, ${LIGHT})` }}
    animate={{ borderRadius: ["42% 58% 58% 42% / 50% 42% 58% 50%", "58% 42% 50% 50% / 42% 58% 42% 58%", "42% 58% 58% 42% / 50% 42% 58% 50%"] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
);

const ITEMS = [
  { n: "01", name: "Equalizer", C: Equalizer },
  { n: "02", name: "Wave Line", C: Wave },
  { n: "03", name: "Pulse Rings", C: PulseRings },
  { n: "04", name: "Radial Burst", C: RadialBurst },
  { n: "05", name: "Dot Matrix", C: DotMatrix },
  { n: "06", name: "Gradient Bloom", C: GradientBloom },
  { n: "07", name: "Mirror Wave", C: MirrorWave },
  { n: "08", name: "Orbit Dots", C: OrbitDots },
  { n: "09", name: "Heartbeat", C: Heartbeat },
  { n: "10", name: "Bouncing Dots", C: BouncingDots },
  { n: "11", name: "Liquid Blob", C: LiquidBlob },
];

export default function SpeechIndicatorGallery() {
  return (
    <div className="flex flex-wrap gap-5">
      {ITEMS.map(({ n, name, C }) => (
        <Card key={n} n={n} name={name}><C /></Card>
      ))}
    </div>
  );
}