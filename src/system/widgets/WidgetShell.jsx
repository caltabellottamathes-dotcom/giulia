import React, { useRef, useState, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { useWidgetTheme } from "@/lib/WidgetThemeContext";
import { useGlassSurface } from "@/lib/GlassSurfaceContext";

/**
 * WidgetShell — the designed tile hosting every dashboard widget.
 * Glass or a full palette color (Metal / Clay / Sand / Blue Ridge Sky / Storm),
 * with per-widget opacity + blur, a drop shadow for depth, and an accent strip.
 * Text color adapts per tile so widget internals (which use currentColor tints)
 * stay readable on every option — including the light Sky and Storm tiles.
 */
const sizeMap = {
  "1x1": "min-h-[124px]",
  "2x1": "min-h-[124px]",
  "1x2": "min-h-[176px]",
  "2x2": "min-h-[176px]",
  "3x2": "min-h-[176px]",
  wide: "min-h-[176px]",
  full: "min-h-[124px]",
};

const radiusMap = {
  soft: "rounded-[20px]",
  medium: "rounded-[24px]",
  large: "rounded-[28px]",
  xl: "rounded-[32px]",
};

const tileMap = {
  glass:    { text: "text-ivory",    accent: "hsl(var(--sand))",     on: "hsl(var(--ivory))",     token: null },
  charcoal: { text: "text-ivory",    accent: "hsl(var(--sand))",     on: "hsl(var(--ivory))",     token: "charcoal" },
  olive:    { text: "text-ivory",    accent: "hsl(var(--ivory))",    on: "hsl(var(--charcoal))",  token: "olive" },
  sand:     { text: "text-ivory",    accent: "hsl(var(--charcoal))", on: "hsl(var(--ivory))",     token: "sand" },
  ridge:    { text: "text-charcoal", accent: "hsl(var(--charcoal))", on: "hsl(var(--ivory))",    token: "ridge" },
  storm:    { text: "text-charcoal", accent: "hsl(var(--charcoal))", on: "hsl(var(--ivory))",    token: "storm" },
};

export default function WidgetShell({
  size = "1x1",
  radius = "medium",
  glass = "card",
  className,
  children,
  onClick,
  interactive = false,
  style,
  zIndex,
  domain = "",
}) {
  const ctx = useWidgetTheme();
  const surface = useGlassSurface();
  const shellRef = useRef(null);
  const [tone, setTone] = useState(() => (surface ? "dark" : "light"));
  const opacity = ctx.opacity != null ? ctx.opacity : 1;
  const blur = ctx.blur || 0;
  const resolved = ctx.theme === "solid" ? (ctx.color || "charcoal") : "glass";
  const tile = tileMap[resolved] || tileMap.glass;
  // Domein-gebaseerd accent voor glas-tegels — finale domein-kleuren (deep per domein)
  // LIFE-accent is licht (Ridge Sky) → donkere tekst voor contrast.
  const DOMAIN_GLASS = {
    giulia: { accent: "hsl(var(--d-giulia-deep))", on: "hsl(var(--ivory))" },
    focus: { accent: "hsl(var(--d-focus-deep))", on: "hsl(var(--ivory))" },
    life: { accent: "hsl(var(--d-life-deep))", on: "hsl(var(--charcoal))" },
    self: { accent: "hsl(var(--d-life-deep))", on: "hsl(var(--charcoal))" },
    system: { accent: "hsl(var(--d-system-deep))", on: "hsl(var(--ivory))" },
    now: { accent: "hsl(var(--d-giulia-deep))", on: "hsl(var(--ivory))" },
  };
  const effDomain = domain || ctx.domain;
  const isGlassTile = resolved === "glass";
  const domainEntry = isGlassTile && effDomain ? (DOMAIN_GLASS[effDomain] || null) : null;
  const tileAccent = domainEntry ? domainEntry.accent : tile.accent;
  const tileOnAccent = domainEntry ? domainEntry.on : tile.on;

  // Glas-tegel tekstkleur past zich aan de ondergrond aan (donkere foto → licht,
  // lichte achtergrond → donker) voor contrast. Enkel voor glas-tegels.
  useLayoutEffect(() => {
    if (!isGlassTile || !surface || !shellRef.current) return;
    const el = shellRef.current;
    let raf = 0;
    const compute = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        setTone(surface.getTone(rect.left + rect.width / 2, rect.top + rect.height / 2));
      });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [isGlassTile, surface]);

  const glassText = tone === "dark" ? "text-ivory" : "text-charcoal";
  const textClass = isGlassTile ? glassText : tile.text;

  const bg =
    resolved === "glass"
      ? {
          background: `rgba(48,50,55,${0.18 * opacity})`,
          backdropFilter: `blur(${22 + blur}px) saturate(1.35)`,
          WebkitBackdropFilter: `blur(${22 + blur}px) saturate(1.35)`,
        }
      : {
          background: `hsl(var(--${tile.token}) / ${opacity})`,
          ...(blur > 0
            ? { backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` }
            : {}),
        };

  return (
    <div
      ref={shellRef}
      onClick={onClick}
      style={{
        "--tile-accent": tileAccent,
        "--tile-on-accent": tileOnAccent,
        ...bg,
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.06), 0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.16)",
        ...style,
        zIndex,
      }}
      className={cn(
        "relative overflow-hidden flex flex-col h-full border border-white/12 ring-1 ring-inset ring-white/10",
        textClass,
        sizeMap[size] || sizeMap["1x1"],
        radiusMap[radius] || radiusMap.medium,
        interactive && "cursor-pointer transition-transform duration-500 hover:-translate-y-1",
        className
      )}
    >
      {/* editoriale accent-haarlijn — van accent naar transparant, subtieler dan een harde strip */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--tile-accent) 18%, var(--tile-accent) 82%, transparent)" }} />
      {/* zachte refractie-licht van linksboven voor glasdiepte */}
      <span className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(130% 90% at 0% 0%, rgba(255,255,255,0.10), transparent 46%)" }} />
      {children}
    </div>
  );
}