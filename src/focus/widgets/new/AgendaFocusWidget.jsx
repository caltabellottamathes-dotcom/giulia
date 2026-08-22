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
const tint = (c, a) => c.replace(")", ` / ${a})`);

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
 *  Rechts (glas): kinetische tekst die afwisselt tussen [afspraak + tijd] en
 *  [tot volgende + aftelklok] — focus-kleur (plum). Tik op de PhotoCard (links,
 *  4 afgeronde hoeken) → schuift rechts en onthult een visuele agenda-tijdlijn
 *  (track + now-marker + gekleurde blokken, mix focus + olive) van de eerst-
 *  volgende 1–3 afspraken. */
export default function AgendaFocusWidget() {
  const { openModule } = usePanel();
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", limit: 80, realtime: true });
  const [now, setNow] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setPhase((p) => (p ? 0 : 1)), 3600); return () => clearInterval(t); }, []);

  const upcoming = useMemo(() => (events || []).filter((e) => e.start && new Date(e.start) > now).sort((a, b) => new Date(a.start) - new Date(b.start)), [events, now]);
  const next = upcoming[0];
  const todayCount = (events || []).filter((e) => { if (!e.start) return false; const d = new Date(e.start); const s = new Date(now); s.setHours(0, 0, 0, 0); const en = new Date(now); en.setHours(23, 59, 59, 999); return d >= s && d <= en; }).length;

  const diff = next ? new Date(next.start) - now : 0;
  const pad = (n) => String(n).padStart(2, "0");
  const countdown = next ? `${pad(Math.floor(diff / 3600000))}:${pad(Math.floor((diff % 3600000) / 60000))}:${pad(Math.floor((diff % 60000) / 1000))}` : "--:--:--";
  const evTime = next ? fmtTime(next.start) : "";
  const evDate = next ? new Date(next.start).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) : "";

  return (
    <div className="relative w-full h-[260px] rounded-[28px] overflow-hidden" style={{ "--tile-accent": DEEP, color: DEEP }}>
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(48,50,55,0.18)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)" }} />

      {/* rechts — glas content, focus-kleur (plum), kinetisch afwisselend */}
      <div className="absolute inset-y-0 right-0 w-[50%] flex flex-col p-4 z-10">
        <div className="flex items-center justify-between">
          <WidgetHeader type="agenda" label="What's Happening?" count={todayCount ? String(todayCount) : ""} />
          <button onClick={() => openModule("agenda")} className="text-[8px] uppercase tracking-[0.2em] font-bold pt-1" style={{ color: DEEP }}>AGENDA →</button>
        </div>
        <div className="flex-1 min-h-0" />
        <div className="relative h-[88px]">
          <AnimatePresence mode="wait">
            {next && phase === 0 ? (
              <motion.div key="ev" initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -16, filter: "blur(6px)" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 flex flex-col items-end justify-end">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-px w-6" style={{ background: OLIVE, opacity: 0.85 }} />
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: DEEP, opacity: 0.7 }}>{evDate}</p>
                </div>
                <div className="flex items-baseline justify-end gap-2.5 w-full">
                  <span className="text-[16px] font-display font-semibold leading-none truncate text-right" style={{ color: DEEP }}>{next.title}</span>
                  <span className="text-[52px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums shrink-0" style={{ color: DEEP }}>{evTime}</span>
                </div>
              </motion.div>
            ) : next ? (
              <motion.div key="cd" initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -16, filter: "blur(6px)" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 flex flex-col items-end justify-end">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-px w-6" style={{ background: URGENT, opacity: 0.85 }} />
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: DEEP, opacity: 0.7 }}>aftelklok</p>
                </div>
                <div className="flex items-baseline justify-end gap-2.5 w-full">
                  <span className="text-[15px] font-display font-semibold leading-none" style={{ color: DEEP, opacity: 0.65 }}>tot volgende</span>
                  <span className="text-[52px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums shrink-0" style={{ color: DEEP }}>{countdown}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-end justify-end">
                <p className="text-[12px] text-right" style={{ color: DEEP, opacity: 0.6 }}>{todayCount ? `${todayCount} vandaag · niets meer open` : "Niets gepland."}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* links — PhotoCard (4 afgeronde hoeken) + visuele tijdlijn */}
      <div className="absolute inset-y-0 left-0 w-[50%] overflow-hidden z-20">
        <AnimatePresence>
          {open && (
            <motion.div key="tl" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35 }} className="absolute inset-2 rounded-[24px] overflow-hidden flex flex-col p-3"
              style={{ background: "rgba(216,218,179,0.94)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
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
                <div className="absolute inset-0 pl-6 pt-7 overflow-y-auto no-scrollbar flex flex-col gap-2">
                  {upcoming.length === 0 ? (
                    <p className="text-[11px]" style={{ color: DEEP, opacity: 0.6 }}>Niets gepland.</p>
                  ) : upcoming.slice(0, 3).map((e, i) => {
                    const col = PAL[i % PAL.length];
                    return (
                      <div key={e.id || i} className="relative">
                        <span className="absolute -left-[14px] top-2.5 h-2.5 w-2.5 rounded-full" style={{ background: col, boxShadow: "0 0 0 3px rgba(216,218,179,0.94)" }} />
                        <div className="rounded-xl px-2.5 py-1.5" style={{ background: tint(col, 0.14), borderLeft: `2.5px solid ${col}` }}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[16px] font-display font-bold tabular-nums leading-none" style={{ color: DEEP }}>{fmtTime(e.start)}</span>
                            <span className="text-[8px] uppercase tracking-[0.16em] font-bold shrink-0" style={{ color: DEEP, opacity: 0.6 }}>{relTime(e.start, now)}</span>
                          </div>
                          <p className="text-[10px] leading-tight truncate mt-1" style={{ color: DEEP, opacity: 0.85 }}>{e.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="absolute inset-2 rounded-[24px] overflow-hidden cursor-pointer" animate={{ x: open ? "110%" : "0%" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} onClick={() => setOpen((o) => !o)} aria-label="Toon tijdlijn">
          <img src={PHOTO} alt="What's Happening" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-black/8 to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: IVORY, opacity: 0.75 }}>
            <ChevronRight className="h-3 w-3" /> tijdlijn
          </div>
        </motion.div>
      </div>
    </div>
  );
}