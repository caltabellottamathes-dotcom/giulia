import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { useEntityList } from "@/hooks/useEntity";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";

const DEEP = "hsl(var(--d-focus-deep))";   // burgundy
const LIGHT = "hsl(var(--d-focus-light))"; // cream

const fmtTime = (iso) => new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

/**
 * AgendaFocusWidget — P·16x9·L·SIDE · "What's Happening?"
 * Foto-shell = focusPillar (verticale betonnen architectuur).
 * Foto-kant: header + titel + datum + dag-tijdlijn met bewegende "now"-marker.
 * Glass-card: vandaag's afspraken als verticale tijdlijn; volgende afspraak
 * gemarkeerd met een burgundy "next"-badge. Klik opent het agenda-paneel.
 */
export default function AgendaFocusWidget() {
  const { openModule } = usePanel();
  const { data: events } = useEntityList("CalendarEvent", { sort: "start", limit: 80, realtime: true });

  const now = new Date();
  const today = useMemo(() => {
    const s = new Date(now); s.setHours(0, 0, 0, 0);
    const e = new Date(now); e.setHours(23, 59, 59, 999);
    return (events || [])
      .filter((ev) => ev.start && new Date(ev.start) >= s && new Date(ev.start) <= e)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const next = today.find((ev) => new Date(ev.start) > now) || today[0];
  const nowPct = () => {
    const s = new Date(now); s.setHours(0, 0, 0, 0);
    const e = new Date(now); e.setHours(23, 59, 59, 999);
    return Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
  };
  const dateLabel = now.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="w-full h-[320px]">
      <PhotoGlassLayeredWidget
        shape="16:9"
        photo={IMAGES.focusPillar}
        glassPosition="left"
        glassFraction={0.46}
        overhang={0.08}
        domain="focus"
        radius="large"
        onClick={() => openModule("agenda")}
        overlay="bg-gradient-to-t from-zinc-900/55 via-zinc-900/20 to-transparent"
        photoChildren={
          <div className="absolute inset-0 flex flex-col p-4 text-ivory">
            <WidgetHeader type="agenda" label="What's Happening?" count={today.length ? String(today.length) : ""} />
            <h3 className="text-[22px] leading-[1.05] font-display font-semibold tracking-[-0.02em]">
              A DAY, FRAMED.
            </h3>
            <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: LIGHT }}>
              {dateLabel}
            </p>
            <div className="flex-1" />
            {/* dag-tijdlijn met now-marker */}
            <div className="relative h-1.5 mb-1">
              <div className="absolute inset-y-0 inset-x-0 rounded-full bg-white/15" />
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${nowPct()}%`, background: DEEP }} />
              <motion.span
                className="absolute top-1/2 h-3 w-3 rounded-full"
                style={{ left: `calc(${nowPct()}% - 6px)`, transform: "translateY(-50%)", background: LIGHT, boxShadow: `0 0 12px ${LIGHT}` }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        }
      >
        <div className="flex flex-col h-full gap-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {today.length === 0 ? (
            <p className="text-[11px] text-ivory/60 px-1 py-1">Niets ingepland vandaag.</p>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar -mx-1 px-1">
              {today.map((ev, i) => {
                const isNext = ev.id === next?.id;
                return (
                  <div key={ev.id || i} className="flex items-start gap-2.5 py-1.5 border-b border-white/10 last:border-0">
                    <span className="text-[11px] font-mono tabular-nums pt-0.5" style={{ color: isNext ? LIGHT : "rgba(255,255,255,0.5)" }}>
                      {fmtTime(ev.start)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium leading-tight truncate" style={{ color: isNext ? "hsl(var(--ivory))" : "rgba(255,255,255,0.78)" }}>
                        {ev.title}
                      </p>
                      {ev.location && <p className="text-[10px] text-ivory/45 truncate">{ev.location}</p>}
                    </div>
                    {isNext && (
                      <span className="text-[8px] uppercase tracking-[0.15em] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: DEEP, color: LIGHT }}>
                        next
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}