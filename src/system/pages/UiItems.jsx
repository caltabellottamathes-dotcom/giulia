import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { A, useCountUp, useLiveSeries } from "@/system/widgets/graph/graphData";
import { Sparkline, MiniBars, pts, linePath, areaPath } from "@/system/widgets/graph/viz";
import {
  Orbit, Constellation, RadialSpokes, FlowTrack, Ripple, Wave, ECG, Radar, Spiral,
  DotLattice, Donut, HexTiles, KineticText, Swatch,
} from "@/system/widgets/graph/shapes";

/* ── /UI-items — bibliotheek van alle losse elementen uit de SELF-widgets ──
   Elke tile is één genummerd bouwsteenelement. Combineer ze later:
   "maak een widget uit #03 + #12 + foto #02" en Giulia voegt ze samen. */

const PHOTOS = [
  { id: "1500530855697-b586d89ba3ee", label: "ochtend · berg" },
  { id: "1519681393784-d120267933ba", label: "nacht · sterren" },
  { id: "1500964757637-c85e8a162699", label: "bos · mist" },
  { id: "1470770841072-f978cf4d019e", label: "meer · dageraad" },
];
const photo = (id) => `https://images.unsplash.com/photo-${id}?w=400&q=70`;

function Num({ n }) {
  return (
    <span className="absolute right-2 top-2 z-20 h-6 min-w-[24px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold tabular-nums pointer-events-none select-none"
      style={{ background: "rgba(38,40,44,0.72)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)" }}>{n}</span>
  );
}

function Item({ n, name, hint, children, className = "" }) {
  return (
    <div className={`relative rounded-2xl border border-foreground/10 bg-card/50 p-3 flex flex-col gap-2 min-h-[150px] ${className}`}>
      <Num n={n} />
      <div className="flex-1 flex items-center justify-center min-h-0">{children}</div>
      <div className="leading-tight">
        <p className="text-[11px] font-semibold text-foreground/85 truncate">{name}</p>
        {hint && <p className="text-[9px] text-foreground/45 font-mono truncate">{hint}</p>}
      </div>
    </div>
  );
}

function Section({ n, title, sub }) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-display font-semibold tabular-nums leading-none" style={{ color: A.olive }}>{n}</span>
        <div>
          <h2 className="text-lg font-display font-semibold tracking-tight leading-none">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </div>
      </div>
    </div>
  );
}

const GLASSES = [
  { c: "glass", t: "glas" }, { c: "glass-1", t: "glas-1" }, { c: "glass-2", t: "glas-2" },
  { c: "glass-3", t: "glas-3" }, { c: "glass-4", t: "glas-4" }, { c: "glass-card", t: "glas-card" },
  { c: "glass-card-2", t: "glas-card-2" }, { c: "glass-dark", t: "glas-donker" }, { c: "refraction-panel", t: "refractie" },
];
const RATIOS = ["aspect-square", "aspect-[4/3]", "aspect-[3/4]", "aspect-[16/9]", "aspect-[16/10]", "aspect-[9/16]", "aspect-[4/5]"];

const PALETTE = [
  { v: A.olive, l: "olive" }, { v: A.ridge, l: "ridge" }, { v: A.sand, l: "sand" },
  { v: A.urgent, l: "urgent" }, { v: A.smoke, l: "smoke" }, { v: A.ink, l: "ink" },
  { v: "hsl(var(--self-burgundy))", l: "burgundy" }, { v: "hsl(var(--d-focus-deep))", l: "plum" },
  { v: "hsl(var(--d-giulia-deep))", l: "earth" }, { v: "hsl(var(--self-accent))", l: "sage" },
];

