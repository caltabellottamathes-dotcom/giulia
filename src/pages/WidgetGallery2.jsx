import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { WIDGETS as REG } from "@/lib/widgetRegistry";
import { WIDGETS as MOCK } from "@/lib/widgetGalleryData";
import { WidgetThemeProvider } from "@/lib/WidgetThemeContext";
import AltFullBleedChip from "@/components/widgetgallery2/AltFullBleedChip";
import AltVerticalSplit from "@/components/widgetgallery2/AltVerticalSplit";
import AltCardStack from "@/components/widgetgallery2/AltCardStack";
import AltTypographicPoster from "@/components/widgetgallery2/AltTypographicPoster";
import AltRadial from "@/components/widgetgallery2/AltRadial";
import AltTimelineRibbon from "@/components/widgetgallery2/AltTimelineRibbon";
import AltVerticalAccordion from "@/components/widgetgallery2/AltVerticalAccordion";

const ALT_MAP = {
  A: AltFullBleedChip, B: AltVerticalSplit, C: AltCardStack, D: AltTypographicPoster,
  E: AltRadial, F: AltTimelineRibbon, H: AltVerticalAccordion,
};
const ALT_LABELS = {
  A: "Full-bleed foto + chip", B: "Verticale split + meter", C: "Kaartenstapel",
  D: "Typografische poster", E: "Radiale orbit", F: "Tijdlijn-lint", H: "Verticale accordeon",
};
// Two genuinely different alt layouts per widget — different ratio + motion.
const ASSIGN = {
  giulia: ["D", "C"], agenda: ["F", "A"], tasks: ["B", "H"], approvals: ["C", "A"],
  email: ["D", "F"], whatsapp: ["H", "A"], projects: ["B", "E"], knowledge: ["E", "C"],
  people: ["A", "H"], documents: ["C", "B"], memory: ["E", "D"], activity: ["F", "H"],
  agentactivity: ["E", "A"], insights: ["D", "B"], timetracker: ["B", "H"], updates: ["A", "F"],
};

const ORDER = Object.values(REG)
  .filter((w) => w.type !== "concierge")
  .sort((a, b) => a.label.localeCompare(b.label, "nl"));

export default function WidgetGallery2() {
  const mockByKey = Object.fromEntries(MOCK.map((m) => [m.key, m]));
  return (
    <div className="px-5 lg:px-10 py-8 space-y-14 max-w-[1400px] mx-auto">
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Terug naar Home
        </Link>
        <h1 className="text-3xl font-display font-bold tracking-tight">Widget Gallery 2</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Per widget drie ontwerpen naast elkaar — links het goedgekeurde dashboard-widget (live), rechts twee nieuwe ontwerpen met een eigen layout, verhouding en beweging.
        </p>
      </div>
      {ORDER.map((w) => {
        const mock = mockByKey[w.type] || {
          key: w.type, label: w.label, accent: "olive", value: 0, unit: "",
          sub: "", photo: w.image, page2: { title: "", text: "" }, actions: ["Openen"],
        };
        const [a1, a2] = ASSIGN[w.type] || ["A", "C"];
        const A1 = ALT_MAP[a1], A2 = ALT_MAP[a2];
        const Real = w.Component;
        return (
          <section key={w.type} className="space-y-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-xl font-display font-semibold">{w.label}</h2>
              <span className="text-[11px] text-muted-foreground">
                1 · huidig &nbsp;—&nbsp; 2 · {ALT_LABELS[a1]} &nbsp;—&nbsp; 3 · {ALT_LABELS[a2]}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              <div className="space-y-1.5">
                <WidgetThemeProvider value={{ theme: "glass", color: "", opacity: 1, blur: 0 }}>
                  <Real />
                </WidgetThemeProvider>
                <p className="text-[11px] uppercase tracking-[0.14em] text-center text-muted-foreground">1 · Huidig (live)</p>
              </div>
              <div className="space-y-1.5">
                <A1 widget={mock} />
                <p className="text-[11px] uppercase tracking-[0.14em] text-center text-muted-foreground">2 · {ALT_LABELS[a1]}</p>
              </div>
              <div className="space-y-1.5">
                <A2 widget={mock} />
                <p className="text-[11px] uppercase tracking-[0.14em] text-center text-muted-foreground">3 · {ALT_LABELS[a2]}</p>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}