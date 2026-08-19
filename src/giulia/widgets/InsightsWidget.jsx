import React, { useState, useEffect } from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import WidgetHeader from "../../system/widgets/WidgetHeader";
import CountUp from "../../system/widgets/CountUp";
import BrandPhoto from "../../system/widgets/BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { fetchUnifiedInsights, DOMAIN_META } from "@/lib/unifiedStream";

/** InsightsWidget — versmolten: Insight (Focus/Life/Giulia) + SelfInsight (Self). */
export default function InsightsWidget() {
  const { openModule } = usePanel();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const list = await fetchUnifiedInsights(20);
    setInsights(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const fresh = insights.filter((i) => i.status === "new" || i.status === "active");
  const recent = insights.slice(0, 8);
  const pts = recent.length ? recent.map((ins, i) => `${recent.length === 1 ? 0 : (i / (recent.length - 1)) * 100},${30 - (ins.confidence || 0.5) * 30}`).join(" ") : "";
  const top = insights[0];
  const topMeta = top ? DOMAIN_META[top._domain] || DOMAIN_META.giulia : null;

  const research = async (e) => {
    e.stopPropagation(); setBusy(true);
    try {
      const out = await base44.functions.invoke("researchInsights", { topic: "", count: 1 });
      const d = out?.data ?? out ?? {};
      const x = (d.insights || [])[0] || {};
      await base44.entities.Insight.create({ title: x.title || "Nieuw inzicht", content: x.content || "", category: x.category || "Suggestion", confidence: typeof x.confidence === "number" ? x.confidence : 0.6, source: "Giulia · web onderzoek", status: "new" });
      load();
    } catch { /* ignore */ }
    setBusy(false);
  };

  return (
    <WidgetShell size="2x2" radius="medium" interactive onClick={() => openModule("insights")} className="min-h-[260px]">
      <div className="flex flex-col h-full">
        <div className="flex-1 -mb-8 rounded-b-[24px] glass-3 p-5 relative z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          <WidgetHeader label="What I've Noticed. · alles" count={insights.length ? `${insights.length}` : ""} />
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : insights.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-end gap-3">
                <CountUp value={fresh.length} className="text-6xl font-display font-semibold tracking-[-0.03em] leading-none text-ivory" />
                <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50 mb-2">nieuw</p>
              </div>
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-5 w-full h-10">
                <polyline points={pts} fill="none" stroke="var(--tile-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
              <p className="text-[10px] uppercase tracking-wider text-ivory/45 mt-1">betrouwbaarheid over tijd</p>
              {top && (
                <div className="mt-3">
                  <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: topMeta.color }}>{topMeta.label}</span>
                  <p className="text-sm font-medium text-ivory/85 line-clamp-2 mt-0.5">{top.title}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-display font-semibold text-ivory/30">0</span>
              <p className="text-sm text-ivory/55 mt-1">Giulia denkt na</p>
            </div>
          )}
          <button onClick={research} disabled={busy} className="mt-4 rounded-full px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50" style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}>
            {busy ? "Onderzoeken…" : "Laat Giulia onderzoeken"}
          </button>
        </div>
        <div className="relative h-20 shrink-0 overflow-hidden">
          <BrandPhoto src={IMAGES.feetChair} className="absolute inset-0" overlay="bg-gradient-to-t from-charcoal/70 to-charcoal/20" />
        </div>
      </div>
    </WidgetShell>
  );
}