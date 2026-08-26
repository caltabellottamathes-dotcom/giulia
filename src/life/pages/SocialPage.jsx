import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "@/lib/images";
import { Heart, CalendarHeart, Clock, LayoutGrid, Users } from "lucide-react";
import SocialOverviewPreview from "@/life/panels/SocialOverviewPreview";
import RelationshipsPreview from "@/life/panels/RelationshipsPreview";
import SocialPulsePreview from "@/life/panels/SocialPulsePreview";
import SocialPlannerPreview from "@/life/panels/SocialPlannerPreview";
import PersonalTimePreview from "@/life/panels/PersonalTimePreview";

/**
 * Social — de "space" achter What Social Life? Eén donkere glas-omgeving met
 * 5 tabs (§14.1: Overview / Relationships / Pulse / Planner / Personal Time)
 * die dezelfde Previews tonen als het ModulePanel. Geen aparte pages meer —
 * de Preview IS de inhoud.
 */
const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid, Preview: SocialOverviewPreview },
  { key: "relationships", label: "Relationships", icon: Users, Preview: RelationshipsPreview },
  { key: "socialpulse", label: "Pulse", icon: Heart, Preview: SocialPulsePreview },
  { key: "socialplanner", label: "Planner", icon: CalendarHeart, Preview: SocialPlannerPreview },
  { key: "socialtime", label: "Persoonlijke Tijd", icon: Clock, Preview: PersonalTimePreview },
];

export default function SocialPage() {
  const navigate = useNavigate();
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get("view") || "overview");
  const setView2 = (v) => { setView(v); navigate(`/life/social?view=${v}`, { replace: true }); };
  const active = TABS.find((t) => t.key === view) || TABS[0];
  const Preview = active.Preview;

  return (
    <div className="animate-fade-up">
      <div className="rounded-[32px] glass-3 overflow-hidden flex flex-col min-h-[calc(100svh-9rem)] shadow-[0_32px_72px_-24px_rgba(0,0,0,0.28)]">
        <div className="h-[3px] w-full shrink-0" style={{ background: "hsl(var(--life-blue))" }} />
        <div className="relative shrink-0 h-32 overflow-hidden">
          <img src={IMAGES.lifeSocialPulse} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
        </div>

        <div className="flex-1 -mt-8 rounded-t-[28px] flex flex-col min-h-0">
          <div className="px-7 lg:px-9 pt-6 pb-3 shrink-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/55 font-medium mb-1">Snelle context</p>
            <h1 className="text-2xl lg:text-[26px] font-display font-semibold tracking-tight text-ivory leading-none">What Social Life?</h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setView2(t.key)}
                  className={`text-[12px] font-medium tracking-[0.04em] transition-colors ${view === t.key ? "text-ivory underline underline-offset-[6px] decoration-ivory/60" : "text-ivory/45 hover:text-ivory/80"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-7 lg:mx-9 h-px bg-storm/10 shrink-0" />

          <div className="flex-1 min-h-0 px-7 lg:px-9 pt-4 pb-8 overflow-y-auto">
            <Preview key={view} />
          </div>
        </div>
      </div>
    </div>
  );
}