import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { IMAGES } from "@/lib/images";
import { domainBalance, DOMAIN_HEX } from "@/lib/domainUtils";
import { Activity as ActivityIcon, Sunrise, Repeat, Heart, BookOpen, Target, Clock, Telescope, ArrowUpRight } from "lucide-react";

const MODULES = [
  { to: "/self/daily-state", label: "Daily State", icon: ActivityIcon, desc: "Hoe sta je ervoor", image: IMAGES.selfDailyState },
  { to: "/self/routines", label: "Routines", icon: Repeat, desc: "Terugkerende gewoontes", image: IMAGES.selfRoutines },
  { to: "/self/wake", label: "Wake", icon: Sunrise, desc: "Ochtend en opstart", image: IMAGES.selfWake },
  { to: "/self/therapy", label: "Therapy", icon: Heart, desc: "Trajecten en begeleiding", image: IMAGES.selfTherapy },
  { to: "/self/journal", label: "Journal", icon: BookOpen, desc: "Persoonlijke geschiedenis", image: IMAGES.selfJournal },
  { to: "/self/personal-development", label: "Development", icon: Target, desc: "Groei en leren", image: IMAGES.selfDevelopment },
  { to: "/self/personal-time", label: "Personal Time", icon: Clock, desc: "Rust en herstel", image: IMAGES.selfPersonalTime },
  { to: "/self/insights", label: "Insights", icon: Telescope, desc: "Patronen en balans", image: IMAGES.selfInsights },
];

export default function SelfLanding() {
  const [bal, setBal] = useState({ focus: 0, life: 0, self: 0, total: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [t, e] = await Promise.all([
          (await import("@/api/base44Client")).base44.entities.Task.list().catch(() => []),
          (await import("@/api/base44Client")).base44.entities.CalendarEvent.list().catch(() => []),
        ]);
        setBal(domainBalance({ tasks: t, events: e }));
      } catch { /* ignore */ }
    })();
  }, []);

  const insight = bal.total === 0
    ? "Voeg taken of afspraken toe — zodra er data is, meet ik hoe FOCUS, LIFE en SELF zich verhouden."
    : bal.self < 10 ? "Zelfzorg staat op de achtergrond — een moment van rust vandaag is geen luxe."
    : bal.self > 40 ? "Je week leunt zwaar op SELF. FOCUS heeft ook plek."
    : "Je week voelt gebalanceerd. FOCUS, LIFE en SELF hebben allemaal plek.";

  return (
    <div className="space-y-8 animate-fade-up">
      <PageHero page="self" image={IMAGES.dashboardSelf} icon={Heart} eyebrow="SELF" title="Personal Self Intelligence" subtitle="Rust, ritme en groei — de laag die jou onderhoudt" />

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassPanel level={2} className="p-7 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-4">Giulia · Domeinbalans</p>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              <div style={{ width: `${bal.focus}%`, background: DOMAIN_HEX.focus }} />
              <div style={{ width: `${bal.life}%`, background: DOMAIN_HEX.life }} />
              <div style={{ width: `${bal.self}%`, background: DOMAIN_HEX.self }} />
            </div>
            <div className="flex gap-5 mt-4 flex-wrap">
              {[["FOCUS", bal.focus, DOMAIN_HEX.focus], ["LIFE", bal.life, DOMAIN_HEX.life], ["SELF", bal.self, DOMAIN_HEX.self]].map(([l, v, c]) => (
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
          <img src={IMAGES.selfPersonalTime} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 text-ivory text-lg font-display font-medium max-w-xs">Rust is geen beloning. Het is de voorwaarde voor alles.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} className="block">
            <GlassPanel level={2} className="overflow-hidden hover:-translate-y-1 transition-transform h-full flex flex-col">
              <div className="relative h-28">
                <img src={m.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                <m.icon className="absolute top-4 right-4 h-5 w-5 text-ivory/80" strokeWidth={1.5} />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{m.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4" style={{ color: "hsl(var(--self-accent-deep))" }} />
              </div>
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}