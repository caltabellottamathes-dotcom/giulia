import React from "react";
import { RefreshCw, ArrowDown, ArrowRight } from "lucide-react";

export const STALE_MS = 8 * 60 * 60 * 1000; // 8 uur

const TAB_LINKS = ["OVERVIEW", "PORTEFEUILLES", "LASTEN", "INKOMEN", "FORECAST", "HEALTHY_MONEY", "DOCUMENTEN"];

export const EDITORIAL_SCHEMA = {
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
  required: ["eyebrow", "title", "subtitle", "body", "footerLeft", "footerRight", "items", "restTitle", "restBody"],
};

const pad = (n) => String(n).padStart(2, "0");
const RIDGE = "hsl(var(--life-ridge))"; // Ridge Sky — zachte accent
const PISTACHIO = "hsl(var(--life-pistachio))"; // Whipped Pistachio — cijfers/elementen

/** EditorialLayout — Giulia's gegenereerde analyse (niet bewerkbaar).
 *  Accenten: Ridge Sky (zacht, voor de grote cijfers) + Ridge Deep (donkerder
 *  blauw, leesbaar voor de small-caps labels). Referentie-ontwerp: zwarte kop,
 *  dunne zwarte pijl, genummerde aandachtslijst, klikbare items. */
export function EditorialLayout({ data, onRefresh, onNavigate, accent = "hsl(var(--ridge-deep))", loading }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const rawTitle = (data?.title || "").toUpperCase();
  const title = rawTitle.endsWith(".") ? rawTitle : `${rawTitle}.`;
  return (
    <div className="flex flex-col min-h-full">
      <section className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: PISTACHIO }} />
            <p className="text-[10px] uppercase tracking-[0.28em] font-semibold" style={{ color: accent }}>{data.eyebrow}</p>
          </div>
          {onRefresh && (
            <button onClick={onRefresh} title="GIULIA opnieuw genereren" className="p-1 rounded-full hover:bg-foreground/5 transition" style={{ color: accent }}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
        <div className="flex items-start justify-between gap-4 mt-3">
          <h2 className="font-display text-[30px] sm:text-[38px] leading-[0.98] tracking-[-0.03em] text-foreground font-semibold uppercase">{title}</h2>
          <ArrowDown className="w-5 h-5 shrink-0 mt-2" strokeWidth={1.25} style={{ color: PISTACHIO }} />
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mt-3" style={{ color: accent }}>{data.subtitle}</p>
        <p className="font-body text-[14px] leading-[1.7] text-smoke text-balance mt-5">{data.body}</p>
      </section>

      <div className="mt-6 pt-3 border-t border-foreground/15 flex items-center justify-between">
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: accent }}>{data.footerLeft || "GIULIA · EDITORIAL ANALYSE"}</p>
        <p className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: accent }}>{data.footerRight || "AUTO · GIULIA"}</p>
      </div>

      <div className="flex-1 min-h-5" />

      {items.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[14px] uppercase tracking-[0.14em] font-bold text-foreground">{data.attentionTitle || "WHAT NEEDS YOUR ATTENTION"}</h3>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold shrink-0" style={{ color: accent }}>{data.attentionBadge || `${pad(items.length)} ITEMS NEED ACTION`}</span>
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
                  <span className="font-display text-[26px] leading-none font-bold tabular-nums shrink-0 w-9" style={{ color: PISTACHIO }}>{pad(i + 1)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-foreground leading-tight">{it.title}</p>
                    <p className="text-[12px] text-muted-foreground leading-[1.55] mt-1.5">{it.sub}</p>
                  </div>
                  {nav && <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition" style={{ color: accent }} />}
                </Tag>
              );
            })}
          </div>
        </section>
      )}

      <section className={items.length > 0 ? "pt-6" : "pt-3"}>
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold" style={{ color: accent }}>{data.restTitle}</p>
        <p className="font-body text-[13px] leading-[1.6] text-smoke/80 mt-2">{data.restBody}</p>
      </section>
    </div>
  );
}

/** SpaceRecap — presentational (niet bewerkbaar). Parent pre-warmt alle tabs. */
export default function SpaceRecap({ data, loading, onRefresh, onNavigate, accent }) {
  if (loading && !data) {
    return (
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
    );
  }
  if (!data) return null;
  return <EditorialLayout data={data} onRefresh={onRefresh} onNavigate={onNavigate} accent={accent} loading={loading} />;
}