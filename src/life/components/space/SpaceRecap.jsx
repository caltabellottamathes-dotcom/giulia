import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Pencil, ChevronDown } from "lucide-react";
import SpaceRecapEditor from "./SpaceRecapEditor";

const SCHEMA = {
  type: "object",
  properties: {
    eyebrow: { type: "string", description: "Kleine uppercase label, bijv. 'PERSONAL ADMIN / CURRENT STATE'" },
    title: { type: "string", description: "Grote kop in FULL CAPS met punt erachter, max ~7 woorden" },
    subtitle: { type: "string", description: "Ondertitel, één korte zin" },
    body: { type: "string", description: "1-2 zinnen met concrete cijfers" },
    footerLeft: { type: "string" },
    footerRight: { type: "string" },
    attentionTitle: { type: "string" },
    attentionBadge: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, sub: { type: "string" } },
        required: ["title", "sub"]
      }
    },
    restTitle: { type: "string" },
    restBody: { type: "string" }
  },
  required: ["eyebrow", "title", "subtitle", "body", "items", "restTitle", "restBody"]
};

const pad = (n) => String(n).padStart(2, "0");

/** EditorialLayout — reference editorial: top block + attention list + closing.
 *  LIFE-kleuren (Olive) voor accenttekst; hoofd titel in FULL CAPS met punt. */
export function EditorialLayout({ data, onRefresh, onEdit, loading }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const rawTitle = (data?.title || "").toUpperCase();
  const title = rawTitle.endsWith(".") ? rawTitle : `${rawTitle}.`;
  return (
    <div className="flex flex-col min-h-full">
      {/* editorial section header — duwt de tekst iets naar beneden */}
      <div className="flex items-center justify-between pb-3 border-b border-foreground/12">
        <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-life-olive">Editorial Summary</p>
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold text-life-olive">Giulia AI</p>
      </div>

      {/* TOP BLOCK */}
      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-[hsl(var(--blue-grey))]">{data.eyebrow}</p>
          <div className="flex items-center gap-1">
            {onRefresh &&
            <button onClick={onRefresh} title="GIULIA opnieuw genereren" className="p-1 rounded-full hover:bg-foreground/5 text-life-olive transition">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            }
            {onEdit &&
            <button onClick={onEdit} title="Handmatig aanpassen" className="p-1 rounded-full hover:bg-foreground/5 text-life-olive transition">
                <Pencil className="w-3 h-3" />
              </button>
            }
          </div>
        </div>
        <h2 className="font-display text-[32px] sm:text-[38px] leading-[0.98] tracking-[-0.03em] text-editorial-blue font-medium mt-3">{title}</h2>
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mt-3 text-[hsl(var(--ridge))]">{data.subtitle}</p>
        <div className="flex items-start gap-3 mt-5">
          <p className="font-body text-[14px] leading-[1.7] text-life-olive text-balance flex-1">{data.body}</p>
          <ChevronDown className="w-4 h-4 text-life-olive shrink-0 mt-1" />
        </div>
      </section>

      {/* footer rule */}
      <div className="mt-6 pt-3 border-t border-foreground/15 flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold text-life-olive">{data.footerLeft || "HERE'S HOW WE READ A FRAME"}</p>
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold text-life-olive">{data.footerRight || "(SCROLL)"}</p>
      </div>

      {/* spacer — duwt het aandachtsblok naar beneden zodat het de hoogte vult */}
      <div className="flex-1 min-h-5" />

      {/* ATTENTION BLOCK */}
      {items.length > 0 &&
      <section>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[14px] uppercase tracking-[0.14em] font-bold text-life-olive">{data.attentionTitle || "WHAT NEEDS YOUR ATTENTION"}</h3>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-life-olive shrink-0">{data.attentionBadge || `${pad(items.length)} ITEMS`}</span>
          </div>
          <div className="mt-3 border-t border-foreground/15">
            {items.map((it, i) =>
          <div key={i} className={`flex items-start gap-4 py-4 ${i > 0 ? "border-t border-foreground/12" : ""}`}>
                <span className="font-display text-[22px] leading-none font-light text-life-olive tabular-nums shrink-0 w-7">{pad(i + 1)}</span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-life-olive leading-tight">{it.title}</p>
                  <p className="text-[12px] text-life-olive/75 leading-[1.55] mt-1.5">{it.sub}</p>
                </div>
              </div>
          )}
          </div>
        </section>
      }

      {/* CLOSING */}
      <section className={items.length > 0 ? "pt-6" : "pt-3"}>
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-editorial-blue">{data.restTitle}</p>
        <p className="font-body text-[13px] leading-[1.6] text-life-olive/80 mt-2">{data.restBody}</p>
      </section>
    </div>);

}

/** SpaceRecap — per-tab editorial recap. Handmatig bewerkbaar (opgeslagen in
 *  localStorage per tab); GIULIA genereert een standaard wanneer er nog niets
 *  is opgeslagen. */
export default function SpaceRecap({ storageKey, prompt, fallback, onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const promptRef = useRef(prompt);
  promptRef.current = prompt;

  useEffect(() => {
    let cancelled = false;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p && p.title) {setData(p);setLoading(false);return;}
      } catch {/* ignore */}
    }
    setLoading(true);
    base44.integrations.Core.InvokeLLM({ prompt: promptRef.current, response_json_schema: SCHEMA }).
    then((r) => {if (cancelled) return;if (r && r.title && Array.isArray(r.items)) {setData(r);localStorage.setItem(storageKey, JSON.stringify(r));} else if (fallback) {setData(fallback);}}).
    catch(() => {if (!cancelled && fallback) setData(fallback);}).
    finally(() => {if (!cancelled) setLoading(false);});
    return () => {cancelled = true;};
  }, [storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = async () => {
    try {
      const res = await base44.functions.invoke("generateSpaceRecap", { prompt: promptRef.current, schema: SCHEMA, temperature: 0.5 });
      const r = res?.result ?? res?.data?.result ?? null;
      if (r && r.title && Array.isArray(r.items)) return r;
    } catch {/* ignore */}
    try {
      const r2 = await base44.integrations.Core.InvokeLLM({ prompt: promptRef.current, response_json_schema: SCHEMA });
      if (r2 && r2.title && Array.isArray(r2.items)) return r2;
    } catch {/* ignore */}
    return null;
  };

  const regenerate = async () => {
    setLoading(true);
    const r = await generate();
    if (r) {setData(r);localStorage.setItem(storageKey, JSON.stringify(r));}
    setLoading(false);
    onRefresh?.();
  };

  const editorRegen = async () => {
    setLoading(true);
    const r = await generate();
    setLoading(false);
    return r;
  };

  const save = (d) => {setData(d);localStorage.setItem(storageKey, JSON.stringify(d));setEditing(false);onRefresh?.();};

  return (
    <>
      {loading && !data ?
      <div className="space-y-3">
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
        </div> :
      data ?
      <EditorialLayout data={data} onRefresh={regenerate} onEdit={() => setEditing(true)} loading={loading} /> :
      null}
      <SpaceRecapEditor open={editing} data={data || fallback || { items: [] }} onClose={() => setEditing(false)} onSave={save} onRegenerate={editorRegen} />
    </>);

}