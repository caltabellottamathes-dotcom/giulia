import React from "react";
import { Link } from "react-router-dom";
import NumericItems from "@/system/widgets/graph/numeric";
import GaugeItems from "@/system/widgets/graph/gauges";
import DataGraphItems from "@/system/widgets/graph/dataGraphs";
import LiveItems from "@/system/widgets/graph/live";
import TimelineItems from "@/system/widgets/graph/timelines";
import AgendaItems from "@/system/widgets/graph/agenda";
import NetworkItems from "@/system/widgets/graph/network";
import FlowItems from "@/system/widgets/graph/flow";
import IntelligenceItems from "@/system/widgets/graph/intelligence";
import LiveSystemItems from "@/system/widgets/graph/liveSystem";
import StatesItems from "@/system/widgets/graph/states";
import ListsItems from "@/system/widgets/graph/lists";
import PeopleItems from "@/system/widgets/graph/people";
import MediaItems from "@/system/widgets/graph/media";
import MaterialsItems from "@/system/widgets/graph/materials";
import TypographyItems from "@/system/widgets/graph/typography";
import MotionItems from "@/system/widgets/graph/motion";
import CrossDomainItems from "@/system/widgets/graph/crossDomain";
import { A } from "@/system/widgets/graph/graphData";

function Section({ n, title, sub, items }) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-3xl font-display font-semibold tabular-nums leading-none" style={{ color: A.olive }}>{n}</span>
        <div>
          <h2 className="text-xl font-display font-semibold tracking-tight leading-none">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{items.map((it, i) => <React.Fragment key={i}>{it}</React.Fragment>)}</div>
    </section>
  );
}

export default function GraphGallery() {
  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24">
      <div className="mb-8">
        <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">← Terug naar OS</Link>
        <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">Graph Gallery</h1>
        <p className="text-sm text-muted-foreground mt-1">Achttien categorieën grafische elementen — beeld en vorm voorop, levend en geanimeerd, in de GIULIA-stijl.</p>
      </div>
      <Section n="01" title="NUMERIC" sub="Grote, levende cijfers — tellers, delta's, timers, morphen." items={NumericItems} />
      <Section n="02" title="GAUGES & METERS" sub="Vormen die vloeiend meebewegen: 64% → 65% → 66%." items={GaugeItems} />
      <Section n="03" title="DATA GRAPHS" sub="Met X/Y-as, grid, labels, tooltips, hover en animated drawing." items={DataGraphItems} />
      <Section n="04" title="LIVE GRAPHS" sub="Continu bewegend, nieuwe data stroomt binnen." items={LiveItems} />
      <Section n="05" title="TIMELINES" sub="Alles wat zich door tijd beweegt — interactief, klikbaar." items={TimelineItems} />
      <Section n="06" title="AGENDA VISUALS" sub="Agenda als visueel systeem — blokken, flow, dichtheid, conflicts." items={AgendaItems} />
      <Section n="07" title="NETWORK" sub="Knopen, verbindingen, radialen, honingraat — netwerken als beeld." items={NetworkItems} />
      <Section n="08" title="FLOW" sub="Stromen, pijplijnen, sankey — hoe dingen van A naar B gaan." items={FlowItems} />
      <Section n="09" title="INTELLIGENCE" sub="Radar, confidence-ringen, webs — inzicht als vorm." items={IntelligenceItems} />
      <Section n="10" title="LIVE SYSTEM" sub="Hartslag, monitoren, rivieren — het systeem dat leeft." items={LiveSystemItems} />
      <Section n="11" title="STATES" sub="Pills, lichten, roosters — toestanden die schakelen." items={StatesItems} />
      <Section n="12" title="LISTS" sub="Rankings, balken, vergelijkingen — orde als beeld." items={ListsItems} />
      <Section n="13" title="PEOPLE" sub="Avatars, aanwezigheid, sociale grafen — mensen als vorm." items={PeopleItems} />
      <Section n="14" title="MEDIA" sub="Filmstrips, roosters, scrubbers — beeldmateriaal in beweging." items={MediaItems} />
      <Section n="15" title="MATERIALS" sub="Swatches, texturen, gradiënten — het materiaal van het OS." items={MaterialsItems} />
      <Section n="16" title="TYPOGRAPHY" sub="Specimens, gewicht, spacing — letters als grafiek." items={TypographyItems} />
      <Section n="17" title="MOTION" sub="Easing, loops, paden — beweging zichtbaar gemaakt." items={MotionItems} />
      <Section n="18" title="CROSS-DOMAIN" sub="Radar, flow, balans — domeinen tegenover elkaar." items={CrossDomainItems} />
    </div>
  );
}