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
const IVORY = "hsl(var(--ivory))";

const fmtTime = (iso) => { try { return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

/** AgendaFocusWidget — G·21x9·L·SIDE · "What's Happening?"
 *  Rechts (glas): afspraak-tijd + titel op één lijn, datum erboven, aftelklok
 *  onderaan op één lijn met "tot volgende" — focus-kleuren (plum). Tik op de
 *  PhotoCard (links) → schuift rechts en onthult een chronologische tijdlijn
 *  van de eerstvolgende afspraken. */
export default function AgendaFocusWidget() {
  const { openModule } = usePanel();
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", limit: 80, realtime: true });
  const [now, setNow] = useState(new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const upcoming = useMemo(() => (events || []).filter((e) => e.start && new Date(e.start) > now).sort((a, b) => new Date(a.start) - new Date(b.start)), [events, now]);
  const next = upcoming[0];
  const todayCount = (events || []).filter((e) => { if (!e.start) return false; const d = new Date(e.start); const s = new Date(now); s.setHours(0, 0, 0, 0); const en = new Date(now); en.setHours(23, 59, 59, 999); return d >= s && d <= en; }).length;

  const diff = next ? new Date(next.start) - now : 0;
  const hh = Math.floor(diff / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const countdown = next ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : "--:--:--";
  const evTime = next ? fmtTime(next.start) : "";
  const evDate = next ? new Date(next.start).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) : "";

  return (
    <div className="relative w-full h-[260px] rounded-[28px] overflow-hidden" style={{ "--tile-accent": DEEP, color: DEEP }}>
      {/* glass shell (licht over pagina) */}
      <div className="absolute inset-0 overflow-hidden ring-1 ring-inset ring-white/10 rounded-[28px]" style={{ background: "rgba(48,50,55,0.18)", backdropFilter: "blur(22px) saturate(1.35)", WebkitBackdropFilter: "blur(22px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.12)" }} />

      {/* rechts — glas content, focus-kleur (plum) */}
      <div className="absolute inset-y-0 right-0 w-[50%] flex flex-col p-4 z-10">
        <div className="flex items-center justify-between">
          <WidgetHeader type="agenda" label="What's Happening?" count={todayCount ? String(todayCount) : ""} />
          <button onClick={() => openModule("agenda")} className="text-[8px] uppercase tracking-[0.2em] font-bold pt-1" style={{ color: DEEP }}>AGENDA →</button>
        </div>

        <div className="flex-1 min-h-0" />

        {next ? (
          <>
            <div className="flex flex-col items-end mb-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-px w-6" style={{ background: LIGHT, opacity: 0.8 }} />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: DEEP, opacity: 0.7 }}>{evDate}</p>
              </div>
              <div className="flex items-baseline justify-end gap-2.5 w-full">
                <span className="text-[16px] font-display font-semibold leading-none truncate text-right" style={{ color: DEEP }}>{next.title}</span>
                <span className="text-[52px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums shrink-0" style={{ color: DEEP }}>{evTime}</span>
              </div>
            </div>
            <div className="flex items-baseline justify-end gap-2.5 w-full">
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: DEEP, opacity: 0.55 }}>tot volgende</span>
              <span className="text-[28px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ color: DEEP, opacity: 0.85 }}>{countdown}</span>
            </div>
          </>
        ) : (
          <p className="text-[12px] text-right" style={{ color: DEEP, opacity: 0.6 }}>{todayCount ? `${todayCount} vandaag · niets meer open` : "Niets gepland."}</p>
        )}
      </div>

      {/* links — PhotoCard + tijdlijn */}
      <div className="absolute inset-y-0 left-0 w-[50%] overflow-hidden z-20">
        <AnimatePresence>
          {open && (
            <motion.div key="tl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0 flex flex-col p-3 overflow-hidden"
              style={{ background: "rgba(216,218,179,0.94)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: DEEP }}>eerst volgende</span>
                <button onClick={() => setOpen(false)} className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: DEEP, opacity: 0.7 }}>← terug</button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {upcoming.length === 0 ? (
                  <p className="text-[11px] mt-2" style={{ color: DEEP, opacity: 0.6 }}>Niets gepland.</p>
                ) : (
                  <div className="relative pl-4">
                    <span className="absolute left-1 top-1 bottom-1 w-px" style={{ background: DEEP, opacity: 0.35 }} />
                    {upcoming.slice(0, 6).map((e, i) => (
                      <div key={e.id || i} className="relative flex items-start gap-2.5 mb-3">
                        <span className="absolute -left-[11px] top-1.5 rounded-full" style={{ background: DEEP, width: i === 0 ? 10 : 8, height: i === 0 ? 10 : 8 }} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-display font-bold tabular-nums leading-none" style={{ color: DEEP }}>{fmtTime(e.start)}</p>
                          <p className="text-[10px] leading-tight truncate mt-0.5" style={{ color: DEEP, opacity: 0.8 }}>{e.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="absolute inset-0 cursor-pointer" animate={{ x: open ? "102%" : "0%" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} onClick={() => setOpen((o) => !o)} aria-label="Toon tijdlijn">
          <img src={PHOTO} alt="What's Happening" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: IVORY, opacity: 0.75 }}>
            <ChevronRight className="h-3 w-3" /> tijdlijn
          </div>
        </motion.div>
      </div>
    </div>
  );
}