import React from "react";
import { Link } from "react-router-dom";
import { GlassPhotoWidget, PhotoGlassWidget, WidgetHeader } from "@/system/widgets/primitives";

/** ShellCollection — de twee basis-composities (GlassShell+PhotoCard &
 *  PhotoShell+GlassCard) in alle vormen, alle plaatsingen, en als strips.
 *  Kaarten staan flush tegen de shell-rand. Elke variant genummerd (01–N). */

const PHOTOS = [
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg",
];
const WORD = { left: "links", right: "rechts", top: "boven", bottom: "onder" };
const TITLES = ["What Matters?", "A Lot Happening", "Your day in steps.", "In Rhythm"];

const SHAPES = [
  { id: "21:9", orient: "Breed", w: 660, variants: [
    { opt: 1, pos: "left",   frac: 0.40 },
    { opt: 1, pos: "top",    frac: 0.30, strip: true },
    { opt: 2, pos: "right",  frac: 0.40 },
    { opt: 2, pos: "bottom", frac: 0.30, strip: true },
  ]},
  { id: "16:9", orient: "Horizontaal", w: 520, variants: [
    { opt: 1, pos: "left",   frac: 0.42 },
    { opt: 1, pos: "top",    frac: 0.30, strip: true },
    { opt: 2, pos: "right",  frac: 0.42 },
    { opt: 2, pos: "bottom", frac: 0.30, strip: true },
  ]},
  { id: "3:2", orient: "Horizontaal", w: 460, variants: [
    { opt: 1, pos: "left",   frac: 0.44 },
    { opt: 1, pos: "bottom", frac: 0.32, strip: true },
    { opt: 2, pos: "right",  frac: 0.44 },
    { opt: 2, pos: "top",    frac: 0.32, strip: true },
  ]},
  { id: "4:3", orient: "Horizontaal", w: 400, variants: [
    { opt: 1, pos: "left",   frac: 0.46 },
    { opt: 1, pos: "top",    frac: 0.32, strip: true },
    { opt: 2, pos: "right",  frac: 0.46 },
    { opt: 2, pos: "bottom", frac: 0.32, strip: true },
  ]},
  { id: "1:1", orient: "Vierkant", w: 340, variants: [
    { opt: 1, pos: "left",   frac: 0.46 },
    { opt: 1, pos: "top",    frac: 0.34, strip: true },
    { opt: 2, pos: "right",  frac: 0.46 },
    { opt: 2, pos: "bottom", frac: 0.34, strip: true },
  ]},
  { id: "4:5", orient: "Verticaal", w: 320, variants: [
    { opt: 1, pos: "top",    frac: 0.46 },
    { opt: 1, pos: "left",   frac: 0.30, strip: true },
    { opt: 2, pos: "bottom", frac: 0.46 },
    { opt: 2, pos: "right",  frac: 0.30, strip: true },
  ]},
  { id: "3:4", orient: "Verticaal", w: 300, variants: [
    { opt: 1, pos: "top",    frac: 0.46 },
    { opt: 1, pos: "left",   frac: 0.30, strip: true },
    { opt: 2, pos: "bottom", frac: 0.46 },
    { opt: 2, pos: "right",  frac: 0.30, strip: true },
  ]},
  { id: "2:3", orient: "Verticaal", w: 284, variants: [
    { opt: 1, pos: "top",    frac: 0.46 },
    { opt: 1, pos: "right",  frac: 0.28, strip: true },
    { opt: 2, pos: "bottom", frac: 0.46 },
    { opt: 2, pos: "left",   frac: 0.28, strip: true },
  ]},
  { id: "9:16", orient: "Verticaal", w: 268, variants: [
    { opt: 1, pos: "top",    frac: 0.46 },
    { opt: 1, pos: "left",   frac: 0.28, strip: true },
    { opt: 2, pos: "bottom", frac: 0.46 },
    { opt: 2, pos: "right",  frac: 0.28, strip: true },
  ]},
];

function Demo({ label, title, sub, count, type }) {
  const bars = [42, 78, 55, 92, 60, 70];
  return (
    <>
      <WidgetHeader label={label} type={type} count={count} />
      <h3 className="text-[20px] leading-tight font-display font-semibold tracking-tight text-current">{title}</h3>
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
  let n = 0;
  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24 max-w-[1500px] mx-auto">
      <Link to="/widgets-giulia" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">
        ← Terug naar widget-skelet
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">Shell-collectie · 2 basisopties</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-10 max-w-2xl">
        Optie 1 — GlassShell + PhotoCard. Optie 2 — PhotoShell + GlassCard. Kaarten flush tegen de shell-rand.
        Horizontale shells ook als lange horizontale strips; verticale shells ook als smalle verticale strips. Genummerd 01–36.
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
              <div className="flex flex-wrap gap-6 items-start">
                {s.variants.map((v) => {
                  n += 1;
                  const num = String(n).padStart(2, "0");
                  const title = TITLES[(n - 1) % TITLES.length];
                  const type = v.opt === 1 ? "tasks" : "pulse";
                  const Widget = v.opt === 1 ? GlassPhotoWidget : PhotoGlassWidget;
                  const cap = `${num} · Optie ${v.opt} · ${WORD[v.pos]}${v.strip ? " · strip" : ""}`;
                  return (
                    <figure key={num} className="space-y-2" style={{ width: s.w }}>
                      <Widget
                        shape={s.id}
                        photo={photo}
                        photoPosition={v.pos}
                        glassPosition={v.pos}
                        photoFraction={v.frac}
                        glassFraction={v.frac}
                        domain="giulia"
                      >
                        <Demo label={`Optie ${v.opt}`} title={title} sub={`${s.id} · ${WORD[v.pos]}`} count={v.strip ? "strip" : "side"} type={type} />
                      </Widget>
                      <figcaption className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">{cap}</figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}