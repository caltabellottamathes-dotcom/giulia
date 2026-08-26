import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, ChevronDown } from "lucide-react";

const SCHEMA = {
  type: "object",
  properties: {
    eyebrow: { type: "string", description: "Kleine uppercase blauwe label, bijv. 'PERSONAL ADMIN / CURRENT STATE'" },
    title: { type: "string", description: "Grote zwarte kop, max ~7 woorden" },
    subtitle: { type: "string", description: "Blauwe uppercase ondertitel, één korte zin" },
    body: { type: "string", description: "1-2 zinnen met concrete cijfers" },
    footerLeft: { type: "string", description: "Blauw editorial footer-label links" },
    footerRight: { type: "string", description: "Blauw editorial footer-label rechts" },
    attentionTitle: { type: "string", description: "Zwarte uppercase titel aandachtsblok" },
    attentionBadge: { type: "string", description: "Blauw uppercase badge, bijv. '03 ITEMS NEED ACTION'" },
    items: {
      type: "array",
      description: "1-3 dingen die nu aandacht vragen",
      items: {
        type: "object",
        properties: { title: { type: "string" }, sub: { type: "string" } },
        required: ["title", "sub"],
      },
    },
    restTitle: { type: "string", description: "Blauwe uppercase afsluitende kop" },
    restBody: { type: "string", description: "Afsluitende geruststellende zin" },
  },
  required: ["eyebrow", "title", "subtitle", "body", "items", "restTitle", "restBody"],
};

const pad = (n) => String(n).padStart(2, "0");

/** EditorialLayout — reference editorial: top block + attention list + closing. */
export function EditorialLayout({ data }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return (
    <div className="flex flex-col min-h-full">
      {/* ── TOP BLOCK ── */}
      <section>
        <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-editorial-blue">{data.eyebrow}</p>
        <h2 className="font-display text-[36px] sm:text-[40px] leading-[0.98] tracking-[-0.03em] text-foreground font-medium mt-2">{data.title}</h2>
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-editorial-blue mt-3">{data.subtitle}</p>
        <div className="flex items-start gap-3 mt-4">
          <p className="font-body text-[14px] leading-[1.6] text-foreground/80 text-balance flex-1">{data.body}</p>
          <ChevronDown className="w-4 h-4 text-editorial-blue shrink-0 mt-1" />
        </div>
      </section>

      {/* footer rule */}
      <div className="mt-5 pt-3 border-t border-foreground/15 flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold text-editorial-blue">{data.footerLeft || "HERE'S HOW WE READ A FRAME"}</p>
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold text-editorial-blue">{data.footerRight || "(SCROLL)"}</p>
      </div>

      {/* ── ATTENTION BLOCK ── */}
      {items.length > 0 && (
        <section className="mt-7">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[14px] uppercase tracking-[0.14em] font-bold text-foreground">{data.attentionTitle || "WHAT NEEDS YOUR ATTENTION"}</h3>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-editorial-blue shrink-0">{data.attentionBadge || `${pad(items.length)} ITEMS`}</span>
          </div>
          <div className="mt-3 border-t border-foreground/15">
            {items.map((it, i) => (
              <div key={i} className={`flex items-start gap-4 py-3.5 ${i > 0 ? "border-t border-foreground/12" : ""}`}>
                <span className="font-display text-[22px] leading-none font-light text-foreground/70 tabular-nums shrink-0 w-7">{pad(i + 1)}</span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-foreground leading-tight">{it.title}</p>
                  <p className="text-[12px] text-foreground/65 leading-[1.5] mt-1">{it.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CLOSING ── */}
      <section className="mt-auto pt-6">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-editorial-blue">{data.restTitle}</p>
        <p className="font-body text-[13px] leading-[1.55] text-foreground/70 mt-1.5">{data.restBody}</p>
      </section>
    </div>
  );
}

/** SpaceRecap — GIULIA-gegenereerde editorial recap volgens het reference-model. */
export default function SpaceRecap({ prompt, fallback, refreshKey, onRefresh }) {
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setErr(false);
    base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: SCHEMA })
      .then((r) => { if (cancelled) return; if (r && r.title && Array.isArray(r.items)) setRecap(r); else setErr(true); })
      .catch(() => { if (!cancelled) setErr(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [prompt, refreshKey]);

  const data = err ? fallback : recap;

  return (
    <div className="flex flex-col min-h-full">
      {onRefresh && (
        <button onClick={onRefresh} title="Recap verversen" className="self-end mb-2 p-1.5 rounded-full hover:bg-foreground/5 text-muted-foreground transition">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      )}
      {loading ? (
        <div className="space-y-3 flex-1">
          <div className="h-3 w-1/2 rounded shimmer" />
          <div className="h-10 w-3/4 rounded-lg shimmer" />
          <div className="h-3 w-2/3 rounded shimmer" />
          <div className="h-4 w-full rounded shimmer mt-4" />
          <div className="h-4 w-5/6 rounded shimmer" />
          <div className="mt-8 space-y-4">
            <div className="h-16 rounded shimmer" />
            <div className="h-16 rounded shimmer" />
            <div className="h-16 rounded shimmer" />
          </div>
        </div>
      ) : data ? (
        <EditorialLayout data={data} />
      ) : null}
    </div>
  );
}