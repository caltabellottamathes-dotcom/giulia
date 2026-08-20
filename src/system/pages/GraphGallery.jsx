import React from "react";
import { Link } from "react-router-dom";
import NumericItems from "@/system/widgets/graph/numeric";
import GaugeItems from "@/system/widgets/graph/gauges";
import DataGraphItems from "@/system/widgets/graph/dataGraphs";
import LiveItems from "@/system/widgets/graph/live";
import TimelineItems from "@/system/widgets/graph/timelines";
import AgendaItems from "@/system/widgets/graph/agenda";
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
        <p className="text-sm text-muted-foreground mt-1">Zes categorieën grafische elementen — levend, geanimeerd, in de GIULIA-stijl.</p>
      </div>
      <Section n="01" title="NUMERIC" sub="Grote, levende cijfers — tellers, delta's, timers, morphen." items={NumericItems} />
      <Section n="02" title="GAUGES & METERS" sub="Vormen die vloeiend meebewegen: 64% → 65% → 66%." items={GaugeItems} />
      <Section n="03" title="DATA GRAPHS" sub="Met X/Y-as, grid, labels, tooltips, hover en animated drawing." items={DataGraphItems} />
      <Section n="04" title="LIVE GRAPHS" sub="Continu bewegend, nieuwe data stroomt binnen." items={LiveItems} />
      <Section n="05" title="TIMELINES" sub="Alles wat zich door tijd beweegt — interactief, klikbaar." items={TimelineItems} />
      <Section n="06" title="AGENDA VISUALS" sub="Agenda als visueel systeem — blokken, flow, dichtheid, conflicts." items={AgendaItems} />
    </div>
  );
}