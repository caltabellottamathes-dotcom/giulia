import React from "react";
import { WIDGET_LIST } from "@/lib/widgetRegistry";
import MasonryGrid from "@/system/widgets/MasonryGrid";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Gallery-only LIFE widgets — visueel herontworpen
import SocialPulseGallery from "@/system/widgets/gallery/life/SocialPulseGallery";
import SocialPlannerGallery from "@/system/widgets/gallery/life/SocialPlannerGallery";
import HouseholdGallery from "@/system/widgets/gallery/life/HouseholdGallery";
import PersonalAdminGallery from "@/system/widgets/gallery/life/PersonalAdminGallery";
import HobbiesGallery from "@/system/widgets/gallery/life/HobbiesGallery";
import FoodGallery from "@/system/widgets/gallery/life/FoodGallery";

// Gallery-only SELF widgets — visueel herontworpen
import DailyStateGallery from "@/system/widgets/gallery/self/DailyStateGallery";
import RoutinesGallery from "@/system/widgets/gallery/self/RoutinesGallery";
import WakeGallery from "@/system/widgets/gallery/self/WakeGallery";
import TherapyGallery from "@/system/widgets/gallery/self/TherapyGallery";
import JournalGallery from "@/system/widgets/gallery/self/JournalGallery";
import DevelopmentGallery from "@/system/widgets/gallery/self/DevelopmentGallery";
import PersonalTimeGallery from "@/system/widgets/gallery/self/PersonalTimeGallery";
import SelfInsightsGallery from "@/system/widgets/gallery/self/SelfInsightsGallery";

const GALLERY_WIDGETS = {
  socialpulse: SocialPulseGallery,
  socialplanner: SocialPlannerGallery,
  household: HouseholdGallery,
  personaladmin: PersonalAdminGallery,
  hobbies: HobbiesGallery,
  food: FoodGallery,
  selfdailystate: DailyStateGallery,
  selfroutines: RoutinesGallery,
  selfwake: WakeGallery,
  selftherapy: TherapyGallery,
  selfjournal: JournalGallery,
  selfdevelopment: DevelopmentGallery,
  selfpersonaltime: PersonalTimeGallery,
  selfinsights: SelfInsightsGallery,
};

const DOMAIN_ORDER = [
  { id: "giulia", label: "Giulia", desc: "Je AI-assistent — overzicht, inzichten en initiatief" },
  { id: "focus", label: "Focus", desc: "Werk, projecten, communicatie en planning" },
  { id: "life", label: "Life", desc: "Huishouden, sociaal, hobby's en FOOD — grafisch herontworpen" },
  { id: "self", label: "Self", desc: "Therapie, routines, journal en ontwikkeling — grafisch herontworpen" },
  { id: "system", label: "System", desc: "Geheugen, kennis, media en tools" },
];

export default function WidgetGalleryAll() {
  return (
    <div className="min-h-[calc(100svh-9.5rem)] -mx-5 lg:-mx-10 -my-6 lg:mb-0 pb-20">
      {/* Hero */}
      <div className="px-5 lg:px-10 pt-8 pb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft className="h-4 w-4" /> Terug
        </Link>
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-2 font-semibold">Overzicht</p>
        <h1 className="text-3xl lg:text-4xl font-display font-semibold tracking-[-0.02em] text-foreground mb-2">Alle Widgets</h1>
        <p className="text-sm text-muted-foreground max-w-xl">Elke widget in het OS, in zijn juiste formaat, gesorteerd per domein. Life en Self zijn visueel herontworpen met glas, animatie en bewegende grafische elementen.</p>
      </div>

      {/* Domein-secties */}
      <div className="px-5 lg:px-10 space-y-12">
        {DOMAIN_ORDER.map((dom) => {
          const domWidgets = WIDGET_LIST.filter((w) => w.domain === dom.id);
          if (!domWidgets.length) return null;
          const cells = domWidgets.map((def, i) => {
            const GalleryCmp = GALLERY_WIDGETS[def.type];
            const W = GalleryCmp || def.Component;
            return {
              node: GalleryCmp ? <W key={def.type} delay={i * 0.08} /> : <W key={def.type} />,
              span: def.span || 1,
            };
          });
          return (
            <section key={dom.id}>
              <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-border/40">
                <h2 className="text-xl font-display font-semibold text-foreground">{dom.label}</h2>
                <span className="text-[10px] font-mono text-muted-foreground tabular-nums">{String(domWidgets.length).padStart(2, "0")}</span>
                <p className="text-xs text-muted-foreground ml-2 hidden sm:block">{dom.desc}</p>
              </div>
              <MasonryGrid className="max-w-[1280px] xl:max-w-[1500px]" gap={20} spans={cells.map((c) => c.span)} scale={0.9}>
                {cells.map((c) => c.node)}
              </MasonryGrid>
            </section>
          );
        })}
      </div>
    </div>
  );
}