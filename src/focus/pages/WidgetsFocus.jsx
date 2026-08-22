import React from "react";
import { Link } from "react-router-dom";
import FocusHotlineWidget from "@/focus/widgets/new/FocusHotlineWidget";
import WhatMattersFocusWidget from "@/focus/widgets/new/WhatMattersFocusWidget";
import WaitingOnYouFocusWidget from "@/focus/widgets/new/WaitingOnYouFocusWidget";
import WhatIveNoticedFocusWidget from "@/focus/widgets/new/WhatIveNoticedFocusWidget";
import WantsToKnowFocusWidget from "@/focus/widgets/new/WantsToKnowFocusWidget";
import ImAliveFocusWidget from "@/focus/widgets/new/ImAliveFocusWidget";
import NextUpFocusWidget from "@/focus/widgets/new/NextUpFocusWidget";

export default function WidgetsFocus() {
  const Label = ({ children }) => (
    <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/45 mb-2">{children}</p>
  );

  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 pb-24 max-w-[1320px] mx-auto">
      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-foreground/50 hover:text-foreground transition-colors">
        ← Terug naar OS
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5">FOCUS · Widget-skelet</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">
        GIULIA-widget-skelet, overgezet naar Focus — burgundy, olijf, beton, geborsteld metaal. Eén skelet, ontworpen naar functie. Live data.
      </p>

      <div className="columns-1 lg:columns-2 gap-8">
        <div className="break-inside-avoid mb-8 mx-auto w-[290px]">
          <Label>01 · FOCUS MODE! — 9:16 · foto-shell + glas · 25-min deep-work timer</Label>
          <FocusHotlineWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[620px]">
          <Label>02 · WHAT'S HAPPENING? — P·16x9·L·SIDE · live bars + checklist (agenda)</Label>
          <WhatMattersFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[620px]">
          <Label>03 · WAITING ON YOU. — G·4:3·R·SIDE · ghost-telling + approvals</Label>
          <WaitingOnYouFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[340px]">
          <Label>04 · WHAT I'VE NOTICED. — P·1x1·B·STRIP · XL gauge-ring (Taken/Projecten/Email)</Label>
          <WhatIveNoticedFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[300px]">
          <Label>05 · WANTS TO KNOW! — P·2x3·B·SIDE · comparison gauge (FOCUS/LIFE/URGENT)</Label>
          <WantsToKnowFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-[340px]">
          <Label>06 · I'M ALIVE! — foto-shell + EKG live/dood · tik om te starten</Label>
          <ImAliveFocusWidget />
        </div>
        <div className="break-inside-avoid mb-8 mx-auto w-full max-w-[680px]">
          <Label>07 · NEXT UP! — G·21x9·L·SIDE · aftelklok tot volgende afspraak</Label>
          <NextUpFocusWidget />
        </div>
      </div>
    </div>
  );
}