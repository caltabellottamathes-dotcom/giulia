import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
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
 *  Rechts (glas, focus-kleur): datum + titel staan stil; daaronder wisselt
 *  kinetisch alleen het uur van de afspraak en de aftellende klok (gelijke
 *  grootte) elkaar af. PhotoCard (links, flush + 4 afgeronde hoeken + schaduw
 *  naar de open kant) schuift rechts en onthult een glazen agenda-tijdlijn
 *  (track + now-marker + bolletjes, mix focus + olive) van de eerstvolgende
 *  1–3 afspraken. */
export default function AgendaFocusWidget() {
  const { openModule } = usePanel();
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", limit: 80, realtime: true });
  const [now, setNow] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setPhase((p) => (p ? 0 : 1)), 6500); return () => clearInterval(t); }, []);

  const upcoming = useMemo(() => (events || []).filter((e) => e.start && new Date(e.start) > now).sort((a, b) => new Date(a.start) - new Date(b.start)), [events, now]);
  const next = upcoming[0];
  const todayCount = (events || []).filter((e) => { if (!e.start) return false; const d = new Date(e.start); const s = new Date(now); s.setHours(0, 0, 0, 0); const en = new Date(now); en.setHours(23, 59, 59, 999); return d >= s && d <= en; }).length;

  const diff = next ? new Date(next.start) - now : 0;
  const pad = (n) => String(n).padStart(2, "0");
  const countdown = next ? `${pad(Math.floor(diff / 3600000))}:${pad(Math.floor((diff % 3600000) / 60000))}:${pad(Math.floor((diff % 60000) / 1000))}` : "--:--:--";
  const evTime = next ? fmtTime(next.start) : "";
  const evDate = next ? new Date(next.start).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) : "";

  const kinetic = { initial: { opacity: 0, y: 14, filter: "blur(6px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -14, filter: "blur(6px)" }, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } };

  return (
    <div className="relative w-full h-[260px] rounded-[28px] overflow-hidden" style={{ "--tile-accent": DEEP, color: DEEP }}>
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(48,50,55,0.18)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)" }} />

      {/* rechts — glas content, focus-kleur (plum) */}
      <div className="absolute inset-y-0 right-0 w-[50%] flex flex-col p-4 z-10">
        <div className="flex items-center justify-between">
          <div style={{ color: IVORY }}>
            <WidgetHeader type="agenda" label="What's Happening?" count={todayCount ? String(todayCount) : ""} />
          </div>
          <button onClick={() => openModule("agenda")} className="text-[8px] uppercase tracking-[0.2em] font-bold pt-1" style={{ color: DEEP }}>AGENDA →</button>
        </div>
        <div className="flex-1 min-h-0" />
        {next ? (
          <div className="flex flex-col items-end">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: OLIVE }}>{evDate}</p>
            <p className="text-[16px] font-display font-semibold leading-tight truncate text-right max-w-full mt-0.5" style={{ color: OLIVE }}>{next.title}</p>
            <div className="relative h-[58px] mt-1.5 w-full flex justify-end">
              <AnimatePresence mode="wait">
                {phase === 0 ? (
                  <motion.span key="hour" {...kinetic} className="absolute right-0 top-0 text-[52px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ color: DEEP }}>{evTime}</motion.span>
                ) : (
                  <motion.span key="cd" {...kinetic} className="absolute right-0 top-0 text-[52px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ color: LIGHT }}>{countdown}</motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-right" style={{ color: DEEP, opacity: 0.6 }}>{todayCount ? `${todayCount} vandaag · niets meer open` : "Niets gepland."}</p>
        )}
      </div>

      {/* links — glazen tijdlijn achter de PhotoCard */}
      <AnimatePresence>
        {open && (
          <motion.div key="tl" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35 }} className="absolute inset-y-0 left-0 w-[50%] rounded-[28px] overflow-hidden flex flex-col p-3 z-10"
            style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(14px) saturate(1.3)", WebkitBackdropFilter: "blur(14px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: DEEP }}>eerst volgende</span>
              <button onClick={() => setOpen(false)} className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: DEEP, opacity: 0.7 }}>← terug</button>
            </div>
            <div className="relative flex-1 min-h-0 overflow-hidden">
              <span className="absolute left-[6px] top-2 bottom-2 w-px" style={{ background: OLIVE, opacity: 0.4 }} />
              <div className="absolute left-[6px] top-2 -translate-x-1/2">
                <motion.span className="block h-2.5 w-2.5 rounded-full" style={{ background: URGENT }} animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </div>
              <span className="absolute left-[18px] top-[5px] text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: DEEP, opacity: 0.7 }}>nu</span>
              <div className="absolute inset-0 pl-6 pt-7 overflow-y-auto no-scrollbar flex flex-col gap-2.5">
                {upcoming.length === 0 ? (
                  <p className="text-[11px]" style={{ color: DEEP, opacity: 0.6 }}>Niets gepland.</p>
                ) : upcoming.slice(0, 3).map((e, i) => {
                  const col = PAL[i % PAL.length];
                  return (
                    <div key={e.id || i} className="relative">
                      <span className="absolute -left-[14px] top-1.5 h-2.5 w-2.5 rounded-full" style={{ background: col }} />
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[16px] font-display font-bold tabular-nums leading-none" style={{ color: DEEP }}>{fmtTime(e.start)}</span>
                        <span className="text-[8px] uppercase tracking-[0.16em] font-bold shrink-0" style={{ color: DEEP, opacity: 0.6 }}>{relTime(e.start, now)}</span>
                      </div>
                      <p className="text-[10px] leading-tight truncate mt-0.5" style={{ color: DEEP, opacity: 0.8 }}>{e.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PhotoCard — flush, 4 afgeronde hoeken, schaduw naar de open kant */}
      <motion.div className="absolute inset-y-0 left-0 w-[50%] rounded-[28px] overflow-hidden cursor-pointer z-20" style={{ boxShadow: "16px 0 34px -20px rgba(0,0,0,0.5)" }} animate={{ x: open ? "100%" : "0%" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} onClick={() => setOpen((o) => !o)} aria-label="Toon tijdlijn">
        <img src={PHOTO} alt="What's Happening" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-black/8 to-transparent" />
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: IVORY, opacity: 0.75 }}>
          <ChevronRight className="h-3 w-3" /> tijdlijn
        </div>
      </motion.div>
    </div>
  );
}