import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import SocialHeader from "@/life/components/social/SocialHeader";
import SocialNav from "@/life/components/social/SocialNav";
import OverviewSection from "@/life/components/social/sections/OverviewSection";
import RelationshipsSection from "@/life/components/social/sections/RelationshipsSection";
import PulseSection from "@/life/components/social/sections/PulseSection";
import PlannerSection from "@/life/components/social/sections/PlannerSection";
import PersonalTimeSection from "@/life/components/social/sections/PersonalTimeSection";
import PersonDetailDrawer from "@/life/components/social/PersonDetailDrawer";
import { closeCircle, socialPulse, meaningfulInteractions, pulseState } from "@/lib/domainUtils";

const EMPTY = { contacts: [], emails: [], whatsapps: [], events: [], plans: [], blocks: [], opportunities: [], intentions: [], insights: [], moments: [], checkIn: null };

/**
 * SocialPage — "What Social Life?" §14.1, rebuilt on the exact ProjectDetail
 * anatomy (sticky hero photo + horizontal tab-nav + sections underneath),
 * in the OS's own light glass design language — no separate dark theme.
 */
export default function SocialPage() {
  const [section, setSection] = useState("Overview");
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [drawerContact, setDrawerContact] = useState(null);

  const load = async () => {
    try {
      const [contacts, emails, whatsapps, events, plans, blocks, opportunities, intentions, insights, moments, checkIns] = await Promise.all([
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
        base44.entities.SelfCheckIn.list("-timestamp", 1).catch(() => []),
      ]);
      setData({
        contacts: contacts || [], emails: emails || [], whatsapps: whatsapps || [], events: events || [],
        plans: plans || [], blocks: blocks || [], opportunities: opportunities || [], intentions: intentions || [],
        insights: (insights || []).filter((i) => (i.source || "").toLowerCase().startsWith("social")),
        moments: moments || [],
        checkIn: (checkIns || [])[0] || null,
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
  const planContactIds = useMemo(() => data.plans.flatMap((p) => p.contact_ids || []), [data.plans]);
  const circle = useMemo(() => closeCircle(data.contacts, { whatsapps: data.whatsapps, planContactIds }), [data.contacts, data.whatsapps, planContactIds]);
  const pulse = useMemo(() => socialPulse(circle), [circle]);
  const attention = pulse.filter((p) => p.overdue);
  const activePlans = data.plans.filter((p) => ["proposed", "planned", "confirmed"].includes(p.status));
  const availableMin = useMemo(() => {
    const today = new Date().toDateString();
    const used = data.blocks.filter((b) => b.start && new Date(b.start).toDateString() === today && b.status !== "cancelled").reduce((s, b) => s + (b.duration_min || 0), 0);
    return Math.max(0, (24 - 6) * 60 - used);
  }, [data.blocks]);
  const state = pulseState({ meaningfulCount: mi.total, activePlans: activePlans.length, openInvitations: data.intentions.length, availableMin });

  if (loading) return <div className="space-y-4"><div className="h-40 rounded-2xl shimmer" /><div className="h-64 rounded-2xl shimmer" /></div>;

  return (
    <div className="-mt-6 lg:-mt-8">
      <SocialHeader mi={mi} state={state} urgentCount={attention.length} />
      <div className="relative z-10 rounded-t-[28px] mt-[calc(50vh-4.5rem)] lg:mt-[calc(52vh-4.5rem)] px-4 lg:px-6 pt-4 pb-28 space-y-6 min-h-[60vh]">
        <div className="hidden lg:block">
          <SocialNav active={section} onChange={setSection} variant="top" />
        </div>

        {section === "Overview" && <OverviewSection data={data} mi={mi} circle={circle} attention={attention} activePlans={activePlans} state={state} onNavigate={setSection} onOpenPerson={setDrawerContact} reload={load} />}
        {section === "Relationships" && <RelationshipsSection contacts={data.contacts} whatsapps={data.whatsapps} planContactIds={planContactIds} onOpenPerson={setDrawerContact} />}
        {section === "Pulse" && <PulseSection data={data} mi={mi} attention={attention} state={state} />}
        {section === "Planner" && <PlannerSection data={data} contacts={data.contacts} checkIn={data.checkIn} reload={load} />}
        {section === "Personal Time" && <PersonalTimeSection blocks={data.blocks} checkIn={data.checkIn} reload={load} />}
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-2 border-t border-border/40">
        <SocialNav active={section} onChange={setSection} variant="bottom" />
      </div>

      <PersonDetailDrawer contact={drawerContact} whatsapps={data.whatsapps} onClose={() => setDrawerContact(null)} onUpdated={load} />
    </div>
  );
}