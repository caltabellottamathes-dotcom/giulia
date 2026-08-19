import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DOMAIN_META } from "@/lib/unifiedStream";

const DAY_START = 7;
const DAY_END = 23;
const TOTAL_HOURS = DAY_END - DAY_START;
const EASE = [0.22, 1, 0.36, 1];

/**
 * DagplanningCard — visuele dag-tijdlijn met events als gekleurde blokken,
 * een bewegende "nu"-indicator, en een compacte lijst eronder.
 */
export default function DagplanningCard({ events = [] }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const nowPct = ((now.getHours() + now.getMinutes() / 60) - DAY_START) / TOTAL_HOURS * 100;
  const clampedNow = Math.max(0, Math.min(100, nowPct));
  const nowTime = now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-3">
      {/* Timeline track */}
      <div className="relative h-10 rounded-xl bg-current/[0.06] overflow-hidden">
        {/* Hour grid lines */}
        {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-current/[0.08]" style={{ left: `${(i / TOTAL_HOURS) * 100}%` }} />
        ))}
        {/* Event blocks */}
        {events.map((e, i) => {
          const start = new Date(e.start);
          const end = e.end ? new Date(e.end) : new Date(start.getTime() + 60 * 60 * 1000);
          const startH = start.getHours() + start.getMinutes() / 60;
          const endH = end.getHours() + end.getMinutes() / 60;
          const startPct = Math.max(0, ((startH - DAY_START) / TOTAL_HOURS) * 100);
          const endPct = Math.min(100, ((endH - DAY_START) / TOTAL_HOURS) * 100);
          const width = Math.max(3, endPct - startPct);
          const meta = DOMAIN_META[e.domain || "focus"] || DOMAIN_META.focus;
          return (
            <motion.div
              key={e.id || i}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: i * 0.05, duration: 0.45, ease: EASE }}
              className="absolute top-1.5 bottom-1.5 rounded-md shrink-0"
              style={{ left: `${startPct}%`, width: `${width}%`, background: meta.color, transformOrigin: "left" }}
              title={e.title}
            />
          );
        })}
        {/* Now indicator */}
        <motion.div
          className="absolute top-0 bottom-0 w-px bg-white rounded-full z-10"
          animate={{ left: `${clampedNow}%` }}
          transition={{ duration: 1, ease: "linear" }}
          style={{ boxShadow: "0 0 8px rgba(255,255,255,0.5)" }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-white" />
        </motion.div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-[9px] font-mono text-current/40 tabular-nums">
        <span>07:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>

      {/* Now badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        <span className="text-[10px] font-mono text-current/70 tabular-nums">Nu · {nowTime}</span>
      </div>

      {/* Event list */}
      <div className="space-y-1.5 pt-1">
        {events.slice(0, 4).map((e, i) => {
          const meta = DOMAIN_META[e.domain || "focus"] || DOMAIN_META.focus;
          const time = new Date(e.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
          return (
            <motion.div
              key={e.id || i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.35, ease: EASE }}
              className="flex items-center gap-2.5"
            >
              <span className="text-[10px] font-mono text-current/45 w-10 shrink-0 tabular-nums">{time}</span>
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: meta.color }} />
              <span className="text-[11px] text-current/80 truncate flex-1 leading-snug">{e.title}</span>
              <span className="text-[8px] uppercase tracking-wider font-bold shrink-0" style={{ color: meta.color }}>{meta.label}</span>
            </motion.div>
          );
        })}
        {events.length === 0 && (
          <p className="text-[11px] text-current/50 leading-snug">Geen afspraken vandaag — de dag is van jou.</p>
        )}
        {events.length > 4 && (
          <p className="text-[10px] text-current/40 pt-0.5">+{events.length - 4} meer</p>
        )}
      </div>
    </div>
  );
}