import React from "react";
import { Link } from "react-router-dom";
import GiuliaConciergeWidget from "@/giulia/widgets/new/GiuliaConciergeWidget";
import WhatMattersLayeredWidget from "@/giulia/widgets/new/WhatMattersLayeredWidget";

export default function WidgetsGiulia() {
  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24 max-w-[1400px] mx-auto">
      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">
        ← Terug naar OS
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">GIULIA · Widget-skelet</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Eén skelet — twee referentie-widgets. Zelfde primitieven, andere vorm, elementen en plaatsing.
      </p>
      <Link to="/shell-collection" className="inline-block text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors mb-8">
        Bekijk de Shell-collectie →
      </Link>

      <div className="space-y-10">
        <section className="space-y-2 max-w-[300px]">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/45">
            01 · GIULIA'S HOTLINE — 9:16 · foto-shell + glas · tik op de bloom om te bellen
          </p>
          <GiuliaConciergeWidget />
        </section>
        <section className="space-y-2 max-w-[560px]">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/45">
            02 · WHAT MATTERS? — G·16x9·L·SIDE · glas-shell + foto-card links (gelaagd) · live bars + checklist
          </p>
          <WhatMattersLayeredWidget />
        </section>
      </div>
    </div>
  );
}