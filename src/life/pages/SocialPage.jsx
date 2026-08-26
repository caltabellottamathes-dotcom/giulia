import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import StatusBadge from "@/system/components/glass/StatusBadge";
import SocialNav from "@/life/components/social/SocialNav";
import SocialOverviewDark from "@/life/components/social/sections/SocialOverviewDark";
import ThingsHandleFullWidget from "@/life/components/social/ThingsHandleFullWidget";
import { closeCircle, socialPulse, meaningfulInteractions, pulseState, PULSE_LABEL } from "@/lib/domainUtils";

const EMPTY = { contacts: [], whatsapps: [], emails: [], events: [], plans: [], opportunities: [], intentions: [], moments: [], blocks: [], checkIn: null };

/* SocialPage — één statische, niet-scrollende pagina.
   Hero: fixed top-0, raakt de bovenrand van het scherm (onder de transparante
   OS-header), links uitgelijnd met de toolbar (left-4 / lg:left-6).
   Tabs: vast, direct onder de hero.
   Body-block: links de Things to Handle-widget op volledige hoogte (uitgelijnd
   met de hero en de toolbar), rechts een lichte glaskaart met schaduw die de
   originele /life/social overview-inhoud (OverviewSection) bevat — alleen die
   inhoud scrollt, de pagina zelf niet. */
export default function SocialPage() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

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
    <div className="relative h-[calc(100vh-132px)] -mt-6 lg:-mt-8 -mx-1 lg:-mx-4 flex flex-col pt-[124px] lg:pt-[144px]">
      {/* Hero — fixed, raakt de bovenrand (y=0, onder de transparante header), links uitgelijnd met de toolbar */}
      <div className="fixed top-0 left-4 lg:left-6 right-4 lg:right-6 h-[180px] lg:h-[200px] z-0 overflow-hidden float-shadow rounded-[24px]">
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

      {/* Tabs — vast, direct onder de hero, links uitgelijnd met de toolbar */}
      <div className="shrink-0 pt-3 relative z-10">
        <SocialNav active={tab} onChange={setTab} variant="top" />
      </div>

      {/* Body block — vult de ruimte tussen tabs en de onderste toolbar */}
      <div className="flex-1 min-h-0 pt-3 pb-6 relative z-10">
        <div className="h-full flex gap-4">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-foreground/15 border-t-olive rounded-full animate-spin" /></div>
          ) : tab === "Overview" ? (
            <>
              {/* Links — Things to Handle, volledige hoogte, uitgelijnd met de hero en toolbar */}
              <div className="h-full flex shrink-0">
                <div className="h-full rounded-[24px] overflow-hidden" style={{ aspectRatio: "9 / 16", boxShadow: "0 24px 56px -16px rgba(0,0,0,0.32), 0 8px 24px -8px rgba(0,0,0,0.18)" }}>
                  <ThingsHandleFullWidget />
                </div>
              </div>

              {/* Rechts — donkere glaskaart met schaduw, originele /life/social SocialOverviewPreview-panel */}
              <div
                className="flex-1 min-w-0 h-full overflow-y-auto rounded-2xl p-4"
                style={{
                  background: "rgba(40,42,46,0.45)",
                  backdropFilter: "blur(40px) saturate(1.5)",
                  WebkitBackdropFilter: "blur(40px) saturate(1.5)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  boxShadow: "0 24px 56px -16px rgba(0,0,0,0.34), 0 8px 24px -8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.22)",
                }}
              >
                <SocialOverviewDark data={data} mi={mi} circle={circle} attention={attention} activePlans={activePlans} state={state} onNavigate={setTab} />
              </div>
            </>
          ) : (
            <div className="flex-1 h-full flex items-center justify-center text-sm text-muted-foreground">Dit tabblad is leeg</div>
          )}
        </div>
      </div>

    </div>
  );
}