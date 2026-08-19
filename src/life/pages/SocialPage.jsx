import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SocialPulsePage from "@/life/pages/SocialPulsePage";
import SocialPlannerPage from "@/life/pages/SocialPlannerPage";
import PersonalTimePanel from "@/self/panels/PersonalTimePanel";
import { Heart, CalendarHeart, Clock } from "lucide-react";

/**
 * Social — samengevoegde LIFE-sectie.
 * Voegt de vroegere Social Pulse, Social Planner en SELF · Personal Time
 * samen in één plek met drie views. Pulse en Planner behouden hun eigen
 * page-component (inclusief eigen hero); Personal Time toont het SELF-paneel
 * in een donkere glazen kaart.
 */
const VIEWS = [
  { key: "pulse", label: "Pulse", icon: Heart },
  { key: "planner", label: "Planner", icon: CalendarHeart },
  { key: "personal-time", label: "Persoonlijke Tijd", icon: Clock },
];

export default function SocialPage() {
  const navigate = useNavigate();
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get("view") || "pulse");

  const setView2 = (v) => { setView(v); navigate(`/life/social?view=${v}`, { replace: true }); };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">LIFE</p>
        <h1 className="text-4xl font-display font-semibold tracking-tight mt-1">What Social Life?</h1>
        <p className="text-sm text-muted-foreground mt-1">Wie aandacht verdient, je plannen en je persoonlijke tijd — samen in één plek.</p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {VIEWS.map((v) => (
          <button key={v.key} onClick={() => setView2(v.key)} className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition flex items-center gap-1.5" style={view === v.key ? { background: "hsl(var(--life-blue))", color: "hsl(var(--ivory))" } : {}}>
            <v.icon className="w-3.5 h-3.5" />{v.label}
          </button>
        ))}
      </div>

      {view === "pulse" && <SocialPulsePage />}
      {view === "planner" && <SocialPlannerPage />}
      {view === "personal-time" && (
        <div className="rounded-[28px] bg-charcoal p-6 text-ivory">
          <PersonalTimePanel />
        </div>
      )}
    </div>
  );
}