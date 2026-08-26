import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import StatusBadge from "@/system/components/glass/StatusBadge";
import SocialNav from "@/life/components/social/SocialNav";
import OverviewTab from "@/life/components/social2/OverviewTab";
import PersonDrawer from "@/life/components/social2/PersonDrawer";
import ThingsHandleFullWidget from "@/life/components/social/ThingsHandleFullWidget";
import { closeCircle, socialPulse, meaningfulInteractions, pulseState, PULSE_LABEL } from "@/lib/domainUtils";

const EMPTY = { contacts: [], whatsapps: [], emails: [], events: [], plans: [], opportunities: [], intentions: [], moments: [], blocks: [], checkIn: null };

/* SocialPage3 — kopie van /life/social, maar als één statische, niet-scrollende
   pagina. Korte hero, tabs direct onder de foto, één vaste body-block daaronder.
   Links: Things to Handle (volledige hoogte). Rechts: Overview-inhoud van
   /life/social-2 (scrollbaar van binnen). Andere tabs zijn leeg. */
export default function SocialPage3() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null);

  const load = async () => {
    try {
      const [contacts, whatsapps, emails, events, plans, opportunities, intentions, moments, blocks, checkIns] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 300).catch(() => []),
        base44.entities.WhatsAppMessage.list("-timestamp", 200).catch(() => []),
        base44.entities.Email.list("-timestamp", 150).catch(() => []),
        base44.entities.CalendarEvent.list("start", 200).catch(() => []),
        base44.entities.SocialPlan.list("-created_date", 100).catch(() => []),
        base44.entities.SocialOpportunity.filter({ status: "open" }).catch(() => []),
        base44.entities.SocialIntention.filter({ status: "open" }).catch(() => []),
        base44.entities.SocialMoment.list("-occurred_at", 60).catch(() => []),
        base44.entities.PersonalTimeBlock.list("-start", 80).catch(() => []),
        base44.entities.SelfCheckIn.list("-timestamp", 1).catch(() => []),
      ]);
      setData({ contacts: contacts || [], whatsapps: whatsapps || [], emails: emails || [], events: events || [], plans: plans || [], opportunities: opportunities || [], intentions: intentions || [], moments: moments || [], blocks: blocks || [], checkIn: (checkIns || [])[0] || null });
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsubs = [];
    ["Contact", "WhatsAppMessage", "Email", "CalendarEvent", "SocialPlan", "SocialOpportunity", "SocialIntention", "SocialMoment", "PersonalTimeBlock", "SelfCheckIn"].forEach((e) => {
      try { unsubs.push(base44.entities[e].subscribe(load)); } catch { /* ignore */ }
    });
    return () => unsubs.forEach((u) => { try { u && u(); } catch { /* ignore */ } });
  }, []);

  const circle = useMemo(() => closeCircle(data.contacts, { whatsapps: data.whatsapps, planContactIds: (data.plans || []).flatMap((p) => p.contact_ids || []) }), [data]);
  const mi = useMemo(() => meaningfulInteractions({ emails: data.emails, whatsapps: data.whatsapps, events: data.events, days: 7 }), [data]);
  const attention = useMemo(() => socialPulse(circle).filter((p) => p.overdue), [circle]);
  const activePlans = (data.plans || []).filter((p) => ["proposed", "planned", "confirmed"].includes(p.status));
  const availableMin = useMemo(() => {
    const today = new Date().toDateString();
    const used = (data.blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === today && b.status !== "cancelled").reduce((s, b) => s + (b.duration_min || 0), 0);
    return Math.max(0, (24 - 6) * 60 - used);
  }, [data.blocks]);
  const state = useMemo(() => pulseState({ meaningfulCount: mi.total, activePlans: activePlans.length, openInvitations: (data.intentions || []).length, availableMin }), [mi, activePlans, data.intentions, availableMin]);

  return (
    <div className="h-[calc(100vh-176px)] lg:h-[calc(100vh-184px)] overflow-hidden flex flex-col">
      {/* Hero — korter */}
      <div className="shrink-0 overflow-hidden float-shadow relative h-[20vh] lg:h-[22vh] lg:mx-10 lg:rounded-[24px]">
        <img src={IMAGES.lifeSocialPulse} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-charcoal/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <StatusBadge variant={attention.length ? "urgent" : "active"} className="bg-white/20 border-white/30 text-white">{PULSE_LABEL[state] || "Unknown"}</StatusBadge>
            <span className="hidden lg:inline text-[11px] uppercase tracking-wider text-white/40">·</span>
            <span className="hidden lg:inline text-[11px] uppercase tracking-wider text-white/80">Social</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white tracking-tight drop-shadow-sm">What Social Life?</h1>
          <div className="flex items-center gap-x-4 mt-2 text-xs text-white/80">
            <span className="inline-flex items-center gap-2"><span className="uppercase tracking-wider text-white/50">Meaningful · 7d</span><span className="text-white font-semibold">{mi.total}</span></span>
            {attention.length > 0 && (
              <span className="inline-flex items-center gap-2"><span className="uppercase tracking-wider text-white/50">Needs attention</span><span className="text-white font-semibold">{attention.length}</span></span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs — vast, direct onder de foto */}
      <div className="shrink-0 px-4 lg:px-10 pt-3">
        <SocialNav active={tab} onChange={setTab} variant="top" />
      </div>

      {/* Body block — vult de ruimte tussen tabs en de onderste toolbar */}
      <div className="flex-1 min-h-0 px-4 lg:px-10 pt-4 pb-4">
        <div className="h-full flex gap-4">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-foreground/15 border-t-olive rounded-full animate-spin" /></div>
          ) : tab === "Overview" ? (
            <>
              {/* Links — Things to Handle widget, volledige hoogte, geen scroll */}
              <div className="h-full flex shrink-0">
                <div className="h-full" style={{ aspectRatio: "9 / 16" }}>
                  <ThingsHandleFullWidget />
                </div>
              </div>

              {/* Rechts — Overview-inhoud van /life/social-2, scrollbaar van binnen */}
              <div className="flex-1 min-w-0 h-full overflow-y-auto rounded-2xl glass-1 p-4">
                <OverviewTab data={data} state={state} mi={mi} openPerson={setDrawer} reload={load} />
              </div>
            </>
          ) : (
            <div className="flex-1 h-full flex items-center justify-center text-sm text-muted-foreground">Dit tabblad is leeg</div>
          )}
        </div>
      </div>

      {drawer && <PersonDrawer contact={drawer} whatsapps={data.whatsapps} moments={data.moments} plans={data.plans} onClose={() => setDrawer(null)} onSaved={load} />}
    </div>
  );
}