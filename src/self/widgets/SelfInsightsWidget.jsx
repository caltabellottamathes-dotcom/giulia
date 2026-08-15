import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { IMAGES } from "@/lib/images";
import { insightTypeColor, insightTypeLabel, insightCategoryLabel } from "@/lib/selfUtils";

const SAGE = "hsl(var(--self-accent))";
const URGENT = "hsl(var(--self-urgent))";

/** Self Insights widget — grote visuele informatiekaart (2×2).
 *  Full-bleed introspectiefoto + donkerplum gradient + dynamische headline +
 *  categorisch spectrum (horizontale bars per inzichtcategorie — het
 *  dominante visuele element) + featured top insight onderaan. */
export default function SelfInsightsWidget() {
  const { openModule } = usePanel();
  const { data: insights, loading } = useEntityList("SelfInsight", { realtime: true, sort: "-created_date" });

  const active = useMemo(() => (insights || []).filter((i) => i.status === "active" || i.status === "confirmed"), [insights]);

  // ── Categorie-spectrum: aantal inzichten per categorie
  const spectrum = useMemo(() => {
    const cats = ["energy", "mood", "capacity", "routine", "rest", "personal_time", "social", "focus", "development"];
    const counts = cats.map((c) => ({
      cat: c,
      label: insightCategoryLabel(c) || c,
      count: active.filter((i) => i.category === c).length,
    }));
    return counts.sort((a, b) => b.count - a.count);
  }, [active]);

  const maxCount = Math.max(1, ...spectrum.map((s) => s.count));
  const topInsight = active[0];

  // ── Dynamische headline
  const headline = !active.length ? "NO PATTERNS" : active.length >= 5 ? "PATTERN RICH" : active.length >= 2 ? "EMERGING" : "FIRST SIGNAL";
  const sub = !active.length ? "Nog geen patronen ontdekt"
    : `${active.length} actief inzicht${active.length > 1 ? "en" : ""}`;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("selfinsights")} className="min-h-[280px]" style={{ "--tile-accent": SAGE }}>
      <div className="relative h-full overflow-hidden rounded-[inherit]">
        <img src={IMAGES.selfInsights} alt="" className="absolute inset-0 h-full w-full object-cover opacity-32" draggable={false} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, hsl(var(--self-primary) / 0.90) 0%, hsl(var(--self-primary) / 0.55) 45%, hsl(var(--self-primary) / 0.92) 100%)` }} />

        <div className="relative z-10 grid grid-cols-[0.82fr_1.18fr] h-full">
          {/* Links — headline + groot cijfer */}
          <div className="p-6 flex flex-col text-ivory border-r border-ivory/10">
            <WidgetHeader label="Self Insights" count={active.length ? `${active.length} actief` : "—"} />
            <h3 className="text-[28px] leading-[1.0] font-display font-semibold tracking-[-0.03em] mt-2">{headline}</h3>
            <p className="text-[11px] uppercase tracking-[0.18em] opacity-55 mt-1.5">{sub}</p>
            <div className="flex-1" />
            <div className="flex items-end gap-3">
              <span className="text-[56px] leading-[0.8] font-display font-semibold tabular-nums tracking-[-0.04em]" style={{ color: SAGE }}>{active.length}</span>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2 leading-tight">ontdekte<br />patronen</p>
            </div>
          </div>

          {/* Rechts — categorisch spectrum (visueel data-element) */}
          <div className="p-6 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/45 font-semibold mb-4">Spectrum</p>
            {loading ? (
              <div className="h-6 w-6 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" />
            ) : active.length ? (
              <div className="space-y-1.5">
                {spectrum.filter((s) => s.count > 0).slice(0, 6).map((s) => (
                  <div key={s.cat} className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-wide text-ivory/50 w-20 shrink-0 truncate">{s.label}</span>
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${(s.count / maxCount) * 100}%`,
                        background: SAGE,
                        opacity: 0.5 + (s.count / maxCount) * 0.5,
                      }} />
                    </div>
                    <span className="text-[10px] tabular-nums text-ivory/55 w-4 text-right shrink-0">{s.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-ivory/45">Nog geen patronen.</p>
            )}
          </div>
        </div>

        {/* Onderaan — featured top insight */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-4 border-t border-ivory/10" style={{ background: `linear-gradient(to top, hsl(var(--self-primary) / 0.92), transparent)` }}>
          {topInsight ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: insightTypeColor(topInsight.type) }}>{insightTypeLabel(topInsight.type)}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-ivory/55 font-semibold">Top inzicht</span>
              </div>
              <p className="text-sm font-semibold text-ivory truncate">{topInsight.title}</p>
            </div>
          ) : (
            <p className="text-sm italic text-ivory/40">Giulia ontdekt patronen na meer data.</p>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}