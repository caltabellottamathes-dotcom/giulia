import React from "react";
import { RefreshCw, ArrowRight } from "lucide-react";

const RIDGE = "hsl(var(--life-ridge))"; // Ridge Sky #b1bec6
const DEW = "hsl(var(--life-dew))";     // Morning Dew #cfd9dd

const TAB_LINKS = ["OVERVIEW", "PORTEFEUILLES", "LASTEN", "INKOMEN", "FORECAST", "HEALTHY_MONEY", "DOCUMENTEN"];

export const EDITORIAL_SCHEMA = {
  type: "object",
  properties: {
    eyebrow: { type: "string" },
    title: { type: "string" },
    subtitle: { type: "string" },
    body: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          sub: { type: "string" },
          link: { type: "string", enum: TAB_LINKS },
        },
        required: ["title", "sub"],
      },
    },
    rest: { type: "string" },
  },
  required: ["eyebrow", "title", "subtitle", "body", "items", "rest"],
};

/** FinanceEditorial — Giulia's gegenereerde editorial per tab. Stijl: zacht,
 *  rustig, alleen Ridge Sky + Morning Dew (geen blauw). Zwart op wit, dunne
 *  Ridge Sky lijnen, Morning Dew tint achter eyebrow + aandachtsblok. */
export default function FinanceEditorial({ data, loading, onRefresh, onNavigate }) {
  if (!data) {
    return (
      <div className="space-y-3 pt-5">
        <div className="h-4 w-1/2 rounded-full shimmer" />
        <div className="h-10 w-3/4 rounded-lg shimmer mt-2" />
        <div className="h-3 w-2/3 rounded shimmer mt-3" />
        <div className="h-4 w-full rounded shimmer mt-4" />
        <div className="h-4 w-5/6 rounded shimmer" />
        <div className="mt-8 space-y-4">
          <div className="h-16 rounded-2xl shimmer" />
          <div className="h-16 rounded-2xl shimmer" />
        </div>
      </div>
    );
  }
  const items = Array.isArray(data.items) ? data.items : [];
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="flex flex-col min-h-full">
      <section className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full px-3 py-1" style={{ background: DEW }}>
            <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground">{data.eyebrow}</p>
          </span>
          {onRefresh && (
            <button onClick={onRefresh} title="Giulia opnieuw laten schrijven" className="p-1 rounded-full hover:bg-foreground/5 transition" style={{ color: RIDGE }}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
        <h2 className="font-display text-[32px] sm:text-[36px] leading-[1.04] tracking-[-0.03em] text-foreground font-semibold mt-4 text-balance">{data.title}</h2>
        <p className="text-[12px] tracking-[0.04em] font-medium text-smoke mt-3">{data.subtitle}</p>
        <div className="h-px w-12 mt-5" style={{ background: RIDGE }} />
        <p className="font-body text-[14.5px] leading-[1.7] text-smoke text-balance mt-5">{data.body}</p>
      </section>

      <div className="flex-1 min-h-5" />

      {items.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[12px] uppercase tracking-[0.18em] font-bold text-foreground">What needs your attention</h3>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: RIDGE }}>{pad(items.length)} items</span>
          </div>
          <div className="mt-3 rounded-2xl p-1.5" style={{ background: DEW }}>
            <div className="rounded-xl bg-warm-white/85 backdrop-blur-sm overflow-hidden">
              {items.map((it, i) => {
                const nav = it.link && onNavigate;
                const Tag = nav ? "button" : "div";
                return (
                  <Tag key={i} {...(nav ? { onClick: () => onNavigate(it.link) } : {})} className={`flex items-start gap-4 px-4 py-4 w-full text-left ${i > 0 ? "border-t border-foreground/8" : ""} ${nav ? "hover:bg-foreground/[0.03] transition group cursor-pointer" : ""}`}>
                    <span className="font-display text-[22px] leading-none font-bold tabular-nums shrink-0 w-8" style={{ color: RIDGE }}>{pad(i + 1)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground leading-tight">{it.title}</p>
                      <p className="text-[12px] text-smoke leading-[1.55] mt-1">{it.sub}</p>
                    </div>
                    {nav && <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition" style={{ color: RIDGE }} />}
                  </Tag>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className={items.length > 0 ? "pt-6" : "pt-3"}>
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold" style={{ color: RIDGE }}>The rest can wait.</p>
        <p className="font-body text-[13px] leading-[1.6] text-smoke/85 mt-2">{data.rest}</p>
      </section>
    </div>
  );
}