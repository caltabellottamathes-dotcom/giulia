import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { BLUE, SAND, TRACK } from "@/glass/components/self/palette";
import { ArrowUpRight } from "lucide-react";

// ── PulseDot — live pulsing indicator ──────────────────────────────
export function PulseDot({ color = SAND, size = 10, className = "" }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <motion.span className="absolute inset-0 rounded-full" style={{ background: color }}
        animate={{ scale: [1, 2.4, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
      <span className="relative rounded-full" style={{ width: size, height: size, background: color }} />
    </span>
  );
}

// ── AnimatedRing — Framer Motion SVG ring ─────────────────────────
export function AnimatedRing({ pct, size = 120, stroke = 8, color = BLUE, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (Math.min(100, Math.max(0, pct)) / 100) * c }}
          transition={{ duration: 1.3, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// ── ConcentricRings — multiple animated rings ──────────────────────
export function ConcentricRings({ arcs, size = 140, children }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        {arcs.map((a, i) => {
          const stroke = 6;
          const r = (size / 2) - stroke - i * (stroke + 4);
          const c = 2 * Math.PI * r;
          return (
            <g key={i}>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={stroke} />
              <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={a.c} strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (a.pct / 100) * c }}
                transition={{ duration: 1.3, delay: i * 0.15, ease: "easeOut" }} />
            </g>
          );
        })}
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>}
    </div>
  );
}

// ── LiveAreaChart — Recharts animated area chart ───────────────────
export function LiveAreaChart({ data, dataKey = "value", height = 180, color = BLUE, gradientId = "selfArea" }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${color}`, borderRadius: 12, fontSize: 12, color: "#fff" }} labelStyle={{ color: "rgba(255,255,255,0.6)" }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} animationDuration={1400} animationEasing="ease-out" dot={{ fill: SAND, r: 3 }} activeDot={{ r: 5, fill: color }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── LiveBarChart — Recharts animated bar chart ────────────────────
export function LiveBarChart({ data, dataKey = "value", height = 140, bars = [] }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} animationDuration={1200}>
          {data.map((_, i) => <Cell key={i} fill={bars[i % bars.length] || BLUE} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── LiveLineChart — multi-line Recharts ────────────────────────────
export function LiveLineChart({ data, lines = [], height = 180 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
        <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, fontSize: 12, color: "#fff" }} />
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={{ fill: l.color, r: 2 }} activeDot={{ r: 5 }} animationDuration={1400} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── ContextGrid — 3-item context section (from glass panels) ────────
export function ContextGrid({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 border-t border-ivory/10">
      {items.map((c, i) => (
        <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
          <div className="flex items-center gap-2">
            <span className="text-ivory/30 text-[10px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <p className="text-ivory/55 text-[9px] uppercase tracking-[0.22em] font-semibold">{c.label}</p>
          </div>
          <p className="text-ivory/70 text-sm mt-2 leading-relaxed">{c.text}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── ActionRow — action buttons with navigation ─────────────────────
export function ActionRow({ actions }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap gap-2.5 pt-5 border-t border-ivory/10">
      {actions.map((a, i) => {
        const handle = () => { if (a.onClick) a.onClick(); else if (a.to) navigate(a.to); };
        return a.primary ? (
          <motion.button key={i} onClick={handle} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-full text-charcoal text-xs font-semibold tracking-[0.12em] uppercase" style={{ background: a.color || BLUE }}>
            {a.label}
          </motion.button>
        ) : (
          <motion.button key={i} onClick={handle} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-full border border-ivory/15 text-ivory/80 text-xs tracking-[0.12em] uppercase hover:bg-ivory/5 transition-colors">
            {a.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── OpenLink — colored navigation link ─────────────────────────────
export function OpenLink({ to, label = "Open", color = BLUE }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)} className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color }}>
      {label} <ArrowUpRight className="w-3 h-3" />
    </button>
  );
}