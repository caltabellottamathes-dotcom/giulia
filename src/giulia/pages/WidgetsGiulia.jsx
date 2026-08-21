import React from "react";
import { Link } from "react-router-dom";
import WhatMattersWidget from "@/giulia/widgets/new/WhatMattersWidget";
import SocialPulseWidget from "@/life/widgets/SocialPulseWidget";

export default function WidgetsGiulia() {
  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24 max-w-[1400px] mx-auto">
      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">
        ← Terug naar OS
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">GIULIA · Widget-skelet</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">
        Eén skelet — twee referentie-widgets. Zelfde primitieven, andere vorm, elementen en plaatsing.
      </p>

      <div className="space-y-10">
        <section className="space-y-2 max-w-[585px]">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/45">
            01 · What Matters? — GIULIA · span-2 · staafgrafiek + agenda
          </p>
          <WhatMattersWidget />
        </section>
        <section className="space-y-2 max-w-[400px]">
          <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/45">
            02 · What Social Life? — LIFE · 2×2 · staafgrafiek + foto
          </p>
          <SocialPulseWidget />
        </section>
      </div>
    </div>
  );
}