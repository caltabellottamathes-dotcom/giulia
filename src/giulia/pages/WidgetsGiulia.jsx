import React from "react";
import { Link } from "react-router-dom";
import GiuliaConciergeWidget from "@/giulia/widgets/new/GiuliaConciergeWidget";
import WhatMattersLayeredWidget from "@/giulia/widgets/new/WhatMattersLayeredWidget";
import WaitingOnYouWidget from "@/giulia/widgets/new/WaitingOnYouWidget";
import WhatIveNoticedWidget from "@/giulia/widgets/new/WhatIveNoticedWidget";
import WantsToKnowLayeredWidget from "@/giulia/widgets/new/WantsToKnowLayeredWidget";
import ImAliveWidget from "@/giulia/widgets/new/ImAliveWidget";
import GoodMorningWidget from "@/giulia/widgets/new/GoodMorningWidget";

export default function WidgetsGiulia() {
  const Label = ({ children }) => (
    <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/45 mb-2">{children}</p>
  );

  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24 max-w-[1320px] mx-auto">
      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">
        ← Terug naar OS
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">GIULIA · Widget-skelet</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Eén skelet — vijf widgets in ware dashboard-grootte. Zelfde primitieven, andere vorm, elementen en plaatsing.
      </p>
      <Link to="/shell-collection" className="inline-block text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors mb-8">
        Bekijk de Shell-collectie →
      </Link>

      <div className="columns-1 lg:columns-2 gap-8">
        <div className="break-inside-avoid mb-8 mx-auto w-[290px]">
          <Label>01 · GIULIA'S HOTLINE — 9:16 · foto-shell + glas · tik op de bloom</Label>
          <GiuliaConciergeWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[620px]">
          <Label>02 · WHAT MATTERS? — G·16x9·L·SIDE · live bars + checklist</Label>
          <WhatMattersLayeredWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[620px]">
          <Label>03 · WAITING ON YOU — G·3x2·R·SIDE · live telling + urgente approvals</Label>
          <WaitingOnYouWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[340px]">
          <Label>04 · WHAT I'VE NOTICED — P·1x1·B·STRIP · XL gauge-ring + 3 groepen</Label>
          <WhatIveNoticedWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[300px]">
          <Label>05 · WANTS TO KNOW — P·2x3·B·SIDE · comparison gauge (FOCUS/LIFE/URGENT)</Label>
          <WantsToKnowLayeredWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[340px]">
          <Label>06 · I'M ALIVE! — G·1x1 · EKG live/dood · tik om te starten</Label>
          <ImAliveWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[680px]">
          <Label>07 · GOOD MORNING! — G·21x9·L·SIDE · wektijd + aftelklok</Label>
          <GoodMorningWidget />
        </div>
      </div>
    </div>
  );
}