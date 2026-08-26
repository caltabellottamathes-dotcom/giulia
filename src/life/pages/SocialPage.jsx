import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { GlassSurfaceProvider } from "@/lib/GlassSurfaceContext";
import { IMAGES } from "@/lib/images";
import SocialHeader from "@/life/components/social/SocialHeader";
import SocialNav from "@/life/components/social/SocialNav";
import OverviewSection from "@/life/components/social/sections/OverviewSection";
import RelationshipsSection from "@/life/components/social/sections/RelationshipsSection";
import PulseSection from "@/life/components/social/sections/PulseSection";
import PlannerSection from "@/life/components/social/sections/PlannerSection";
import PersonalTimeSection from "@/life/components/social/sections/PersonalTimeSection";
import PersonDetailDrawer from "@/life/components/social/PersonDetailDrawer";
import { closeCircle, socialPulse, meaningfulInteractions, pulseState, personalBaseline, capacityFromCheckIn } from "@/lib/domainUtils";

const EMPTY = { contacts: [], emails: [], whatsapps: [], events: [], plans: [], blocks: [], opportunities: [], intentions: [], insights: [], moments: [], checkIn: null };

export default function SocialPage() {
  const photoRef = useRef(null);
  const [section, setSection] = useState("Overview");
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [drawerContact, setDrawerContact] = useState(null);

  const reload = async () => {
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
      setData({ contacts: contacts || [], emails: emails || [], whatsapps: whatsapps || [], events: events || [], plans: plans || [], blocks: blocks || [], opportunities: opportunities || [], intentions: intentions || [], insights: (insights || []).filter((i) => (i.source || "").toLowerCase().startsWith("social")), moments: moments || [], checkIn: (checkIns || [])[0] || null });
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);
  useEffect(() => {
    const unsubs = [];
    ["Contact", "SocialPlan", "SocialOpportunity", "SocialIntention", "PersonalTimeBlock", "WhatsAppMessage", "Email", "CalendarEvent", "SelfCheckIn", "SocialMoment"].forEach((e) => { try { unsubs.push(base44.entities[e].subscribe(reload)); } catch { /* ignore */ } });
    return () => unsubs.forEach((u) => { try { u && u(); } catch { /* ignore */ } });
  }, []);

  const d = data;
  const mi = useMemo(() => meaningfulInteractions({ emails: d.emails, whatsapps: d.whatsapps, events: d.events, days: 7 }), [d.emails, d.whatsapps, d.events]);
  const planContactIds = useMemo(() => (d.plans || []).flatMap((p) => p.contact_ids || []), [d.plans]);
  const circle = useMemo(() => closeCircle(d.contacts, { whatsapps: d.whatsapps, planContactIds }), [d.contacts, d.whatsapps, planContactIds]);
  const pulse = useMemo(() => socialPulse(circle), [circle]);
  const attention = pulse.filter((p) => p.overdue);
  const activePlans = (d.plans || []).filter((p) => ["proposed", "planned", "confirmed"].includes(p.status));
  const availableMin = useMemo(() => { const today = new Date().toDateString(); const used = (d.blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === today && b.status !== "cancelled").reduce((s, b) => s + (b.duration_min || 0), 0); return Math.max(0, (24 - 6) * 60 - used); }, [d.blocks]);
  const baseline = useMemo(() => personalBaseline({ whatsapps: d.whatsapps, emails: d.emails, events: d.events, weeks: 6 }), [d.whatsapps, d.emails, d.events]);
  const state = useMemo(() => pulseState({ meaningfulCount: mi.total, activePlans: activePlans.length, openInvitations: (d.intentions || []).length, availableMin, baselineWeekly: baseline.baseline }), [mi.total, activePlans.length, d.intentions, availableMin, baseline.baseline]);
  const capacity = useMemo(() => capacityFromCheckIn(d.checkIn), [d.checkIn]);

  const props = { d, mi, circle, pulse, attention, activePlans, state, checkIn: d.checkIn, capacity, availableMin, onOpenPerson: setDrawerContact, reload };
  const Section = { Overview: OverviewSection, Relationships: RelationshipsSection, Pulse: PulseSection, Planner: PlannerSection, "Personal Time": PersonalTimeSection }[section];

  return (
    <div className="relative min-h-screen">
      <img ref={photoRef} src={IMAGES.lifeSocialPulse} alt="" className="fixed inset-0 w-full h-full object-cover" draggable={false} />
      <div className="fixed inset-0" style={{ background: "linear-gradient(180deg, rgba(38,40,44,0.55), rgba(38,40,44,0.84))" }} />
      <GlassSurfaceProvider photoRef={photoRef}>
        <div className="relative z-10">
          <SocialHeader mi={mi} state={state} urgentCount={attention.length} />
          <div className="px-4 lg:px-8 pt-1 pb-28 space-y-4">
            <div className="hidden lg:block"><SocialNav active={section} onChange={setSection} variant="top" dark /></div>
            {loading ? (
              <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" /></div>
            ) : (
              <Section {...props} />
            )}
          </div>
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-30" style={{ background: "rgba(30,32,35,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            <SocialNav active={section} onChange={setSection} variant="bottom" dark />
          </div>
        </div>
      </GlassSurfaceProvider>
      {drawerContact && <PersonDetailDrawer contact={drawerContact} onClose={() => setDrawerContact(null)} reload={reload} />}
    </div>
  );
}