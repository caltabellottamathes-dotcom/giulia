import React from "react";
import { motion } from "framer-motion";

/** ProgressRing — grote geanimeerde voortgangsring, accent via var(--tile-accent).
 *  Optionele roterende gestippelde buitenring (live-gevoel). Label is een node
 *  (default: % getal + suffix) zodat What Matters? een grote typografische
 *  % erin kan leggen. */
export default function ProgressRing({
  value = 0,
  size = 84,
  stroke = 8,
  color = "var(--tile-accent)",
  track = "rgba(255,255,255,0.18)",
  outerDash = false,
  label,
  suffix = "%",
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, value)));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {outerDash && (
          <motion.circle
            cx={size / 2} cy={size / 2} r={r + 6} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.35"
            strokeDasharray="1.5 7" style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
            animate={{ rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          />
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} animate={{ strokeDashoffset: off }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-current">
        {label != null ? (
          label
        ) : (
          <>
            <span className="font-display font-semibold tabular-nums leading-none" style={{ fontSize: size * 0.28 }}>
              {Math.round(value * 100)}
            </span>
            {suffix && <span className="text-[10px] uppercase tracking-[0.2em] opacity-55 mt-1">{suffix}</span>}
          </>
        )}
      </div>
    </div>
  );
}