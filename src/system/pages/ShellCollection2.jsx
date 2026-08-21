import React from "react";
import { Link } from "react-router-dom";
import {
  GlassPhotoLayeredWidget,
  PhotoGlassLayeredWidget,
  GlassPhotoBehindWidget,
  WidgetHeader,
} from "@/system/widgets/primitives";
import { buildShellCode, buildShellBehindCode, iconFor, iconName } from "@/system/widgets/primitives/shellCode";

/** ShellCollection2 — gelaagd. Cards zweven over/achter de shell-rand.
 *  Elke widget zit in een ruime cel (PAD) zodat overhangende cards elkaar
 *  niet raken. Maten ≈ dashboard-realistisch. Genummerd 01–44. */

const PHOTOS = [
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/ad59aa090_Whatmatters_GIULIA.jpeg",
  "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/1d4c3eef3_GiuliaConcierge.jpeg",
];
const WORD = { left: "links", right: "rechts", top: "boven", bottom: "onder" };
const NAMES = [
  "What Matters?", "A Lot Happening", "Your day in steps.", "In Rhythm",
  "Today's Pulse", "Quiet Briefing", "Open Agenda", "Deep Focus",
];
const PAD = 44;
const OVERHANG = 0.08;

const SHAPES = [
  { id: "21:9", orient: "Breed", w: 440, variants: [
    { opt: 1, pos: "left",   frac: 0.40 },
    { opt: 1, pos: "top",    frac: 0.30, strip: true },
    { opt: 2, pos: "right",  frac: 0.40 },
    { opt: 2, pos: "bottom", frac: 0.30, strip: true },
  ]},
  { id: "16:9", orient: "Horizontaal", w: 380, variants: [
    { opt: 1, pos: "left",   frac: 0.42 },
    { opt: 1, pos: "top",    frac: 0.30, strip: true },
    { opt: 2, pos: "right",  frac: 0.42 },
    { opt: 2, pos: "bottom", frac: 0.30, strip: true },
  ]},
  { id: "3:2", orient: "Horizontaal", w: 350, variants: [
    { opt: 1, pos: "left",   frac: 0.44 },
    { opt: 1, pos: "bottom", frac: 0.32, strip: true },
    { opt: 2, pos: "right",  frac: 0.44 },
    { opt: 2, pos: "top",    frac: 0.32, strip: true },
  ]},
  { id: "4:3", orient: "Horizontaal", w: 320, variants: [
    { opt: 1, pos: "left",   frac: 0.46 },
    { opt: 1, pos: "top",    frac: 0.32, strip: true },
    { opt: 2, pos: "right",  frac: 0.46 },
    { opt: 2, pos: "bottom", frac: 0.32, strip: true },
  ]},
  { id: "1:1", orient: "Vierkant", w: 300, variants: [
    { opt: 1, pos: "left",   frac: 0.46 },
    { opt: 1, pos: "top",    frac: 0.34, strip: true },
    { opt: 2, pos: "right",  frac: 0.46 },
    { opt: 2, pos: "bottom", frac: 0.34, strip: true },
  ]},
  { id: "4:5", orient: "Verticaal", w: 280, variants: [
    { opt: 1, pos: "top",    frac: 0.46 },
    { opt: 1, pos: "left",   frac: 0.30, strip: true },
    { opt: 2, pos: "bottom", frac: 0.46 },
    { opt: 2, pos: "right",  frac: 0.30, strip: true },
  ]},
  { id: "3:4", orient: "Verticaal", w: 280, variants: [
    { opt: 1, pos: "top",    frac: 0.46 },
    { opt: 1, pos: "left",   frac: 0.30, strip: true },
    { opt: 2, pos: "bottom", frac: 0.46 },
    { opt: 2, pos: "right",  frac: 0.30, strip: true },
  ]},
  { id: "2:3", orient: "Verticaal", w: 260, variants: [
    { opt: 1, pos: "top",    frac: 0.46 },
    { opt: 1, pos: "right",  frac: 0.28, strip: true },
    { opt: 2, pos: "bottom", frac: 0.46 },
    { opt: 2, pos: "left",   frac: 0.28, strip: true },
  ]},
  { id: "9:16", orient: "Verticaal", w: 250, variants: [
    { opt: 1, pos: "top",    frac: 0.46 },
    { opt: 1, pos: "left",   frac: 0.28, strip: true },
    { opt: 2, pos: "bottom", frac: 0.46 },
    { opt: 2, pos: "right",  frac: 0.28, strip: true },
  ]},
];

const BEHIND = [
  { shape: "16:9", peek: "tl" }, { shape: "16:9", peek: "br" },
  { shape: "4:3",  peek: "tr" }, { shape: "4:3",  peek: "bl" },
  { shape: "1:1",  peek: "tl" }, { shape: "1:1",  peek: "br" },
  { shape: "9:16", peek: "t" },  { shape: "9:16", peek: "b" },
];
const BEHIND_W = { "16:9": 380, "4:3": 320, "1:1": 300, "9:16": 250 };

