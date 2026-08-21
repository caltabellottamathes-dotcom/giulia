import React from "react";
import { Link } from "react-router-dom";
import { GlassPhotoWidget, PhotoGlassWidget, WidgetHeader } from "@/system/widgets/primitives";

/** ShellCollection — de twee basis-composities (GlassShell+PhotoCard &
 *  PhotoShell+GlassCard) in alle vormen (1:1 / 4:3 / 3:4 / 16:9 / 9:16) en
 *  alle plaatsingen (links/rechts/boven/onder). */

const PHOTOS = [
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg",
];

const WORD = { left: "links", right: "rechts", top: "boven", bottom: "onder" };

const SHAPES = [
  { id: "16:9", orient: "Horizontaal", o1: ["left", "right"], o2: ["left", "right"], w: 480 },
  { id: "9:16", orient: "Verticaal",   o1: ["top", "bottom"],  o2: ["top", "bottom"],  w: 280 },
  { id: "4:3",  orient: "Horizontaal", o1: ["left", "right"], o2: ["left", "right"], w: 380 },
  { id: "3:4",  orient: "Verticaal",   o1: ["top", "bottom"],  o2: ["top", "bottom"],  w: 320 },
  { id: "1:1",  orient: "Vierkant",    o1: ["left", "top"],    o2: ["left", "top"],   w: 340 },
];

function Demo({ label, title, sub, count, type = "tasks" }) {
  const bars = [42, 78, 55, 92, 60, 70];
  return (
    <>
      <WidgetHeader label={label} type={type} count={count} />
      <h3 className="text-[18px] leading-tight font-display font-semibold tracking-tight mt-1 text-current">{title}</h3>
      {sub && <p className="text-[10px] uppercase tracking-[0.18em] opacity-50 mt-1.5">{sub}</p>}
      <div className="flex-1" />
      <div className="flex items-end gap-1.5 h-10">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-full" style={{ height: `${h}%`, background: "var(--tile-accent)", opacity: i % 2 ? 0.5 : 1 }} />
        ))}
      </div>
    </>
  );
}

export default function ShellCollection() {
  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24 max-w-[1400px] mx-auto">
      <Link to="/widgets-giulia" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">
        ← Terug naar widget-skelet
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">Shell-collectie · 2 basisopties</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-10">
        Optie 1 — GlassShell + PhotoCard. Optie 2 — PhotoShell + GlassCard. Alle vormen, alle plaatsingen.
      </p>

      <div className="space-y-12">
        {SHAPES.map((s, si) => {
          const photo = PHOTOS[si % PHOTOS.length];
          return (
            <section key={s.id} className="space-y-4">
              <div className="flex items-baseline gap-3">
                <h2 className="text-lg font-display font-semibold tracking-tight">{s.id}</h2>
                <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">{s.orient}</span>
              </div>
              <div className="flex flex-wrap gap-6">
                {s.o1.map((pos) => (
                  <figure key={`o1-${pos}`} className="space-y-2" style={{ width: s.w }}>
                    <GlassPhotoWidget shape={s.id} photo={photo} photoPosition={pos} domain="giulia">
                      <Demo label="GlassShell + PhotoCard" title="Your day in steps." sub={`${s.id} · ${WORD[pos]}`} count="3/6" />
                    </GlassPhotoWidget>
                    <figcaption className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">Optie 1 · {WORD[pos]}</figcaption>
                  </figure>
                ))}
                {s.o2.map((pos) => (
                  <figure key={`o2-${pos}`} className="space-y-2" style={{ width: s.w }}>
                    <PhotoGlassWidget shape={s.id} photo={photo} glassPosition={pos} domain="giulia">
                      <Demo label="PhotoShell + GlassCard" title="Your day in steps." sub={`${s.id} · ${WORD[pos]}`} count="3/6" />
                    </PhotoGlassWidget>
                    <figcaption className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">Optie 2 · {WORD[pos]}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}