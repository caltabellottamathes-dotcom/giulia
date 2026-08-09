import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { Telescope, Search, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const CAT_STYLE = {
  Opportunity: "bg-olive text-ivory",
  Risk: "bg-charcoal text-ivory",
  Research: "bg-blue-grey text-charcoal",
  Suggestion: "bg-sand text-ivory",
  "Follow-up": "bg-stone text-charcoal",
  Trend: "bg-olive text-ivory",
};
const CATS = ["Opportunity", "Risk", "Research", "Suggestion", "Follow-up", "Trend"];

/**
 * InsightsWidget — Giulia proactively surfaces research & suggestions.
 * Transparent glass tile with solid palette category chips.
 */
export default function InsightsWidget() {
  const { openModule } = usePanel();
  const { data: insights, loading, reload } = useEntityList("Insight", { sort: "-created_date" });
  const [busy, setBusy] = useState(false);
  const visible = insights.slice(0, 3);

  const research = async (e) => {
    e.stopPropagation();
    setBusy(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt:
          "Je bent Giulia, een proactieve AI-assistent voor een drukke professional. Onderzoek actuele ontwikkelingen en geef één kort, actionable inzicht of suggestie (een opportuniteit, risico of opvolging). Schrijf in het Nederlands, beknopt.",
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            category: { type: "string" },
            confidence: { type: "number" },
          },
        },
      });
      await base44.entities.Insight.create({
        title: res.title || "Nieuw inzicht",
        content: res.content || "",
        category: CATS.includes(res.category) ? res.category : "Suggestion",
        confidence: typeof res.confidence === "number" ? res.confidence : 0.6,
        source: "Giulia · web onderzoek",
        status: "new",
      });
      reload();
    } catch {
      /* ignore */
    }
    setBusy(false);
  };

  return (
    <WidgetShell size="2x2" radius="medium" glass="translucent" interactive onClick={() => openModule("insights")} className="min-h-[300px]">
      <div className="p-5 flex flex-col h-full">
        <WidgetHeader icon={Telescope} label="Giulia · Inzichten" count={insights.length ? `${insights.length}` : ""} />

        {loading ? (
          <div className="flex-1 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-lg shimmer" />
            ))}
          </div>
        ) : visible.length > 0 ? (
          <div className="flex-1 space-y-3 overflow-hidden">
            {visible.map((ins) => (
              <div key={ins.id} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 h-6 px-1.5 rounded-md text-[8px] font-bold flex items-center justify-center shrink-0 uppercase tracking-wide",
                    CAT_STYLE[ins.category] || CAT_STYLE.Suggestion
                  )}
                >
                  {(ins.category || "Sugg").slice(0, 4)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{ins.title}</p>
                  <p className="text-[11px] text-foreground/55 line-clamp-2 mt-0.5">{ins.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="h-10 w-10 rounded-full bg-sand/20 flex items-center justify-center mb-2">
              <Search className="h-5 w-5 text-sand" />
            </span>
            <p className="text-sm font-semibold text-foreground">Giulia denkt na</p>
            <p className="text-xs text-foreground/55 mt-1">Laat Giulia proactief onderzoek doen.</p>
          </div>
        )}

        <button
          onClick={research}
          disabled={busy}
          className="mt-4 pt-3 border-t border-foreground/10 flex items-center justify-between text-[11px] font-semibold text-foreground hover:text-olive transition disabled:opacity-50"
        >
          <span className="flex items-center gap-1.5">
            {busy ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            {busy ? "Onderzoeken…" : "Giulia laat onderzoek doen"}
            <ArrowRight className="h-3 w-3" />
          </span>
        </button>
      </div>
    </WidgetShell>
  );
}