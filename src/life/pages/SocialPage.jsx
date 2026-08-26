import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Heart, Users, Sparkles, CalendarHeart, Clock } from "lucide-react";
import { closeCircle, socialPulse, meaningfulInteractions, pulseState, PULSE_LABEL } from "@/lib/domainUtils";
import { LIFE, DARK } from "@/life/components/social/socialColors";
import SocialSidebar from "@/life/components/social/SocialSidebar";
import OverviewSection from "@/life/components/social/sections/OverviewSection";
import RelationshipsSection from "@/life/components/social/sections/RelationshipsSection";
import PulseSection from "@/life/components/social/sections/PulseSection";
import PlannerSection from "@/life/components/social/sections/PlannerSection";
import PersonalTimeSection from "@/life/components/social/sections/PersonalTimeSection";

const TABS = [
  { key: "overview", label: "Overview", icon: Sparkles },
  { key: "relationships", label: "Relationships", icon: Users },
  { key: "pulse", label: "Pulse", icon: Heart },
  { key: "planner", label: "Planner", icon: CalendarHeart },
  { key: "personaltime", label: "Personal Time", icon: Clock },
];
const VALID = TABS.map((t) => t.key);

const EMPTY = { contacts: [], emails: [], whatsapps: [], events: [], plans: [], blocks: [], opportunities: [], intentions: [], insights: [], moments: [] };

/**
 * SocialPage — "What Social Life?" §14.1. ProjectDetail-anatomie (header +
 * horizontale nav + secties) in een donkere Network Graph-stijl, met een
 * 3D relatie-graaf als centrale viz op de Relationships-tab. LIFE-kleuren
 * consequent; Urgent (#d5e24a) alleen bij overdue/conflict.
 */
export default function SocialPage() {
  const navigate = useNavigate();
  const [view, setView] = useState(() => {
    const v = new URLSearchParams(window.location.search).get("view");
    return VALID.includes(v) ? v : "overview";
  });
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const setView2 = (v) => { setView(v); navigate(`/life/social?view=${v}`, { replace: true }); };

  const load = async () => {
    try {
      const [contacts, emails, whatsapps, events, plans, blocks, opportunities, intentions, insights, moments] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 200).catch(() => []),
        base44.entities.Email.list("-timestamp", 100).catch(() => []),
        base44.entities.WhatsAppMessage.list("-timestamp", 150).catch(() => []),
        base44.entities.CalendarEvent.list("start", 200).catch(() => []),
        base44.entities.SocialPlan.list("-created_date", 80).catch(() => []),
        base44.entities.PersonalTimeBlock.list("-start", 50).catch(() => []),
        base44.entities.SocialOpportunity.filter({ status: "open" }).catch(() => []),
        base44.entities.SocialIntention.filter({ status: "open" }).catch(() => []),
        base44.entities.Insight.list("-created_date", 60).catch(() => []),
        base44.entities.SocialMoment.list("-occurred_at", 40).catch(() => []),
      ]);
      setData({
        contacts: contacts || [], emails: emails || [], whatsapps: whatsapps || [], events: events || [],
        plans: plans || [], blocks: blocks || [], opportunities: opportunities || [], intentions: intentions || [],
        insights: (insights || []).filter((i) => (i.source || "").toLowerCase().startsWith("social")),
        moments: moments || [],
      });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsubs = [];
    ["Contact", "SocialPlan", "SocialOpportunity", "SocialIntention", "PersonalTimeBlock", "SocialMoment", "Insight", "WhatsAppMessage", "Approval"].forEach((e) => {
      try { unsubs.push(base44.entities[e].subscribe(load)); } catch { /* ignore */ }
    });
    return () => unsubs.forEach((u) => { try { u && u(); } catch { /* ignore */ } });
  }, []);

  const mi = useMemo(() => meaningfulInteractions({ emails: data.emails, whatsapps: data.whatsapps, events: data.events, days: 7 }), [data.emails, data.whatsapps, data.events]);
  const circle = useMemo(() => closeCircle(data.contacts), [data.contacts]);
  const pulse = useMemo(() => socialPulse(circle), [circle]);
  const attention = pulse.filter((p) => p.overdue);
  const activePlans = data.plans.filter((p) => ["proposed", "planned", "confirmed"].includes(p.status));
  const availableMin = useMemo(() => {
    const today = new Date().toDateString();
    const used = data.blocks.filter((b) => b.start && new Date(b.start).toDateString() === today && b.status !== "cancelled").reduce((s, b) => s + (b.duration_min || 0), 0);
    return Math.max(0, (24 - 6) * 60 - used);
  }, [data.blocks]);
  const state = pulseState({ meaningfulCount: mi.total, activePlans: activePlans.length, openInvitations: data.intentions.length, availableMin });
  const urgentCount = attention.length;

  const SECTION = {
    overview: <OverviewSection data={data} />,
    relationships: <RelationshipsSection contacts={data.contacts} />,
    pulse: <PulseSection data={data} mi={mi} attention={attention} />,
    planner: <PlannerSection data={data} contacts={data.contacts} reload={load} />,
    personaltime: <PersonalTimeSection blocks={data.blocks} reload={load} />,
  };

  return (
    <div className="rounded-[28px] overflow-hidden animate-fade-up" style={{ background: DARK.bg }}>
      <div className="relative px-6 lg:px-9 pt-8 pb-6" style={{ background: `radial-gradient(circle at 15% 0%, rgba(148,146,93,0.16), transparent 55%), ${DARK.bg}` }}>
        <div className="flex items-center gap-2 mb-6">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: LIFE.pistachio }} />
          <span className="text-[10px] uppercase tracking-[0.32em] font-semibold" style={{ color: LIFE.morningDew }}>GIULIA · What Social Life?</span>
        </div>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-white leading-none">
              {mi.total} <span style={{ color: LIFE.pistachio }}>MEANINGFUL</span> <sup className="text-lg text-white/40 font-medium">7d</sup>
            </h1>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/45 mt-2">Interactions · last 7 days · {PULSE_LABEL[state]}</p>
          </div>
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: "rgba(213,226,74,0.14)", border: `1px solid ${LIFE.urgent}55` }}>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: LIFE.urgent }} />
              <span className="text-[11px] font-semibold" style={{ color: LIFE.urgent }}>{urgentCount} needs attention</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-9 flex items-center gap-1 border-b overflow-x-auto" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = view === t.key;
          return (
            <button key={t.key} onClick={() => setView2(t.key)} className="flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors" style={{ borderColor: active ? LIFE.pistachio : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.4)" }}>
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 p-6 lg:p-9 min-h-[640px]">
        <SocialSidebar mi={mi} attention={attention} activePlans={activePlans} />
        <div className="min-h-[560px]">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="h-full">
              {loading ? <div className="h-full min-h-[560px] rounded-[24px] animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} /> : SECTION[view]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}