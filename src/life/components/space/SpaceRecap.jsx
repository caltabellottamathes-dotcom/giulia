import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, RefreshCw } from "lucide-react";

const SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "Korte prikkende zin, max ~8 woorden, geen label-woord ervoor" },
    body: { type: "string", description: "3-5 zinnen in gewone menselijke taal, met concrete cijfers/data" },
  },
  required: ["headline", "body"],
};

/** SpaceRecap — live AI-samenvatting van de actuele tab-staat. */
export default function SpaceRecap({ prompt, fallback, refreshKey, onRefresh }) {
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setErr(false);
    base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: SCHEMA })
      .then((r) => {
        if (cancelled) return;
        if (r && r.headline && r.body) setRecap(r);
        else setErr(true);
      })
      .catch(() => { if (!cancelled) setErr(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [prompt, refreshKey]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
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
      {loading ? (
        <div className="space-y-2.5">
          <div className="h-7 w-3/4 rounded-lg shimmer" />
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-5/6 rounded shimmer" />
          <div className="h-4 w-4/6 rounded shimmer" />
        </div>
      ) : err ? (
        fallback
      ) : (
        <>
          <h2 className="font-display text-[26px] lg:text-[28px] font-semibold tracking-[-0.02em] text-foreground leading-[1.08] mb-4 text-balance">{recap.headline}</h2>
          <p className="text-[15px] leading-[1.65] text-foreground/75 text-balance">{recap.body}</p>
        </>
      )}
    </div>
  );
}