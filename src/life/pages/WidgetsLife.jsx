import React from "react";
import { Link } from "react-router-dom";
import SocialLifeWidget from "@/life/widgets/new/SocialLifeWidget";
import RemindersHomeWidget from "@/life/widgets/new/RemindersHomeWidget";
import ThingsHandleWidget from "@/life/widgets/new/ThingsHandleWidget";
import ThingsLoveWidget from "@/life/widgets/new/ThingsLoveWidget";
import DinnerWidget from "@/life/widgets/new/DinnerWidget";
import HowDoingWidget from "@/life/widgets/new/HowDoingWidget";
import MusicWidget from "@/life/widgets/new/MusicWidget";
import { IMAGES } from "@/lib/images";
import MasonryGrid from "@/system/widgets/MasonryGrid";

export default function WidgetsLife() {
  const Label = ({ children }) => (
    <p className="text-[10px] uppercase tracking-[0.24em] font-semibold text-charcoal/55 mb-2">{children}</p>
  );

  return (
    <div className="relative min-h-screen px-5 lg:px-10 py-8 pb-24">
      {/* LIFE dashboard achtergrond — LIFE_DASHBOARD_BG */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img src={IMAGES.lifeDashBg} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(235,234,229,0.74), rgba(235,234,229,0.88))" }} />
      </div>

      <Link to="/" className="text-[10px] uppercase tracking-[0.24em] font-semibold text-charcoal/60 hover:text-charcoal transition-colors">
        ← Terug naar OS
      </Link>
      <h1 className="text-3xl font-display font-semibold tracking-tight mt-1.5 text-charcoal">LIFE · Widget-skelet</h1>
      <p className="text-sm text-charcoal/55 mt-1 mb-8">
        Zes LIFE-widgets in het Giulia-skelet — ridge-sky, pistache, beton, urgent. Echte LIFE-functies + juiste data.
      </p>

      <MasonryGrid className="max-w-[1280px] xl:max-w-[1500px]" gap={24} spans={[1, 2, 1, 2, 2, 1, 2]} scale={0.9}>
        <div>
          <Label>01 · WHAT SOCIAL LIFE? — P·4:5·GLAS · close-circle orbit (SocialOrbit #16) + foto-strip</Label>
          <SocialLifeWidget />
        </div>
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
          <Label>06 · HOW I'M DOING. — P·2:3·B·STRIP · drie ringen (E/C/M)</Label>
          <HowDoingWidget />
        </div>
        <div>
          <Label>07 · MUSIC. — P·4:5·SPLIT · blauwe bloom+sine midden, zwevende fotokaart + bibliotheek</Label>
          <MusicWidget />
        </div>

      </MasonryGrid>
    </div>
  );
}