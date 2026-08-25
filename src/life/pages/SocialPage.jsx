import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart, CalendarHeart, Clock } from "lucide-react";
import SocialPulsePage from "@/life/pages/SocialPulsePage";
import SocialPlannerPage from "@/life/pages/SocialPlannerPage";
import PersonalTimePanel from "@/self/panels/PersonalTimePanel";

/**
 * Social — één verenigde "What Social Life?" sectie.
 * Laadt alle sociale data (contacts, emails, whatsapps, events, plans) ÉÉN keer
 * en deelt die met de drie views (Pulse / Planner / Persoonlijke Tijd). Elke view
 * is embedded: geen eigen PageHero meer, één gedeelde header voor de hele sectie.
 */
const VIEWS = [
  { key: "pulse", label: "Pulse", icon: Heart },
  { key: "planner", label: "Planner", icon: CalendarHeart },
  { key: "personal-time", label: "Persoonlijke Tijd", icon: Clock },
];

export default function SocialPage() {
  const navigate = useNavigate();
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get("view") || "pulse");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const setView2 = (v) => { setView(v); navigate(`/life/social?view=${v}`, { replace: true }); };

  useEffect(() => {
    (async () => {
      try {
        const [contacts, emails, whatsapps, events, plans] = await Promise.all([
          base44.entities.Contact.filter({}, "name", 200).catch(() => []),
          base44.entities.Email.list("-timestamp", 200).catch(() => []),
          base44.entities.WhatsAppMessage.list("-timestamp", 200).catch(() => []),
          base44.entities.CalendarEvent.list("start").catch(() => []),
          base44.entities.SocialPlan.list("suggested_date").catch(() => []),
        ]);
        setData({ contacts: contacts || [], emails: emails || [], whatsapps: whatsapps || [], events: events || [], plans: plans || [] });
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">LIFE</p>
        <h1 className="text-3xl font-display font-semibold tracking-tight mt-1">What Social Life?</h1>
        <p className="text-sm text-muted-foreground mt-1">Wie aandacht verdient, je plannen en je persoonlijke tijd — samen in één plek.</p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {VIEWS.map((v) => (
          <button key={v.key} onClick={() => setView2(v.key)} className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition flex items-center gap-1.5" style={view === v.key ? { background: "hsl(var(--life-blue))", color: "hsl(var(--ivory))" } : {}}>
            <v.icon className="w-3.5 h-3.5" />{v.label}
          </button>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-16"><div className="h-7 w-7 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" /></div>}
      {!loading && view === "pulse" && <SocialPulsePage data={data} embedded />}
      {!loading && view === "planner" && <SocialPlannerPage data={data} embedded />}
      {view === "personal-time" && (
        <div className="rounded-[28px] bg-charcoal p-6 text-ivory">
          <PersonalTimePanel />
        </div>
      )}
    </div>
  );
}