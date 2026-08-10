import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import CountUp from "./CountUp";
import BrandPhoto from "./BrandPhoto";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

const CATS = ["Opportunity", "Risk", "Research", "Suggestion", "Follow-up", "Trend"];

/** InsightsWidget — glass floats over a bottom photo; confidence sparkline. */
export default function InsightsWidget() {
  const { openModule } = usePanel();
  const { data: insights, loading, reload } = useEntityList("Insight", { sort: "-created_date" });
  const [busy, setBusy] = useState(false);
  const recent = insights.slice(0, 8);
  const fresh = insights.filter((i) => i.status === "new");
  const pts = recent.length ? recent.map((ins, i) => `${recent.length === 1 ? 0 : (i / (recent.length - 1)) * 100},${30 - (ins.confidence || 0.5) * 30}`).join(" ") : "";

  const research = async (e) => {
    e.stopPropagation(); setBusy(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: "Je bent Giulia, een proactieve AI-assistent voor een drukke professional. Onderzoek actuele ontwikkelingen en geef één kort, actionable inzicht of suggestie (een opportuniteit, risico of opvolging). Schrijf in het Nederlands, beknopt.",
        add_context_from_internet: true,
        response_json_schema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, category: { type: "string" }, confidence: { type: "number" } } },
      });
      await base44.entities.Insight.create({ title: res.title || "Nieuw inzicht", content: res.content || "", category: CATS.includes(res.category) ? res.category : "Suggestion", confidence: typeof res.confidence === "number" ? res.confidence : 0.6, source: "Giulia · web onderzoek", status: "new" });
      reload();
    } catch { /* ignore */ }
    setBusy(false);
  };

  return (
    <WidgetShell size="2x2" radius="medium" interactive onClick={() => openModule("insights")} className="min-h-[260px]">
      <div className="flex flex-col h-full">
        <div className="flex-1 -mb-8 rounded-b-[24px] glass-3 p-5 relative z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.35)] text-ivory flex flex-col">
          <WidgetHeader label="Giulia · Inzichten" count={insights.length ? `${insights.length}` : ""} />
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-8 w-8 border-2 border-ivory/20 border-t-ivory rounded-full animate-spin" /></div>
          ) : insights.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-end gap-3">
                <CountUp value={fresh.length} className="text-6xl font-display font-semibold tracking-[-0.04em] leading-none text-ivory" />
                <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/50 mb-2">nieuw</p>
              </div>
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-5 w-full h-10">
                <polyline points={pts} fill="none" stroke="var(--tile-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
              <p className="text-[10px] uppercase tracking-wider text-ivory/45 mt-1">betrouwbaarheid over tijd</p>
              {insights[0] && <p className="text-sm font-medium text-ivory/85 line-clamp-2 mt-3">{insights[0].title}</p>}
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