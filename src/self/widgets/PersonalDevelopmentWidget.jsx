import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { fmtDate } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Personal Development widget — grote visuele informatiekaart (2×2).
 *  Full-bleed contemplatiefoto + donkerplum gradient + dynamische headline +
 *  verticale voortgangsbars per ontwikkelgebied (dominant visueel element) +
 *  milestones/learning strip onderaan. */
export default function PersonalDevelopmentWidget() {
  const { openModule } = usePanel();
  const { data: goals, loading } = useEntityList("SelfGoal", { realtime: true });

  const active = useMemo(() => (goals || []).filter((g) => g.status === "active"), [goals]);

  const areas = useMemo(() => {
    const map = new Map();
    for (const g of active) {
      const area = g.area || "Algemeen";
      if (!map.has(area)) map.set(area, []);
      map.get(area).push(g);
    }
    return Array.from(map.entries()).slice(0, 6).map(([name, items]) => ({
      name,
      progress: Math.round(items.reduce((s, g) => s + (g.progress || 0), 0) / items.length),
      count: items.length,
    }));
  }, [active]);

  const milestones = useMemo(() => active.filter((g) => g.type === "milestone"), [active]);
  const learning = useMemo(() => active.filter((g) => g.type === "learning"), [active]);
  const avgAll = active.length ? Math.round(active.reduce((s, g) => s + (g.progress || 0), 0) / active.length) : 0;

  // ── Dynamische headline
  const headline = !active.length ? "NO GOALS" : avgAll >= 75 ? "NEARLY THERE" : avgAll >= 40 ? "GROWING" : "PLANTING";
  const sub = !active.length ? "Nog geen doelen gesteld"
    : `${active.length} doelen · ${areas.length} gebieden`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfdevelopment")} className="min-h-[280px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden rounded-[inherit]">
        <img src={IMAGES.selfDevelopment} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" draggable={false} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, hsl(var(--self-primary) / 0.90) 0%, hsl(var(--self-primary) / 0.55) 45%, hsl(var(--self-primary) / 0.92) 100%)` }} />

        <div className="relative z-10 grid grid-cols-[0.82fr_1.18fr] h-full">
          {/* Links — headline + groot gemiddelde cijfer */}
          <div className="p-6 flex flex-col text-ivory border-r border-ivory/10">
            <WidgetHeader label="Development" count={active.length ? `${active.length} actief` : "—"} />
            <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-2">{headline}</h3>
            <p className="text-[11px] uppercase tracking-[0.18em] opacity-55 mt-1.5">{sub}</p>
            <div className="flex-1" />
            <div className="flex items-end gap-3">
              <span className="text-[56px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" style={{ color: avgAll >= 75 ? SAGE : "hsl(var(--self-accent))" }}>{avgAll}<span className="text-[28px]">%</span></span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1">gemiddelde voortgang</p>
          </div>

          {/* Rechts — verticale voortgangsbars per gebied (visueel data-element) */}
          <div className="p-6 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/45 font-semibold mb-4">Ontwikkelgebieden</p>
            {loading ? (
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            ) : areas.length ? (
              <div className="flex items-end gap-2.5 h-32">
                {areas.map((a) => (
                  <div key={a.name} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <div className="w-full rounded-lg flex items-end overflow-hidden" style={{ height: "100%", background: "rgba(255,255,255,0.06)" }}>
                      <div className="w-full rounded-lg transition-all duration-700" style={{
                        height: `${Math.max(8, a.progress)}%`,
                        background: a.progress >= 75 ? SAGE : a.progress >= 40 ? "hsl(var(--self-accent-deep))" : "rgba(255,255,255,0.22)",
                      }} />
                    </div>
                    <span className="text-[8px] uppercase tracking-wide text-ivory/40 truncate w-full text-center" title={a.name}>{a.name.slice(0, 6)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-ivory/45">Geen doelen ingesteld.</p>
            )}
          </div>
        </div>

        {/* Onderaan — milestones + learning */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-4 border-t border-ivory/10 flex items-center justify-between" style={{ background: `linear-gradient(to top, hsl(var(--self-primary) / 0.92), transparent)` }}>
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Milestones</p>
            <p className="text-sm font-semibold text-ivory">{milestones.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Leren</p>
            <p className="text-sm font-semibold tabular-nums" style={{ color: SAGE }}>{learning.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Gebieden</p>
            <p className="text-sm font-semibold text-ivory">{areas.length}</p>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}