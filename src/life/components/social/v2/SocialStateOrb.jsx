import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PULSE_LABEL } from "@/lib/domainUtils";
import { CountUp, GhostIndex } from "./primitives";

/* ── SocialStateOrb — §1.1 / §3.1 — grote ademende state-indicator.
 * Centrale orb + concentrische straalringen die op activiteit reageren.
 * Licht OS-glas, rAF-breathing, framer-motion enter. */

const RING_COUNT = 5;

// intensity 0..1 stuurt adem-snelheid en ring-uitzetting
export default function SocialStateOrb({ state = "UNKNOWN", meaningfulCount = 0, invitations = 0, plans = 0, intensity = 0.5, compact = false }) {
  const orbRef = useRef(null);
  const ringsRef = useRef([]);
  const label = PULSE_LABEL[state] || "UNKNOWN";

  useEffect(() => {
    let raf;
    const loop = (t) => {
      const s = t / 1000;
      const breath = 0.5 + 0.5 * Math.sin(s * (1.2 + intensity * 1.6));
      const orb = orbRef.current;
      if (orb) {
        orb.style.transform = `scale(${0.92 + breath * 0.08 + intensity * 0.05})`;
        orb.style.opacity = String(0.55 + breath * 0.25 + intensity * 0.15);
      }
      ringsRef.current.forEach((el, i) => {
        if (!el) return;
        const phase = s * (0.4 + i * 0.12) + i;
        const wave = 0.5 + 0.5 * Math.sin(phase);
        const baseR = 30 + i * 14;
        el.style.transform = `scale(${1 + wave * 0.06 * (0.5 + intensity)})`;
        el.style.opacity = String(0.10 + wave * 0.06 + (1 - i / RING_COUNT) * 0.04);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [intensity]);

  const size = compact ? 200 : 280;

  return (
    <div className="relative flex flex-col items-center" style={{ minHeight: size + 40 }}>
      <GhostIndex className="text-[140px] -top-6 left-1/2 -translate-x-1/2">{meaningfulCount}</GhostIndex>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* concentrische straalringen */}
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (ringsRef.current[i] = el)}
            className="absolute rounded-full"
            style={{
              width: size - i * 28,
              height: size - i * 28,
              border: "1px solid hsl(var(--olive))",
              borderStyle: "dashed",
            }}
          />
        ))}
        {/* glow */}
        <div
          className="absolute rounded-full"
          style={{ width: size * 0.7, height: size * 0.7, background: "radial-gradient(circle, hsl(var(--olive)/0.18), transparent 70%)", filter: "blur(20px)" }}
        />
        {/* centrale orb */}
        <div
          ref={orbRef}
          className="relative rounded-full flex flex-col items-center justify-center"
          style={{
            width: size * 0.52,
            height: size * 0.52,
            background: "radial-gradient(circle at 38% 32%, hsl(var(--d-life-light)/0.9), hsl(var(--olive)/0.55) 60%, hsl(var(--d-life-deep)/0.4))",
            boxShadow: "inset 0 2px 12px rgba(255,255,255,0.3), 0 8px 32px rgba(148,146,93,0.25)",
          }}
        >
          {/* activiteit-dots */}
          <div className="flex gap-1.5 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.85)" }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: i < Math.min(7, meaningfulCount) ? 1 : 0.4, opacity: i < Math.min(7, meaningfulCount) ? 0.9 : 0.25 }}
                transition={{ delay: 0.3 + i * 0.06 }}
              />
            ))}
          </div>
          <motion.p
            className="font-display font-bold tracking-tight text-foreground"
            style={{ fontSize: compact ? 18 : 26 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {label}
          </motion.p>
        </div>
      </div>

      {/* counts eronder */}
      <motion.div
        className="flex items-center gap-5 mt-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Count className="text-center">
          <CountUp value={meaningfulCount} className="text-xl font-display font-bold tabular-nums text-foreground" />
          <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">Meaningful</span>
        </Count>
        <span className="h-8 w-px bg-border" />
        <Count className="text-center">
          <CountUp value={plans} className="text-xl font-display font-bold tabular-nums text-foreground" />
          <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">Plans</span>
        </Count>
        <span className="h-8 w-px bg-border" />
        <Count className="text-center">
          <CountUp value={invitations} className="text-xl font-display font-bold tabular-nums text-foreground" />
          <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">Invitations</span>
        </Count>
      </motion.div>
    </div>
  );
}

function Count({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}