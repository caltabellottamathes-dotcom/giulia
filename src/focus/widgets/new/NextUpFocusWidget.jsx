import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassPhotoLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusAlcove;
const LIGHT = "hsl(var(--d-focus-light))";
const DEEP = "hsl(var(--d-focus-deep))";

/** NextUpFocusWidget — G·21x9·L·SIDE · "NEXT UP!"
 *  Focus-twin van Good Morning. Foto = focusAlcove. Glas-rechts: header +
 *  live aftelklok (HH:MM:SS) tot de volgende Focus-agenda-afspraak + de
 *  tijd + titel. Burgundy/cream. */
export default function NextUpFocusWidget() {
  const { openModule } = usePanel();
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", limit: 80, realtime: true });
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const next = (events || []).filter((e) => e.start && new Date(e.start) > now).sort((a, b) => new Date(a.start) - new Date(b.start))[0];
  const diff = next ? new Date(next.start) - now : 0;
  const hh = Math.floor(diff / 3600000);
  const mm = Math.floor((diff % 3600000) / 60000);
  const ss = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const countdown = next ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : "--:--:--";
  const evTime = next ? new Date(next.start).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "";

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
        <div className="flex items-start justify-between">
          <WidgetHeader type="briefing" label="NEXT UP!" />
          <button onClick={() => openModule("agenda")} className="text-[8px] uppercase tracking-[0.2em] font-bold pt-1" style={{ color: LIGHT }}>AGENDA →</button>
        </div>
        <div className="flex-1 flex flex-col justify-end items-end">
          {next ? (
            <>
              <span className="text-[64px] font-display font-bold leading-none tracking-[-0.04em] tabular-nums mb-1" style={{ color: LIGHT, opacity: 0.55 }}>{countdown}</span>
              <div className="flex items-end gap-2">
                <motion.span className="h-5 w-5 rounded-full mb-3" style={{ background: LIGHT }} animate={{ y: [0, -16, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }} />
                <div className="flex flex-col items-end">
                  <span className="text-[28px] font-display font-bold leading-none tracking-[-0.03em] tabular-nums">{evTime}</span>
                  <span className="text-[11px] text-ivory/70 truncate max-w-[260px]">{next.title}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[12px] text-ivory/60 py-4">Niets gepland.</p>
          )}
        </div>
      </GlassPhotoLayeredWidget>
    </div>
  );
}