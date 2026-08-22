import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassPhotoLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusAlcove;
const LIGHT = "hsl(var(--d-focus-light))";
const DEEP = "hsl(var(--d-focus-deep))";
const IVORY = "hsl(var(--ivory))";

/** AgendaFocusWidget — G·21:9·L·SIDE · "What's Happening?"
 *  GlassCard: header + focale afspraak (tijd + titel + datum, groot) in het
 *  midden, live aftelklok onderaan. Data: CalendarEvent. Focus-kleuren. */
export default function AgendaFocusWidget() {
  const { openModule } = usePanel();
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", limit: 80, realtime: true });
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const next = (events || []).filter((e) => e.start && new Date(e.start) > now).sort((a, b) => new Date(a.start) - new Date(b.start))[0];
  const todayCount = (events || []).filter((e) => {
    if (!e.start) return false;
    const d = new Date(e.start); const s = new Date(now); s.setHours(0, 0, 0, 0); const en = new Date(now); en.setHours(23, 59, 59, 999);
    return d >= s && d <= en;
  }).length;

  const diff = next ? new Date(next.start) - now : 0;
  const hh = Math.floor(diff / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const countdown = next ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : "--:--:--";
  const evTime = next ? new Date(next.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "";
  const evDate = next ? new Date(next.start).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) : "";

  return (
    <div className="w-full h-[260px]">
      <GlassPhotoLayeredWidget shape="21:9" photo={PHOTO} photoPosition="left" photoFraction={0.36} overhang={0} domain="focus" radius="large" onClick={() => openModule("agenda")} photoOverlay="bg-gradient-to-t from-black/35 via-black/10 to-transparent"
        photoChildren={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-28 w-28">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}>
                  <span className="absolute top-0 left-1/2 h-3 w-3 -ml-1.5 rounded-full" style={{ background: [DEEP, LIGHT, "hsl(var(--smoke))"][i] }} />
                </motion.div>
              ))}
              <span className="absolute inset-0 m-auto h-3.5 w-3.5 rounded-full" style={{ background: DEEP }} />
            </div>
          </div>
        }
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between">
            <WidgetHeader type="agenda" label="What's Happening?" count={todayCount ? String(todayCount) : ""} />
            <button onClick={() => openModule("agenda")} className="text-[8px] uppercase tracking-[0.2em] font-bold pt-1" style={{ color: LIGHT }}>AGENDA →</button>
          </div>

          <div className="flex-1 flex flex-col justify-center min-h-0">
            {next ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: LIGHT }}>{evDate}</p>
                <span className="text-[52px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ color: IVORY }}>{evTime}</span>
                <span className="text-[16px] font-display font-semibold leading-tight truncate mt-1.5" style={{ color: IVORY }}>{next.title}</span>
              </>
            ) : (
              <p className="text-[12px] text-ivory/60">{todayCount ? `${todayCount} vandaag · niets meer open` : "Niets gepland."}</p>
            )}
          </div>

          <div className="flex items-end justify-between">
            <span className="text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>tot volgende</span>
            <span className="text-[30px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ color: LIGHT, opacity: 0.7 }}>{countdown}</span>
          </div>
        </div>
      </GlassPhotoLayeredWidget>
    </div>
  );
}