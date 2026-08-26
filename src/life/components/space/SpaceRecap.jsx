import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, ChevronDown, ArrowRight } from "lucide-react";

const STALE_MS = 8 * 60 * 60 * 1000; // 8 uur — een paar keer per dag

const TAB_LINKS = ["OVERVIEW", "PORTEFEUILLES", "LASTEN", "INKOMEN", "FORECAST", "DOCUMENTEN", "HEALTHY_MONEY"];

const SCHEMA = {
  type: "object",
  properties: {
    eyebrow: { type: "string" },
    title: { type: "string" },
    subtitle: { type: "string" },
    body: { type: "string" },
    footerLeft: { type: "string" },
    footerRight: { type: "string" },
    attentionTitle: { type: "string" },
    attentionBadge: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          sub: { type: "string" },
          link: { type: "string", enum: TAB_LINKS, description: "tab waar Salvo heen moet om dit op te lossen" },
        },
        required: ["title", "sub"],
      },
    },
    restTitle: { type: "string" },
    restBody: { type: "string" },
  },
  required: ["eyebrow", "title", "subtitle", "body", "items", "restTitle", "restBody"],
};

const pad = (n) => String(n).padStart(2, "0");

/** EditorialLayout — Giulia's analyse (niet handmatig aanpasbaar).
 *  Hoofdaccenten: Ridge + Pistachio. Body leesbaar in smoke. Titel zwart.
 *  "What needs your attention"-items zijn klikbaar en leiden naar de juiste tab. */
export function EditorialLayout({ data, onRefresh, onNavigate, loading }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const rawTitle = (data?.title || "").toUpperCase();
  const title = rawTitle.endsWith(".") ? rawTitle : `${rawTitle}.`;
  return (
    <div className="flex flex-col min-h-full">
      <section className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-life-ridge">{data.eyebrow}</p>
          {onRefresh && (
            <button onClick={onRefresh} title="GIULIA opnieuw genereren" className="p-1 rounded-full hover:bg-foreground/5 text-life-ridge transition">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
        <h2 className="font-display text-[32px] sm:text-[38px] leading-[0.98] tracking-[-0.03em] text-foreground font-medium mt-3">{title}</h2>
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-life-ridge mt-3">{data.subtitle}</p>
        <div className="flex items-start gap-3 mt-5">
          <p className="font-body text-[14px] leading-[1.7] text-smoke text-balance flex-1">{data.body}</p>
          <ChevronDown className="w-4 h-4 text-life-ridge shrink-0 mt-1" />
        </div>
      </section>

      <div className="mt-6 pt-3 border-t border-foreground/15 flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold text-life-ridge">{data.footerLeft || "HERE'S HOW WE READ A FRAME"}</p>
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold text-life-ridge">{data.footerRight || "(SCROLL)"}</p>
      </div>

      <div className="flex-1 min-h-5" />

      {items.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[14px] uppercase tracking-[0.14em] font-bold text-smoke">{data.attentionTitle || "WHAT NEEDS YOUR ATTENTION"}</h3>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-life-pistachio shrink-0">{data.attentionBadge || `${pad(items.length)} ITEMS`}</span>
          </div>
          <div className="mt-3 border-t border-foreground/15">
            {items.map((it, i) => {
              const nav = it.link && onNavigate;
              const Tag = nav ? "button" : "div";
              return (
                <Tag
                  key={i}
                  {...(nav ? { onClick: () => onNavigate(it.link) } : {})}
                  className={`flex items-start gap-4 py-4 w-full text-left ${i > 0 ? "border-t border-foreground/12" : ""} ${nav ? "hover:bg-foreground/[0.03] transition group cursor-pointer" : ""}`}
                >
                  <span className="font-display text-[22px] leading-none font-light text-life-pistachio tabular-nums shrink-0 w-7">{pad(i + 1)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-smoke leading-tight">{it.title}</p>
                    <p className="text-[12px] text-smoke/75 leading-[1.55] mt-1.5">{it.sub}</p>
                  </div>
                  {nav && <ArrowRight className="w-3.5 h-3.5 text-life-ridge shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition" />}
                </Tag>
              );
            })}
          </div>
        </section>
      )}

      <section className={items.length > 0 ? "pt-6" : "pt-3"}>
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-life-ridge">{data.restTitle}</p>
        <p className="font-body text-[13px] leading-[1.6] text-smoke/80 mt-2">{data.restBody}</p>
      </section>
    </div>
  );
}

/** SpaceRecap — per-tab editorial recap. Giulia's analyse; regenereert alleen
 *  wanneer er geen opgeslagen versie is, de data is veranderd (signature wijkt
 *  af), of de cache ouder is dan 8 uur. Niet bij elke load. Niet handmatig
 *  aanpasbaar. */
export default function SpaceRecap({ storageKey, dataSignature = "", prompt, fallback, onRefresh, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const promptRef = useRef(prompt);
  promptRef.current = prompt;

  const generate = async () => {
    try {
      const res = await base44.functions.invoke("generateAdminRecap", { prompt: promptRef.current, schema: SCHEMA });
      if (res && res.ok && res.data && res.data.title && Array.isArray(res.data.items)) return res.data;
    } catch { /* ignore */ }
    return null;
  };

  const persist = (content) => {
    localStorage.setItem(storageKey, JSON.stringify({ _content: content, _ts: Date.now(), _sig: dataSignature }));
  };

  useEffect(() => {
    let cancelled = false;
    const saved = localStorage.getItem(storageKey);
    let savedContent = null, savedTs = 0, savedSig = "";
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p && p._content && p._content.title) { savedContent = p._content; savedTs = p._ts || 0; savedSig = p._sig || ""; }
      } catch { /* ignore */ }
    }
    const fresh = savedContent && savedSig === dataSignature && (Date.now() - savedTs < STALE_MS);
    if (savedContent) setData(savedContent);
    if (fresh) { setLoading(false); return; }
    setLoading(true);
    generate()
      .then((r) => { if (cancelled) return; if (r) { setData(r); persist(r); } else if (!savedContent && fallback) { setData(fallback); } })
      .catch(() => { if (!cancelled && !savedContent && fallback) setData(fallback); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [storageKey, dataSignature]); // eslint-disable-line react-hooks/exhaustive-deps

  const regenerate = async () => {
    setLoading(true);
    const r = await generate();
    if (r) { setData(r); persist(r); }
    setLoading(false);
    onRefresh?.();
  };

  return (
    <>
      {loading && !data ? (
        <div className="space-y-3">
          <div className="h-3 w-1/2 rounded shimmer" />
          <div className="h-10 w-3/4 rounded-lg shimmer" />
          <div className="h-3 w-2/3 rounded shimmer" />
          <div className="h-4 w-full rounded shimmer mt-4" />
          <div className="h-4 w-5/6 rounded shimmer" />
          <div className="mt-8 space-y-4">
            <div className="h-16 rounded shimmer" />
            <div className="h-16 rounded shimmer" />
          </div>
        </div>
      ) : data ? (
        <EditorialLayout data={data} onRefresh={regenerate} onNavigate={onNavigate} loading={loading} />
      ) : null}
    </>
  );
}