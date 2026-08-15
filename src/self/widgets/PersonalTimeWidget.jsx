import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { totalPersonalTimeToday, sumPersonalTime, fmtDuration, timeBlockColor, timeBlockLabel } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Personal Time widget — grote visuele informatiekaart (2×2).
 *  Full-bleed rustfoto + donkerplum gradient + grote headline + totaal
 *  beschermd + 24-uurs day-bar (horizontale tijdbalk met gekleurde blokken
 *  voor rest/recovery/free/protected) als dominant visueel element +
 *  breakdown strip onderaan. */
export default function PersonalTimeWidget() {
  const { openModule } = usePanel();
  const { data: blocks, loading } = useEntityList("PersonalTimeBlock", { realtime: true });

  const todayBlocks = useMemo(() => {
    const d = new Date().toDateString();
    return (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled");
  }, [blocks]);

  const total = todayBlocks.reduce((s, b) => s + (b.duration_min || 0), 0);
  const protected_ = todayBlocks.filter((b) => b.is_protected).reduce((s, b) => s + (b.duration_min || 0), 0);
  const rest = sumPersonalTime(todayBlocks, "rest");
  const recovery = sumPersonalTime(todayBlocks, "recovery");
  const free = sumPersonalTime(todayBlocks, "free");

  // ── Day-bar segments: positie + breedte op een 24-uurs schaal
  const segments = useMemo(() => {
    return todayBlocks.map((b) => {
      const s = new Date(b.start);
      const startH = s.getHours() + s.getMinutes() / 60;
      const dur = (b.duration_min || 0) / 60;
      return {
        left: (startH / 24) * 100,
        width: (dur / 24) * 100,
        type: b.type,
        isProtected: b.is_protected,
      };
    });
  }, [todayBlocks]);

  // ── Dynamische headline
  const headline = !total ? "NO REST" : protected_ > 120 ? "PROTECTED" : total > 180 ? "BALANCED" : total > 60 ? "SOME ROOM" : "TIGHT";
  const sub = !total ? "Geen persoonlijke tijd vandaag"
    : `${fmtDuration(total)} gepland · ${fmtDuration(protected_)} beschermd`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfpersonaltime")} className="min-h-[280px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden rounded-[inherit]">
        <img src={IMAGES.selfPersonalTime} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" draggable={false} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, hsl(var(--self-primary) / 0.88) 0%, hsl(var(--self-primary) / 0.55) 45%, hsl(var(--self-primary) / 0.92) 100%)` }} />

        <div className="relative z-10 h-full p-6 flex flex-col text-ivory">
          <WidgetHeader label="Personal Time" count={todayBlocks.length ? `${todayBlocks.length} blokken` : "leeg"} />

          {/* Grote headline + totaal */}
          <h3 className="text-[30px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-2">{headline}</h3>
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-55 mt-1.5">{sub}</p>

          <div className="mt-5 flex items-end gap-4">
            <span className="text-[56px] leading-[0.82] font-display font-semibold tabular-nums tracking-[-0.04em]" style={{ color: protected_ > 0 ? SAGE : "rgba(255,255,255,0.5)" }}>
              {Math.floor(total / 60)}<span className="text-[28px]">u</span>{total % 60}<span className="text-[28px]">m</span>
            </span>
            <div className="mb-2.5">
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 leading-tight">persoonlijke<br />tijd vandaag</p>
            </div>
          </div>

          {/* ── 24-uurs day-bar — dominant visueel data-element */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/45 font-semibold">Dagverdeling</p>
              <div className="flex items-center gap-3 text-[9px] uppercase tracking-wide text-ivory/40">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: timeBlockColor("rest") }} />Rust</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: timeBlockColor("recovery") }} />Herstel</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: timeBlockColor("free") }} />Vrij</span>
              </div>
            </div>
            <div className="relative h-10 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              {/* Uurmarkeringen */}
              {[0, 6, 12, 18, 24].map((h) => (
                <span key={h} className="absolute top-0 bottom-0 w-px" style={{ left: `${(h / 24) * 100}%`, background: "rgba(255,255,255,0.06)" }} />
              ))}
              {/* Tijdblok-segments */}
              {segments.map((s, i) => (
                <div key={i} className="absolute top-1 bottom-1 rounded-md transition-all duration-700" style={{
                  left: `${s.left}%`,
                  width: `${Math.max(1.5, s.width)}%`,
                  background: timeBlockColor(s.type),
                  opacity: s.isProtected ? 0.95 : 0.6,
                  boxShadow: s.isProtected ? `0 0 8px ${timeBlockColor(s.type)}` : "none",
                  border: s.isProtected ? "1px solid rgba(255,255,255,0.25)" : "none",
                }} />
              ))}
              {/* Leeg-state hint */}
              {!segments.length && !loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-[11px] italic text-ivory/35">Geen tijd ingepland</p>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-1 text-[8px] uppercase tracking-wide text-ivory/30 tabular-nums">
              <span>0u</span><span>6u</span><span>12u</span><span>18u</span><span>24u</span>
            </div>
          </div>

          <div className="flex-1" />
        </div>

        {/* Onderaan — breakdown strip */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-4 border-t border-ivory/10 flex items-center justify-between" style={{ background: `linear-gradient(to top, hsl(var(--self-primary) / 0.92), transparent)` }}>
          <Mini label="Rust" value={fmtDuration(rest)} color={timeBlockColor("rest")} />
          <Mini label="Herstel" value={fmtDuration(recovery)} color={timeBlockColor("recovery")} />
          <Mini label="Vrij" value={fmtDuration(free)} color={timeBlockColor("free")} />
          <Mini label="Beschermd" value={fmtDuration(protected_)} color={SAGE} highlight />
        </div>
      </div>
    </WidgetShell>
  );
}

function Mini({ label, value, color, highlight }) {
  return (
    <div className={highlight ? "text-right" : ""}>
      <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">{label}</p>
      <p className="text-sm font-semibold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}