import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, RefreshCw } from "lucide-react";

const SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "Korte prikkende zin, max ~8 woorden, geen label-woord ervoor" },
    summary: { type: "string", description: "2-3 zinnen, kern van de staat, met concrete cijfers/data" },
    highlights: {
      type: "array",
      items: {
        type: "object",
        properties: { kicker: { type: "string" }, text: { type: "string" } },
        required: ["kicker", "text"],
      },
    },
  },
  required: ["headline", "summary", "highlights"],
};

/** SpaceRecap — editorial, gemengde typografie, vult de kolomhoogte. */
export default function SpaceRecap({ prompt, fallback, refreshKey, onRefresh }) {
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setErr(false);
    base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: SCHEMA })
      .then((r) => { if (cancelled) return; if (r && r.headline && r.summary && Array.isArray(r.highlights)) setRecap(r); else setErr(true); })
      .catch(() => { if (!cancelled) setErr(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [prompt, refreshKey]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-olive" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">GIULIA · recap</p>
        </div>
        {onRefresh && (
          <button onClick={onRefresh} title="Recap verversen" className="p-1.5 rounded-full hover:bg-foreground/5 text-muted-foreground transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
      <div className="flex flex-col flex-1 gap-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-10 w-3/4 rounded-lg shimmer" />
            <div className="h-4 w-full rounded shimmer" />
            <div className="h-4 w-5/6 rounded shimmer" />
            <div className="mt-8 space-y-3">
              <div className="h-12 rounded shimmer" />
              <div className="h-12 rounded shimmer" />
              <div className="h-12 rounded shimmer" />
            </div>
          </div>
        ) : err ? (
          fallback
        ) : (
          <>
            <h2 className="font-display text-[40px] leading-[0.95] tracking-[-0.03em] text-foreground">{recap.headline}</h2>
            <p className="font-body text-[15px] leading-[1.65] text-foreground/75 text-balance italic">{recap.summary}</p>
            <div className="flex flex-col gap-4 mt-auto">
              {(recap.highlights || []).map((h, i) => (
                <div key={i} className="border-t border-foreground/12 pt-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-olive mb-1">{h.kicker}</p>
                  <p className="font-display text-[15px] leading-[1.5] text-foreground/85">{h.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}