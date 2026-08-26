import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import OverviewTab from "@/life/components/social2/OverviewTab";
import RelationshipsTab from "@/life/components/social2/RelationshipsTab";
import PulseTab from "@/life/components/social2/PulseTab";
import PlannerTab from "@/life/components/social2/PlannerTab";
import PersonalTimeTab from "@/life/components/social2/PersonalTimeTab";
import PersonDrawer from "@/life/components/social2/PersonDrawer";
import { cn } from "@/lib/utils";
import { closeCircle, socialPulse, meaningfulInteractions, pulseState, PULSE_LABEL } from "@/lib/domainUtils";

const TABS = [
  { key: "overview", label: "Overview", sub: "The whole social system", Comp: OverviewTab },
  { key: "relationships", label: "Relationships", sub: "Who matters?", Comp: RelationshipsTab },
  { key: "pulse", label: "Pulse", sub: "What's happening?", Comp: PulseTab },
  { key: "planner", label: "Planner", sub: "What could happen?", Comp: PlannerTab },
  { key: "personaltime", label: "Personal Time", sub: "Do I have space?", Comp: PersonalTimeTab },
];

const EMPTY = { contacts: [], whatsapps: [], emails: [], events: [], plans: [], opportunities: [], intentions: [], moments: [], blocks: [], checkIn: null };

/* SocialPage2 — "What Social Life?" as a living visual system.
   One shared data layer feeds the four layers; GIULIA sits above.
   Built fresh from the architecture + visual specification. */

export default function SocialPage2() {
  const [tab, setTab] = useState("overview");
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

  const Active = TABS.find((t) => t.key === tab)?.Comp || OverviewTab;

  return (
    <div className="min-h-screen pb-24 lg:pb-12">
      {/* Hero */}
      <header className="px-4 lg:px-8 pt-6 lg:pt-10 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">GIULIA OS · LIFE / SOCIAL</p>
            <h1 className="font-display font-bold tracking-tight text-4xl lg:text-6xl mt-2">What Social Life?</h1>
            <p className="text-sm text-muted-foreground max-w-xl mt-3 leading-relaxed">A living visualisation of your social world — relationships, pulse, plans and personal time, connected as one system.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span className="uppercase tracking-wider">Meaningful · 7d</span><span className="font-display font-bold text-base text-foreground tabular-nums">{mi.total}</span></span>
              <span className="inline-flex items-center gap-2"><span className="uppercase tracking-wider">Active plans</span><span className="font-display font-bold text-base text-foreground tabular-nums">{activePlans.length}</span></span>
              {attention.length > 0 && <span className="inline-flex items-center gap-2"><span className="uppercase tracking-wider">Needs attention</span><span className="font-display font-bold text-base text-urgent tabular-nums">{attention.length}</span></span>}
            </div>
          </div>
          <div className="glass rounded-2xl p-6 flex flex-col items-center lg:items-end float-shadow">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Social state</p>
            <div className="font-display font-bold tracking-tight text-3xl lg:text-4xl" style={{ color: state === "OVERLOADED" ? "hsl(var(--urgent))" : "hsl(var(--olive))" }}>{PULSE_LABEL[state] || "UNKNOWN"}</div>
            <div className="flex gap-1.5 mt-2">
              {Array.from({ length: 7 }).map((_, i) => <span key={i} className="w-2 h-2 rounded-full" style={{ background: i < Math.min(7, mi.total) ? "hsl(var(--olive))" : "hsl(var(--foreground) / 0.16)" }} />)}
            </div>
          </div>
        </div>
        <span className="h-px block bg-foreground/15 mt-6" />
      </header>

      {/* Tabs */}
      <nav className="sticky top-0 z-20 bg-background/85 backdrop-blur-md border-b border-foreground/10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("whitespace-nowrap px-4 py-3 border-b-2 -mb-px transition-colors", tab === t.key ? "border-olive text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <span className="text-sm">{t.label}</span>
              <span className="hidden lg:inline text-[10px] uppercase tracking-wide ml-2 text-muted-foreground">{t.sub}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Active tab */}
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-2 border-foreground/15 border-t-olive rounded-full animate-spin" /></div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Active data={data} state={state} mi={mi} openPerson={setDrawer} reload={load} checkIn={data.checkIn} contacts={data.contacts} />
          </motion.div>
        )}
      </main>

      {drawer && <PersonDrawer contact={drawer} whatsapps={data.whatsapps} moments={data.moments} plans={data.plans} onClose={() => setDrawer(null)} onSaved={load} />}
    </div>
  );
}