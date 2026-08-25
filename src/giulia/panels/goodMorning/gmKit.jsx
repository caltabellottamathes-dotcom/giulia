import React from "react";
import {
  Droplet, Bath, Shirt, Coffee, Utensils, BookOpen, Dumbbell,
  Moon, Sun, Circle, Sparkles, ArrowRight,
} from "lucide-react";

// GIULIA palette
export const DEEP = "#595f34";   // EARTH OLIVE
export const MID = "#94925d";    // Olive
export const LIGHT = "#d8dab3";  // Whipped Pistachio
export const URG = "#d5e24a";    // Urgent — only when urgent

export const fmtMin = (m) => (m == null ? "—" : `${Math.round(m)} MIN`);
export const hhmm = (iso) => (iso ? new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—");
export const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function SectionLabel({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <p className="text-[10px] tracking-[0.25em] text-storm/50 font-medium">{children}</p>
      {right}
    </div>
  );
}

export function Card({ className = "", children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`rounded-2xl border border-storm/10 bg-marble/8 ${onClick ? "cursor-pointer hover:bg-marble/14" : ""} transition-colors p-4 ${className}`}
    >
      {children}
    </div>
  );
}

/** Progress ring — label in the middle, optional sub line. */
export function Ring({ value, size = 120, stroke = 8, color = DEEP, trackColor = "rgba(60,63,38,0.12)", label, sub, subSize = 9 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - clamp01(value));
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label != null && (
          <span className="font-display font-semibold leading-none text-storm" style={{ fontSize: size * 0.24 }}>{label}</span>
        )}
        {sub && <span className="mt-1 text-storm/55" style={{ fontSize: subSize, letterSpacing: "0.18em" }}>{sub}</span>}
      </div>
    </div>
  );
}

/** Horizontal pace gauge: SLOW ────●──── ON TIME */
export function PaceGauge({ value = 0.5, urgent = false }) {
  const knobColor = urgent ? URG : DEEP;
  return (
    <div>
      <div className="relative h-5">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-storm/15" />
        <div className="absolute top-1/2 rounded-full"
          style={{
            left: `${Math.min(96, Math.max(4, value * 100))}%`, width: 12, height: 12,
            transform: "translate(-50%,-50%)", background: knobColor,
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }} />
      </div>
      <div className="flex justify-between text-[9px] tracking-[0.18em] text-storm/50 mt-1.5">
        <span>SLOW</span><span>ON TIME</span>
      </div>
    </div>
  );
}

/** Segmented progress bar — `segments` slots, `active` filled, `skipped` marked. */
export function SegmentedBar({ segments = 5, active = 4, skipped = 1, color = DEEP, skipColor = URG, baseColor = "rgba(60,63,38,0.12)" }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: segments }).map((_, i) => {
        const isSkipped = i >= active && i < active + skipped;
        return (
          <div key={i} className="h-1.5 flex-1 rounded-full"
            style={{ background: i < active ? color : isSkipped ? skipColor : baseColor }} />
        );
      })}
    </div>
  );
}

/** Small pill chip. */
export function Chip({ children, color = DEEP, bg = null, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-[0.14em] font-semibold ${className}`}
      style={{ background: bg ?? `${color}22`, color }}>
      {children}
    </span>
  );
}

const STEP_ICONS = [
  { kw: ["water", "water", "drink"], Icon: Droplet },
  { kw: ["bad", "bath", "shower", "wc"], Icon: Bath },
  { kw: ["kleed", "dress", "kleding"], Icon: Shirt },
  { kw: ["koffie", "coffee", "thee", "tea"], Icon: Coffee },
  { kw: ["ontbijt", "breakfast", "eten", "eat"], Icon: Utensils },
  { kw: ["lees", "read", "boek", "book"], Icon: BookOpen },
  { kw: ["sport", "oefen", "workout", "dumbbell"], Icon: Dumbbell },
  { kw: ["medit", "adem", "breath", "rust"], Icon: Moon },
  { kw: ["zon", "sun", "licht"], Icon: Sun },
];

export function stepIcon(title = "") {
  const t = title.toLowerCase();
  for (const s of STEP_ICONS) if (s.kw.some((k) => t.includes(k))) return s.Icon;
  return Circle;
}

/** Primary action button — used at the foot of each Good Morning tab body. */
export function PrimaryAction({ label, onClick, icon: Icon = ArrowRight, tone = DEEP }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-all hover:brightness-95 active:scale-[0.98]"
      style={{ background: tone, color: "#fff" }}>
      {label}
      <Icon className="h-4 w-4" />
    </button>
  );
}