function Demo({ num, icon, code, name }) {
  const bars = [42, 78, 55, 92, 60, 70];
  return (
    <>
      <WidgetHeader label={iconName(icon)} type={icon} count={`#${num}`} />
      <h3 className="text-[16px] leading-tight font-display font-semibold tracking-tight text-current">{name}</h3>
      <p className="font-mono text-[9px] tracking-wide opacity-60 mt-1">{code}</p>
      <div className="flex-1 min-h-2" />
      <div className="flex items-end gap-1.5 h-9">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-full" style={{ height: `${h}%`, background: "var(--tile-accent)", opacity: i % 2 ? 0.5 : 1 }} />
        ))}
      </div>
    </>
  );
}

function Cell({ w, cap, children }) {
  return (
    <figure className="shrink-0" style={{ width: w + PAD * 2 }}>
      <div style={{ padding: PAD }}>{children}</div>
      <figcaption className="text-[10px] uppercase tracking-[0.24em] text-foreground/45" style={{ paddingLeft: PAD, paddingRight: PAD }}>{cap}</figcaption>
    </figure>
  );
}

export default function ShellCollection2() {
  let n = 0;
  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-28 max-w-[1500px] mx-auto">
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
        Cards zweven over de shell-rand (of erachter). 4 afgeronde hoeken, flush op de korte as, schaduw naar de open kant.
        Elke widget zit in een ruime cel, maten ≈ dashboard-realistisch. Genummerd 01–44.
      </p>

      <div className="mb-10 rounded-2xl border border-border bg-muted/40 p-4 text-[11px] leading-relaxed text-foreground/70">
        <span className="font-semibold text-foreground">Productcode:</span>{" "}
        Optie · Vorm · Plaats · Soort &nbsp;—&nbsp;
        <b>G</b> = GlassShell+PhotoCard, <b>P</b> = PhotoShell+GlassCard &nbsp;·&nbsp;
        Vorm: 16x9 / 9x16 / 1x1 / 4x3 / 3x4 / 21x9 / 3x2 / 2x3 / 4x5 &nbsp;·&nbsp;
        Plaats: L / R / T / B &nbsp;·&nbsp; Soort: SIDE / STRIP / BEHIND (peek: TL/TR/BL/BR/T/B)
        <br />
        <span className="text-foreground/50">Voorbeeld: <span className="font-mono">P·9x16·B·STRIP</span> of <span className="font-mono">G·16x9·TL·BEHIND</span>. Noem een code en ik maak hem direct.</span>
      </div>

      <div className="space-y-14">
        {SHAPES.map((s, si) => {
          const photo = PHOTOS[si % PHOTOS.length];
          return (
            <section key={s.id} className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h2 className="text-lg font-display font-semibold tracking-tight">{s.id}</h2>
                <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">{s.orient}</span>
              </div>
              <div className="flex flex-wrap gap-2 items-start">
                {s.variants.map((v) => {
                  n += 1;
                  const num = String(n).padStart(2, "0");
                  const code = buildShellCode({ opt: v.opt, shape: s.id, pos: v.pos, strip: v.strip });
                  const icon = iconFor(n - 1);
                  const name = NAMES[(n - 1) % NAMES.length];
                  const Widget = v.opt === 1 ? GlassPhotoLayeredWidget : PhotoGlassLayeredWidget;
                  const cap = `#${num} · ${code} · ${WORD[v.pos]}${v.strip ? " · strip" : ""}`;
                  return (
                    <Cell key={num} w={s.w} cap={cap}>
                      <Widget
                        shape={s.id}
                        photo={photo}
                        photoPosition={v.pos}
                        glassPosition={v.pos}
                        photoFraction={v.frac}
                        glassFraction={v.frac}
                        overhang={OVERHANG}
                        domain="giulia"
                      >
                        <Demo num={num} icon={icon} code={code} name={name} />
                      </Widget>
                    </Cell>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* PhotoCard erachter (verschoven achter de GlassShell) */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-display font-semibold tracking-tight">Achter de shell</h2>
            <span className="text-[10px] uppercase tracking-[0.24em] text-foreground/45">PhotoCard erachter · G·Vorm·Peek·BEHIND</span>
          </div>
          <div className="flex flex-wrap gap-2 items-start">
            {BEHIND.map((b, bi) => {
              n += 1;
              const num = String(n).padStart(2, "0");
              const code = buildShellBehindCode({ shape: b.shape, peek: b.peek });
              const icon = iconFor(n - 1);
              const name = NAMES[(n - 1) % NAMES.length];
              const photo = PHOTOS[bi % PHOTOS.length];
              const w = BEHIND_W[b.shape];
              const cap = `#${num} · ${code} · ${b.peek}`;
              return (
                <Cell key={num} w={w} cap={cap}>
                  <GlassPhotoBehindWidget shape={b.shape} photo={photo} peek={b.peek} peekAmount={0.09} domain="giulia">
                    <Demo num={num} icon={icon} code={code} name={name} />
                  </GlassPhotoBehindWidget>
                </Cell>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}