function SpinRing() {
  return <motion.div className="h-12 w-12 rounded-full border-4 border-transparent" style={{ borderTopColor: A.olive, borderRightColor: A.olive }} animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} />;
}
function BounceDot() {
  return <motion.div className="h-5 w-5 rounded-full" style={{ background: A.olive }} animate={{ y: [0, -24, 0], scaleY: [1, 0.8, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />;
}
function PulseDot() {
  return <motion.div className="h-10 w-10 rounded-full" style={{ background: A.urgent }} animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />;
}
function LiveLine() {
  const data = useLiveSeries(32, { min: 20, max: 80, vol: 10, ms: 900 });
  const p = pts(data.map((d) => d.v), 160, 56, 3);
  return (
    <svg width="100%" height={56} viewBox="0 0 160 56" preserveAspectRatio="none">
      <path d={areaPath(p, 56)} fill={A.olive} opacity={0.16} />
      <path d={linePath(p)} fill="none" stroke={A.olive} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={p[p.length - 1].x} cy={p[p.length - 1].y} r={3.5} fill={A.olive} />
    </svg>
  );
}
function BigNumber() {
  const v = useCountUp(1284, 1500);
  return <span className="text-4xl font-display font-semibold tabular-nums" style={{ color: A.olive }}>{Math.round(v)}</span>;
}
function MiniRing() {
  const [p, setP] = useState(0);
  useEffect(() => { const id = setInterval(() => setP((x) => (x >= 100 ? 0 : x + 4)), 60); return () => clearInterval(id); }, []);
  const r = 34, c = 2 * Math.PI * r, off = c * (1 - p / 100);
  return (
    <svg width={84} height={84} viewBox="0 0 84 84">
      <circle cx={42} cy={42} r={r} fill="none" stroke="hsl(var(--foreground)/0.1)" strokeWidth={8} />
      <motion.circle cx={42} cy={42} r={r} fill="none" stroke={A.olive} strokeWidth={8} strokeLinecap="round" strokeDasharray={c}
        animate={{ strokeDashoffset: off }} transform="rotate(-90 42 42)" />
    </svg>
  );
}

const SP = [10, 24, 16, 30, 22, 28, 18, 34, 20, 26];
const BARS = [4, 8, 6, 11, 7, 9, 5, 10];

let C = 0;
const N = () => ++C;

export default function UiItems() {
  C = 0;
  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24">
      <div className="mb-8">
        <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">← Terug naar OS</Link>
        <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">UI-items · Bibliotheek</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">Alle losse bouwstenen uit de SELF-widgets, genummerd. Glaskaarten, foto's, grafische vormen, animaties, typografie en kleuren — afzonderlijk. Straks: "maak een widget uit #03 + #12 + foto #02" en Giulia combineert ze.</p>
      </div>

      <Section n="01" title="GLAS KAARTEN" sub="Lege glazen containers — verschillende materiaalvarianten en verhoudingen." />
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-12">
        {GLASSES.map((g) => (
          <Item key={g.c} n={N()} name={g.t} hint={`.${g.c}`}>
            <div className={`w-full aspect-square rounded-2xl ${g.c} flex items-center justify-center`}>
              <span className="text-[10px] uppercase tracking-wider text-foreground/40">{g.t}</span>
            </div>
          </Item>
        ))}
        {RATIOS.map((r) => (
          <Item key={r} n={N()} name={r.replace("aspect-", "").replace("[", " ").replace("]", "")} hint={r} className="sm:col-span-1">
            <div className={`w-full ${r} rounded-xl glass-card`} />
          </Item>
        ))}
      </div>

      <Section n="02" title="FOTO'S" sub="Editoriale achtergrondbeelden (Unsplash) — als full-bleed of ingekaderde laag." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        {PHOTOS.map((p) => (
          <Item key={p.id} n={N()} name={p.label} hint={p.id}>
            <img src={photo(p.id)} alt={p.label} className="w-full h-24 object-cover rounded-xl" loading="lazy" />
          </Item>
        ))}
      </div>

      <Section n="03" title="GRAFISCHE VORMEN" sub="Geanimeerde SVG-vormen uit shapes.jsx — netwerken, ringen, golven, roosters." />
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-12">
        <Item n={N()} name="Orbit" hint="<Orbit/>"><Orbit size={120} /></Item>
        <Item n={N()} name="Constellation" hint="<Constellation/>">
          <Constellation nodes={[{ x: 30, y: 30, r: 4 }, { x: 90, y: 36, r: 4 }, { x: 60, y: 80, r: 5 }, { x: 22, y: 90, r: 3 }]} links={[[0, 1], [0, 2], [1, 2], [2, 3]]} size={130} />
        </Item>
        <Item n={N()} name="Radial Spokes" hint="<RadialSpokes/>"><RadialSpokes size={120} /></Item>
        <Item n={N()} name="Flow Track" hint="<FlowTrack/>"><FlowTrack w={130} h={40} /></Item>
        <Item n={N()} name="Ripple" hint="<Ripple/>"><Ripple size={120} /></Item>
        <Item n={N()} name="Wave" hint="<Wave/>"><Wave w={130} h={50} /></Item>
        <Item n={N()} name="ECG" hint="<ECG/>"><ECG w={130} h={50} /></Item>
        <Item n={N()} name="Radar" hint="<Radar/>"><Radar size={120} /></Item>
        <Item n={N()} name="Spiral" hint="<Spiral/>"><Spiral size={120} /></Item>
        <Item n={N()} name="Dot Lattice" hint="<DotLattice/>"><DotLattice size={120} /></Item>
        <Item n={N()} name="Donut" hint="<Donut/>"><Donut size={120} /></Item>
        <Item n={N()} name="Hex Tiles" hint="<HexTiles/>"><HexTiles size={120} /></Item>
      </div>

      <Section n="04" title="DATA VORMEN" sub="Sparklines, balken, ringen en live lijnen — data als grafiek." />
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-12">
        <Item n={N()} name="Sparkline" hint="<Sparkline/>"><Sparkline data={SP} w={140} h={48} /></Item>
        <Item n={N()} name="Mini Bars" hint="<MiniBars/>"><MiniBars data={BARS} w={150} h={56} /></Item>
        <Item n={N()} name="Progress Ring" hint="MiniRing"><MiniRing /></Item>
        <Item n={N()} name="Donut (segmenten)" hint="<Donut/>"><Donut size={120} /></Item>
        <Item n={N()} name="Live Line" hint="useLiveSeries"><LiveLine /></Item>
      </div>

      <Section n="05" title="ANIMATIES" sub="Bewegingspatronen — framer-motion en CSS-keyframes." />
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-12">
        <Item n={N()} name="Spin Ring" hint="rotate 360"><SpinRing /></Item>
        <Item n={N()} name="Bounce Dot" hint="y bounce"><BounceDot /></Item>
        <Item n={N()} name="Pulse Dot" hint="scale pulse"><PulseDot /></Item>
        <Item n={N()} name="Float Slow" hint="animate-float-slow">
          <div className="h-12 w-12 rounded-full glass-card animate-float-slow" />
        </Item>
        <Item n={N()} name="Pulse Soft" hint="animate-pulse-soft">
          <div className="h-10 w-10 rounded-full bg-olive/70 animate-pulse-soft" />
        </Item>
        <Item n={N()} name="Shimmer" hint="shimmer">
          <div className="h-10 w-full rounded-xl shimmer" />
        </Item>
        <Item n={N()} name="Fade Up" hint="animate-fade-up">
          <div className="h-12 w-20 rounded-xl glass-card animate-fade-up" />
        </Item>
        <Item n={N()} name="Scale In" hint="animate-scale-in">
          <div className="h-12 w-20 rounded-xl glass-card animate-scale-in" />
        </Item>
        <Item n={N()} name="Ripple" hint="<Ripple/>"><Ripple size={120} /></Item>
        <Item n={N()} name="Flow Track" hint="<FlowTrack/>"><FlowTrack w={130} h={40} /></Item>
      </div>

      <Section n="06" title="TYPOGRAFIE" sub="Lettertypes, gewicht, grootte en kinetische tekst." />
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-12">
        <Item n={N()} name="Display · Space Grotesk" hint="font-display"><span className="text-2xl font-display font-semibold">Aa Gg 24</span></Item>
        <Item n={N()} name="Body · Inter" hint="font-body"><span className="text-lg font-body">Aa Gg 16 — Inter</span></Item>
        <Item n={N()} name="Gewicht 300–700" hint="font-light…bold">
          <div className="flex flex-col gap-0.5 text-sm font-display">
            <span className="font-light">Licht 300</span><span className="font-normal">Normaal 400</span><span className="font-semibold">Stevig 600</span><span className="font-bold">Vet 700</span>
          </div>
        </Item>
        <Item n={N()} name="Kinetic Text" hint="<KineticText/>"><KineticText words={["focus", "flow", "vorm"]} /></Item>
        <Item n={N()} name="Big Number" hint="useCountUp"><BigNumber /></Item>
      </div>

      <Section n="07" title="KLEUREN" sub="Palette-swatches — GIULIA editorial + domeinaccenten." />
      <div className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-10 gap-3">
        {PALETTE.map((p) => (
          <div key={p.l} className="relative">
            <Item n={N()} name={p.l} hint={p.l}>
              <div className="w-full h-16 rounded-xl" style={{ background: p.v, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }} />
            </Item>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl glass-card p-5 max-w-2xl">
        <p className="text-sm text-foreground/80">Compositie: noem een element-nummer en Giulia combineert ze tot een nieuwe widget. Bijv. <span className="font-mono text-xs">"#03 Orbit + #01 glas 3:4 + foto #02"</span> → een glas-op-foto kaart met een orbitvorm erin.</p>
      </div>
    </div>
  );
}