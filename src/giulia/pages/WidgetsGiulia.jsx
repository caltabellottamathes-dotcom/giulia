import React from "react";
import { Link } from "react-router-dom";
import WhatMattersWidget from "@/giulia/widgets/new/WhatMattersWidget";

export default function WidgetsGiulia() {
  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24 max-w-[1400px] mx-auto">
      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">← Terug naar OS</Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">GIULIA · Nieuwe Widgets</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Ontwerpreeks voor de nieuwe Giulia-widgets.</p>
      <div className="space-y-6">
        <WhatMattersWidget />
      </div>
    </div>
  );
}