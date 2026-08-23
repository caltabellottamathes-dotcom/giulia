import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusHappening;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const OLIVE = "hsl(var(--olive))";
const URGENT = "hsl(var(--d-focus-urgent))";
const IVORY = "hsl(var(--ivory))";
const PAL = [OLIVE, LIGHT, DEEP, URGENT];

const fmtTime = (iso) => { try { return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
const relTime = (iso, now) => {
  const d = new Date(iso) - now;
  if (d < 0) return "nu";
  const m = Math.round(d / 60000);
  if (m < 60) return `over ${m}m`;
  const h = Math.floor(d / 3600000), mm = Math.round((d % 3600000) / 60000);
  if (h < 24) return `over ${h}u ${mm}m`;
  return `over ${Math.floor(d / 86400000)}d`;
};

/** AgendaFocusWidget — G·21x9·L·SIDE · "What's Happening?"
 *  Rechts (glas, focus-kleur): datum + titel + uur staan stil. De aftellende
 *  klok zweeft als witte "ghost" over de PhotoCard (links). Klik op de shell
 *  opent de glazen agenda-tijdlijn (groter, meer verspreid) met now-marker +
 *  bolletjes. */
export default function AgendaFocusWidget() {
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", limit: 80, realtime: true });
  const [now, setNow] = useState(new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const upcoming = useMemo(() => (events || []).filter((e) => e.start && new Date(e.start) > now).sort((a, b) => new Date(a.start) - new Date(b.start)), [events, now]);
  const next = upcoming[0];
  const todayCount = (events || []).filter((e) => { if (!e.start) return false; const d = new Date(e.start); const s = new Date(now); s.setHours(0, 0, 0, 0); const en = new Date(now); en.setHours(23, 59, 59, 999); return d >= s && d <= en; }).length;

  const evTime = next ? fmtTime(next.start) : "";
  const evDate = next ? new Date(next.start).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) : "";

  return (
    <div className="relative w-full h-[260px] rounded-[28px] overflow-hidden cursor-pointer" style={{ "--tile-accent": DEEP, color: DEEP }} onClick={() => setOpen(true)}>
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(48,50,55,0.18)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)" }} />

      {/* rechts — glas content, focus-kleur (plum) */}
      <div className="absolute inset-y-0 right-0 w-[50%] flex flex-col p-4 z-10">
        <WidgetHeader type="agenda" label="What's Happening?" count={todayCount ? String(todayCount) : ""} />
        <div className="flex-1 min-h-0" />
        {next ? (
          <div className="flex flex-col items-end">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: OLIVE }}>{evDate}</p>
            <p className="text-[16px] font-display font-semibold leading-tight truncate text-right max-w-full mt-0.5" style={{ color: OLIVE }}>{next.title}</p>
            <p className="text-[52px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums mt-2" style={{ color: DEEP }}>{evTime}</p>
          </div>
        ) : (
          <p className="text-[12px] text-right" style={{ color: DEEP, opacity: 0.6 }}>{todayCount ? `${todayCount} vandaag · niets meer open` : "Niets gepland."}</p>
        )}
      </div>

      {/* links — glazen tijdlijn achter de PhotoCard */}
      <AnimatePresence>
        {open && (
          <motion.div key="tl" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35 }} className="absolute inset-y-0 left-0 w-[50%] rounded-[28px] overflow-hidden flex flex-col p-4 z-30" onClick={(e) => e.stopPropagation()}
            style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(16px) saturate(1.3)", WebkitBackdropFilter: "blur(16px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: DEEP }}>eerst volgende</span>
              <button onClick={() => setOpen(false)} className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: DEEP, opacity: 0.7 }}>← terug</button>
            </div>
            <div className="relative flex-1 min-h-0 overflow-hidden">
              <span className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: OLIVE, opacity: 0.4 }} />
              <div className="absolute left-[7px] top-2 -translate-x-1/2">
                <motion.span className="block h-3 w-3 rounded-full" style={{ background: URGENT }} animate={{ scale: [1, 1.7, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </div>
              <span className="absolute left-[20px] top-[6px] text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: DEEP, opacity: 0.7 }}>nu</span>
              <div className="absolute inset-0 pl-8 pt-8 overflow-y-auto no-scrollbar flex flex-col gap-5">
                {upcoming.length === 0 ? (
                  <p className="text-[11px]" style={{ color: DEEP, opacity: 0.6 }}>Niets gepland.</p>
                ) : upcoming.slice(0, 3).map((e, i) => {
                  const col = PAL[i % PAL.length];
                  return (
                    <div key={e.id || i} className="relative">
                      <span className="absolute -left-[18px] top-2 h-3 w-3 rounded-full" style={{ background: col }} />
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[18px] font-display font-bold tabular-nums leading-none" style={{ color: DEEP }}>{fmtTime(e.start)}</span>
                        <span className="text-[8px] uppercase tracking-[0.16em] font-bold shrink-0" style={{ color: DEEP, opacity: 0.6 }}>{relTime(e.start, now)}</span>
                      </div>
                      <p className="text-[11px] leading-tight truncate mt-1" style={{ color: DEEP, opacity: 0.85 }}>{e.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PhotoCard — flush, 4 afgeronde hoeken, schaduw naar de open kant */}
      <motion.div className="absolute inset-y-0 left-0 w-[50%] rounded-[28px] overflow-hidden z-20 pointer-events-none" style={{ boxShadow: "16px 0 34px -20px rgba(0,0,0,0.5)" }} animate={{ x: open ? "100%" : "0%" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
        <img src={PHOTO} alt="What's Happening" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-black/8 to-transparent" />
        {/* Orbit Dots — focus-kleuren, drie draaiende ringen (zoals Giulia widget) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative h-28 w-28">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}>
                <span className="absolute top-0 left-1/2 h-3 w-3 -ml-1.5 rounded-full" style={{ background: [DEEP, LIGHT, OLIVE][i] }} />
              </motion.div>
            ))}
            <span className="absolute inset-0 m-auto h-3.5 w-3.5 rounded-full" style={{ background: DEEP }} />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: IVORY, opacity: 0.75 }}>
          <ChevronRight className="h-3 w-3" /> tijdlijn
        </div>
      </motion.div>
    </div>
  );
}