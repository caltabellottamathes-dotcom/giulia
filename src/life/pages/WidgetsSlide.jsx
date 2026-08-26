import React from "react";
import { Link } from "react-router-dom";
import RemindersHomeWidget from "@/life/widgets/new/RemindersHomeWidget";
import ThingsHandleWidget from "@/life/widgets/new/ThingsHandleWidget";
import ThingsLoveWidget from "@/life/widgets/new/ThingsLoveWidget";
import DinnerWidget from "@/life/widgets/new/DinnerWidget";
import MusicWidget from "@/life/widgets/new/MusicWidget";
import ProjectsFocusWidget from "@/focus/widgets/new/ProjectsFocusWidget";
import AgendaFocusWidget from "@/focus/widgets/new/AgendaFocusWidget";
import WhatsAppChatFocusWidget from "@/focus/widgets/new/WhatsAppChatFocusWidget";
import { IMAGES } from "@/lib/images";
import MasonryGrid from "@/system/widgets/MasonryGrid";

export default function WidgetsSlide() {
  const Label = ({ children }) => (
    <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-charcoal/55 mb-2">{children}</p>
  );

  return (
    <div className="relative min-h-screen px-5 lg:px-10 py-8 pb-24">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img src={IMAGES.lifeDashBg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(235,234,229,0.74), rgba(235,234,229,0.88))" }} />
      </div>

      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-charcoal/60 hover:text-charcoal transition-colors">
        ← Terug naar OS
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5 text-charcoal">Widget-slide</h1>
      <p className="text-sm text-charcoal/55 mt-1 mb-8">
        LIFE-widget-skelet met Focus-toevoegingen — ridge-sky, pistase, beton, urgent.
      </p>

      <MasonryGrid className="max-w-[1280px] xl:max-w-[1500px]" gap={24} spans={[1, 2, 1, 2, 2, 1, 1, 1]} scale={0.9}>
        <div>
          <Label>02 · REMINDERS FOR HOME. — G·21x9·PHOTOSHELL · flush glaskaart links + cijfer rechts</Label>
          <RemindersHomeWidget />
        </div>
        <div>
          <Label>03 · THINGS TO HANDLE! — P·9x16·B·SIDE · admin capacity-ring (InRhythm-stijl)</Label>
          <ThingsHandleWidget />
        </div>
        <div>
          <Label>04 · THINGS I LOVE. — G·3:2·R·SIDE · hobby-veld met aandachtsflow</Label>
          <ThingsLoveWidget />
        </div>
        <div>
          <Label>05 · WHAT'S FOR DINNER? — G·4:3·SLIDE · dag-tijdlijn vandaag/morgen, flush kaart</Label>
          <DinnerWidget />
        </div>
        <div>
          <Label>07 · MELODIES TO LISTEN. — P·3:4·SPLIT · pistase-blauwe bloom, flush fotokaart + bibliotheek</Label>
          <MusicWidget />
        </div>

        <div>
          <Label>03 · WHAT I'M BUILDING. — G·4:3·R·SIDE · gauge + voortgang per project (Projects)</Label>
          <ProjectsFocusWidget />
        </div>
        <div>
          <Label>07 · WHAT'S HAPPENING? — G·21x9·L·SIDE · kinetisch + tijdlijn (Agenda)</Label>
          <AgendaFocusWidget />
        </div>
        <div>
          <Label>02 · WHO'S TEXTING? — P·16x9·L·SIDE · chatvenster + 5 ongelezen berichten (WhatsApp)</Label>
          <WhatsAppChatFocusWidget />
        </div>
      </MasonryGrid>
    </div>
  );
}