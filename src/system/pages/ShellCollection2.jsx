import React from "react";
import { Link } from "react-router-dom";
import { GlassPhotoLayeredWidget, PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
import { buildShellCode, iconFor, iconName } from "@/system/widgets/primitives/shellCode";

/** ShellCollection2 — gelaagde versie. Zelfde shells + cards als de flat
 *  collectie, maar de cards zweven over de shell-rand (straddlen de rand),
 *  4 afgeronde hoeken + schaduw naar de open kant. Zelfde productcodes. */

const PHOTOS = [
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg",
];
const WORD = { left: "links", right: "rechts", top: "boven", bottom: "onder" };
const NAMES = [
  "What Matters?", "A Lot Happening", "Your day in steps.", "In Rhythm",
  "Today's Pulse", "Quiet Briefing", "Open Agenda", "Deep Focus",
];

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

function Demo({ num, icon, code, name, sub }) {
  const bars = [42, 78, 55, 92, 60, 70];
  return (
    <>
      <WidgetHeader label={iconName(icon)} type={icon} count={`#${num}`} />
      <h3 className="text-[20px] leading-tight font-display font-semibold tracking-tight text-current">{name}</h3>
      <p className="font-mono text-[10px] tracking-wide opacity-60 mt-1">{code}</p>
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

export default function ShellCollection2() {
  let n = 0;
  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24 max-w-[1500px] mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/widgets-giulia" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">
          ← Widget-skelet
        </Link>
        <Link to="/shell-collection" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">
          ← Flat versie
        </Link>
      </div>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">Shell-collectie 2 · Gelaagd</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-2xl">
        Zelfde 2 basisopties, maar de cards zweven over de shell-rand — ze overlappen de shell. 4 afgeronde hoeken, flush op de korte as, schaduw naar de open kant. Genummerd 01–36.
      </p>

      <div className="mb-10 rounded-2xl border border-border bg-muted/40 p-4 text-[11px] leading-relaxed text-foreground/70">
        <span className="font-semibold text-foreground">Productcode:</span>{" "}
        Optie · Vorm · Plaats · Soort &nbsp;—&nbsp;
        <b>G</b> = GlassShell+PhotoCard, <b>P</b> = PhotoShell+GlassCard &nbsp;·&nbsp;
        Vorm: 16x9 / 9x16 / 1x1 / 4x3 / 3x4 / 21x9 / 3x2 / 2x3 / 4x5 &nbsp;·&nbsp;
        Plaats: L / R / T / B &nbsp;·&nbsp; Soort: SIDE / STRIP
        <br />
        <span className="text-foreground/50">Voorbeeld: <span className="font-mono">G·16x9·L·SIDE</span> = Optie 1, 16:9, links, gelaagd. Noem een code en ik maak hem direct.</span>
      </div>

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
                  const code = buildShellCode({ opt: v.opt, shape: s.id, pos: v.pos, strip: v.strip });
                  const icon = iconFor(n - 1);
                  const name = NAMES[(n - 1) % NAMES.length];
                  const Widget = v.opt === 1 ? GlassPhotoLayeredWidget : PhotoGlassLayeredWidget;
                  const overhang = v.strip ? 0.08 : 0.1;
                  const cap = `#${num} · ${code} · ${WORD[v.pos]}${v.strip ? " · strip" : ""}`;
                  return (
                    <figure key={num} className="space-y-2" style={{ width: s.w }}>
                      <Widget
                        shape={s.id}
                        photo={photo}
                        photoPosition={v.pos}
                        glassPosition={v.pos}
                        photoFraction={v.frac}
                        glassFraction={v.frac}
                        overhang={overhang}
                        domain="giulia"
                      >
                        <Demo num={num} icon={icon} code={code} name={name} sub={`${s.id} · ${WORD[v.pos]}`} />
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