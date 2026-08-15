import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { fmtTime, journalTypeColor } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Journal widget — grote visuele informatiekaart (3×2, breed/panoramisch).
 *  Full-bleed foto + donkerplum gradient + grote momenten-headline +
 *  horizontale thread-visualisatie (momenten als stippen op een lijn door
 *  de dag) + highlights/threads strip onderaan. Brede cinematische
 *  verhouding voor een narratief onderwerp. */
export default function JournalWidget() {
  const { openModule } = usePanel();
  const { data: entries, loading } = useEntityList("JournalEntry", { realtime: true, sort: "-date", limit: 40 });

  const today = useMemo(() => {
    const d = new Date().toDateString();
    return (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === d);
  }, [entries]);

  const moments = useMemo(() => today.filter((e) => e.type === "moment" || e.type === "highlight"), [today]);
  const allHighlights = useMemo(() => (entries || []).filter((e) => e.is_highlight), [entries]);
  const openThreads = useMemo(() => (entries || []).filter((e) => e.type === "thread"), [entries]);

  // ── Thread-visualisatie: momenten als stippen op een horizontale lijn
  const threadDots = useMemo(() => {
    return today.map((e) => {
      const d = e.date ? new Date(e.date) : null;
      const hour = d ? d.getHours() + d.getMinutes() / 60 : 0;
      return { hour, type: e.type, title: e.title };
    }).sort((a, b) => a.hour - b.hour);
  }, [today]);

  // ── Dynamische headline
  const headline = !moments.length ? "QUIET DAY" : moments.length >= 5 ? "RICH DAY" : moments.length >= 2 ? "UNFOLDING" : "FIRST MARK";
  const sub = !moments.length ? "Nog niets vastgelegd vandaag"
    : `${moments.length} moment${moments.length > 1 ? "en" : ""} vandaag`;

  return (
    <WidgetShell size="3x2" radius="xl" interactive onClick={() => openModule("selfjournal")} className="min-h-[260px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden rounded-[inherit]">
        <img src={IMAGES.selfJournal} alt="" className="absolute inset-0 h-full w-full object-cover opacity-32" draggable={false} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(110deg, hsl(var(--self-primary) / 0.90) 0%, hsl(var(--self-primary) / 0.55) 50%, hsl(var(--self-primary) / 0.85) 100%)` }} />

        <div className="relative z-10 grid grid-cols-[0.75fr_1.25fr] h-full">
          {/* Links — grote headline + count */}
          <div className="p-6 flex flex-col text-ivory border-r border-ivory/10">
            <WidgetHeader label="Journal" count={moments.length ? `${moments.length} vandaag` : "leeg"} />
            <h3 className="text-[30px] leading-[0.98] font-display font-semibold tracking-[-0.03em] mt-2">{headline}</h3>
            <p className="text-[11px] uppercase tracking-[0.18em] opacity-55 mt-1.5">{sub}</p>
            <div className="flex-1" />
            <div className="flex items-end gap-3">
              <span className="text-[56px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" style={{ color: SAGE }}>{moments.length}</span>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2 leading-tight">meaningful<br />moments</p>
            </div>
          </div>

          {/* Rechts — horizontale thread-visualisatie */}
          <div className="p-6 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/45 font-semibold mb-6">Draad door de dag</p>
            {loading ? (
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            ) : threadDots.length ? (
              <div className="relative h-32 flex items-center">
                {/* Horizontale lijn */}
                <div className="absolute left-0 right-0 top-1/2 h-px" style={{ background: "rgba(255,255,255,0.14)" }} />
                {/* Uurmarkeringen */}
                {[6, 12, 18, 23].map((h) => (
                  <span key={h} className="absolute top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-wide text-ivory/30 tabular-nums" style={{ left: `${((h - 0) / 24) * 100}%` }}>{h}u</span>
                ))}
                {/* Moment-stippen */}
                {threadDots.map((d, i) => {
                  const pct = (d.hour / 24) * 100;
                  const isHighlight = d.type === "highlight";
                  return (
                    <div key={i} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group" style={{ left: `${pct}%` }}>
                      <span className="block rounded-full transition-all duration-500" style={{
                        width: isHighlight ? "16px" : "10px",
                        height: isHighlight ? "16px" : "10px",
                        background: journalTypeColor(d.type),
                        boxShadow: isHighlight ? `0 0 12px ${journalTypeColor(d.type)}` : "none",
                        opacity: 0.9,
                      }} />
                      <span className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-ivory/40 truncate max-w-[80px] hidden group-hover:block">{d.title}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm italic text-ivory/45">Geen momenten vandaag — voeg er een toe.</p>
            )}
          </div>
        </div>

        {/* Onderaan — highlights + threads */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-4 border-t border-ivory/10 flex items-center justify-between" style={{ background: `linear-gradient(to top, hsl(var(--self-primary) / 0.92), transparent)` }}>
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Highlights</p>
            <p className="text-sm font-semibold text-ivory">{allHighlights.length} bewaard</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Threads</p>
            <p className="text-sm font-semibold tabular-nums" style={{ color: SAGE }}>{openThreads.length} open</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Last</p>
            <p className="text-sm font-medium text-ivory/70">{fmtTime((entries || [])[0]?.date)}</p>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}