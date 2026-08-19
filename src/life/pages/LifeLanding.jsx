import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { domainBalance, DOMAIN_HEX } from "@/lib/domainUtils";
import { Heart, Home, ClipboardList, Palette, Utensils, Target, Activity as ActivityIcon, ArrowUpRight } from "lucide-react";
import LifeActivityFeed from "@/life/components/LifeActivityFeed";

const MODULES = [
  { to: "/life/social", label: "Social", icon: Heart, desc: "Wie aandacht verdient", image: IMAGES.lifeSocialPulse },
  { to: "/life/household", label: "Huishouden", icon: Home, desc: "Het huis op orde", image: IMAGES.lifeHousehold },
  { to: "/life/personal-admin", label: "Persoonlijk Admin", icon: ClipboardList, desc: "Wat geregeld moet worden", image: IMAGES.lifePersonalAdmin },
  { to: "/life/hobbies", label: "Hobby's", icon: Palette, desc: "Wat jou energie geeft", image: IMAGES.lifeHobbies },
  { to: "/life/food", label: "Food", icon: Utensils, desc: "Wat je deze week eet", image: IMAGES.lifeFood },
  { to: "/life/development", label: "Development", icon: Target, desc: "Groei, doelen en therapie", image: IMAGES.selfDevelopment },
  { to: "/life/daily-state", label: "Daily State", icon: ActivityIcon, desc: "Hoe sta je ervoor", image: IMAGES.selfDailyState },
];

export default function LifeLanding() {
  const [bal, setBal] = useState({ focus: 0, life: 0, self: 0, total: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [t, e] = await Promise.all([base44.entities.Task.list().catch(() => []), base44.entities.CalendarEvent.list().catch(() => [])]);
        setBal(domainBalance({ tasks: t, events: e }));
      } catch { /* ignore */ }
    })();
  }, []);

  const insight = bal.total === 0
    ? "Voeg taken of afspraken toe — zodra er data is, meet ik hoe FOCUS en LIFE zich verhouden."
    : bal.life < 20 ? "Je week leunt zwaar op FOCUS. Eén sociaal of huishoudelijk moment houdt de balans."
    : "Je week voelt gebalanceerd. FOCUS en LIFE hebben allebei plek.";

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHero page="life" image={IMAGES.dashboardLife} icon={Heart} eyebrow="LIFE" title="Personal Life Intelligence" subtitle="Een contextlaag over je OS — FOCUS en LIFE in balans" />

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassPanel level={2} className="p-7 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Giulia · Domeinbalans</p>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              <div style={{ width: `${bal.focus}%`, background: DOMAIN_HEX.focus }} />
              <div style={{ width: `${bal.life}%`, background: DOMAIN_HEX.life }} />
            </div>
            <div className="flex gap-5 mt-4 flex-wrap">
              {[["FOCUS", bal.focus, DOMAIN_HEX.focus], ["LIFE", bal.life, DOMAIN_HEX.life]].map(([l, v, c]) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                  <span className="text-sm font-display font-semibold tabular-nums">{v}%</span>
                  <span className="text-xs text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-base text-foreground/80 leading-relaxed mt-6">{insight}</p>
        </GlassPanel>

        <div className="relative rounded-[24px] overflow-hidden min-h-[280px] shadow-[0_24px_56px_-24px_rgba(0,0,0,0.4)]">
          <img src={IMAGES.salvoWalkingBeach} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 text-ivory text-lg font-display font-medium max-w-xs">Bestaande data, nieuwe context — geen tweede agenda, geen tweede taken.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} className="block">
            <GlassPanel level={2} className="overflow-hidden hover:-translate-y-1 transition-transform h-full flex flex-col">
              <div className="relative h-32">
                <img src={m.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                <m.icon className="absolute top-4 right-4 h-5 w-5 text-ivory/80" strokeWidth={1.5} />
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{m.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-d-life-deep" />
              </div>
            </GlassPanel>
          </Link>
        ))}
      </div>

      <LifeActivityFeed />
    </div>
  );
}