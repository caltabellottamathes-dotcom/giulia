import React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart, Bar, Cell, ResponsiveContainer } from "recharts";

/** Shared L02 (Onderdeelpaneel) building blocks — ivory on the glass-3 panel.
 *  Each surface is a glass-card-2 with light text, led by a dominant graphic
 *  element: a bold number, an animated bar diagram or a progress ring. */

const CARD = "glass-card-2";

export function Stat({ label, value, accent, hint }) {
  return (
    <div className={cn("relative animate-fade-up rounded-2xl px-4 py-3.5 flex flex-col gap-1.5 overflow-hidden", CARD)}>
      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: accent || "hsl(var(--sand))" }} />
      <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-[0.16] blur-2xl" style={{ background: accent || "hsl(var(--sand))" }} />
      <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">{label}</span>
      <span className="text-2xl font-display font-semibold text-ivory leading-none tabular-nums">{value}</span>
      {hint && <span className="text-[10px] text-ivory/45">{hint}</span>}
    </div>
  );
}

export function HeroStat({ value, label, accent, sub, visual }) {
  return (
    <div className={cn("relative animate-fade-up rounded-2xl p-5 overflow-hidden", CARD)}>
      <span className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ background: accent || "hsl(var(--sand))" }} />
      <span className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full opacity-[0.18] blur-2xl" style={{ background: accent || "hsl(var(--sand))" }} />
      <p className="text-[10px] uppercase tracking-[0.24em] text-ivory/55 font-semibold mb-2">{label}</p>
      <p className="text-[44px] font-display font-semibold leading-none tabular-nums text-ivory">{value}</p>
      {visual && <div className="mt-3">{visual}</div>}
      {sub && <p className="text-xs text-ivory/50 mt-2">{sub}</p>}
    </div>
  );
}

export function MiniBars({ data, height = 56 }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarDistribution({ segments }) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-ivory/10">
      {segments.map((s, i) => (
        <div key={i} className="transition-all duration-500" style={{ width: `${((s.value || 0) / total) * 100}%`, background: s.color }} />
      ))}
    </div>
  );
}

export function RingMini({ value, accent, size = 64 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, value || 0)) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--ivory) / 0.14)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent || "hsl(var(--sand))"} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

export function AnimatedPicto({ icon: Icon, accent }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center rounded-2xl h-10 w-10 glass-button text-ivory shrink-0"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
    </motion.span>
  );
}

export function Row({ title, sub, onClick, accent, right, action }) {
  return (
    <div
      onClick={onClick}
      className={cn("group animate-fade-up relative flex items-center gap-3 rounded-2xl pl-4 pr-3 py-3 hover:bg-white/10 transition-all duration-300 hover:translate-x-0.5 cursor-pointer", CARD)}
    >
      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300 group-hover:top-2 group-hover:bottom-2" style={{ background: accent || "hsl(var(--sand))" }} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ivory truncate">{title}</span>
        {sub && <span className="block text-xs text-ivory/50 truncate mt-0.5">{sub}</span>}
      </span>
      {action}
      {right}
      <ArrowUpRight className="h-4 w-4 text-ivory/40 group-hover:text-ivory/80 transition shrink-0" />
    </div>
  );
}

export function Card({ onClick, accent, children, trailing, action }) {
  return (
    <div
      onClick={onClick}
      className={cn("group animate-fade-up relative rounded-2xl pl-4 pr-3 py-3 hover:bg-white/10 transition-all duration-300 hover:translate-x-0.5 cursor-pointer", CARD)}
    >
      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-all duration-300 group-hover:top-2 group-hover:bottom-2" style={{ background: accent || "hsl(var(--sand))" }} />
      <div className="flex items-start gap-2 min-w-0">
        <div className="min-w-0 flex-1">{children}</div>
        {trailing}
      </div>
      {action && <div className="mt-2.5 flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function Empty({ text }) {
  return (
    <div className={cn("rounded-2xl px-5 py-12 text-center flex flex-col items-center gap-3 animate-fade-up", CARD)}>
      <span className="relative h-10 w-10 rounded-full border border-ivory/15 flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-ivory/30" />
        <span className="absolute inset-0 rounded-full border border-ivory/10 scale-125" />
      </span>
      <p className="text-sm text-ivory/55">{text}</p>
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <span className="h-px flex-1 bg-gradient-to-r from-ivory/20 to-transparent" />
      <p className="text-[10px] uppercase tracking-[0.24em] text-ivory/50 font-semibold whitespace-nowrap">{children}</p>
    </div>
  );
}

export function ActionBtn({ onClick, label, icon: Icon, tone = "ghost" }) {
  const tones = {
    ghost: "glass-button text-ivory hover:bg-white/15",
    olive: "bg-olive text-ivory hover:bg-olive/90",
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
      aria-label={label}
      className={cn("inline-flex items-center justify-center rounded-full transition shrink-0 h-7 w-7", tones[tone])}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
    </button>
  );
}

export function Progress({ value, accent }) {
  return (
    <div className="h-1 rounded-full bg-ivory/10 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, value || 0))}%`, background: accent || "hsl(var(--olive))" }} />
    </div>
  );
}

export function Pill({ children, accent }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ivory"
      style={{ background: "hsl(var(--ivory) / 0.10)" }}
    >
      {children}
    </span>
  );
}