import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SocialHeader from "@/life/components/social/SocialHeader";
import SocialNav from "@/life/components/social/SocialNav";
import SocialOverviewPreview from "@/life/panels/SocialOverviewPreview";
import RelationshipsPreview from "@/life/panels/RelationshipsPreview";
import SocialPulsePreview from "@/life/panels/SocialPulsePreview";
import SocialPlannerPreview from "@/life/panels/SocialPlannerPreview";
import PersonalTimePreview from "@/life/panels/PersonalTimePreview";
import { closeCircle, socialPulse, meaningfulInteractions, pulseState } from "@/lib/domainUtils";

const EMPTY = { contacts: [], emails: [], whatsapps: [], events: [], plans: [], blocks: [], intentions: [] };

const VIEWS = [
  { key: "Overview", view: "overview", Comp: SocialOverviewPreview },
  { key: "Relationships", view: "relationships", Comp: RelationshipsPreview },
  { key: "Pulse", view: "pulse", Comp: SocialPulsePreview },
  { key: "Planner", view: "planner", Comp: SocialPlannerPreview },
  { key: "Personal Time", view: "personaltime", Comp: PersonalTimePreview },
];

const normalizeView = (v) => {
  const s = (v || "").toLowerCase().replace(/[\s-]/g, "");
  if (s === "socialpulse" || s === "pulse") return "pulse";
  if (s === "socialplanner" || s === "planner") return "planner";
  if (s === "socialtime" || s === "personaltime" || s === "personaltime") return "personaltime";
  if (s === "relationships") return "relationships";
  return "overview";
};

/**
 * SocialPage — "What Social Life?" §14.1. Renders the canonical OS Social
 * previews (L02) per tab inside a dark glass surface, so the page speaks the
 * exact same language as every other panel in the OS. Tab state lives in the
 * `?view=` URL param, which the previews' own action buttons already target.
 */
export default function SocialPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const view = normalizeView(params.get("view"));
  const activeKey = (VIEWS.find((v) => v.view === view) || VIEWS[0]).key;
  const ActiveComp = (VIEWS.find((v) => v.view === view) || VIEWS[0]).Comp;

  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [contacts, emails, whatsapps, events, plans, blocks, intentions] = await Promise.all([
        base44.entities.Contact.filter({}, "name", 200).catch(() => []),
        base44.entities.Email.list("-timestamp", 100).catch(() => []),
        base44.entities.WhatsAppMessage.list("-timestamp", 150).catch(() => []),
        base44.entities.CalendarEvent.list("start", 200).catch(() => []),
        base44.entities.SocialPlan.list("-created_date", 80).catch(() => []),
        base44.entities.PersonalTimeBlock.list("-start", 50).catch(() => []),
        base44.entities.SocialIntention.filter({ status: "open" }).catch(() => []),
      ]);
      setData({ contacts: contacts || [], emails: emails || [], whatsapps: whatsapps || [], events: events || [], plans: plans || [], blocks: blocks || [], intentions: intentions || [] });
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsubs = [];
    ["Contact", "SocialPlan", "SocialOpportunity", "SocialIntention", "PersonalTimeBlock", "WhatsAppMessage", "Email", "CalendarEvent"].forEach((e) => {
      try { unsubs.push(base44.entities[e].subscribe(load)); } catch { /* ignore */ }
    });
    return () => unsubs.forEach((u) => { try { u && u(); } catch { /* ignore */ } });
  }, []);

  const mi = useMemo(() => meaningfulInteractions({ emails: data.emails, whatsapps: data.whatsapps, events: data.events, days: 7 }), [data.emails, data.whatsapps, data.events]);
  const activePlans = data.plans.filter((p) => ["proposed", "planned", "confirmed"].includes(p.status));
  const availableMin = useMemo(() => {
    const today = new Date().toDateString();
    const used = data.blocks.filter((b) => b.start && new Date(b.start).toDateString() === today && b.status !== "cancelled").reduce((s, b) => s + (b.duration_min || 0), 0);
    return Math.max(0, (24 - 6) * 60 - used);
  }, [data.blocks]);
  const pulse = useMemo(() => socialPulse(closeCircle(data.contacts)), [data.contacts]);
  const attention = pulse.filter((p) => p.overdue);
  const state = pulseState({ meaningfulCount: mi.total, activePlans: activePlans.length, openInvitations: data.intentions.length, availableMin });

  const setView = (key) => setParams({ view: (VIEWS.find((v) => v.key === key) || VIEWS[0]).view }, { replace: true });

  return (
    <div className="-mt-6 lg:-mt-8">
      <SocialHeader mi={mi} state={state} urgentCount={attention.length} />
      <div className="relative z-10 rounded-t-[28px] mt-[calc(50vh-4.5rem)] lg:mt-[calc(52vh-4.5rem)] px-4 lg:px-6 pt-4 pb-28 space-y-5 min-h-[60vh]">
        <div className="hidden lg:block">
          <SocialNav active={activeKey} onChange={setView} variant="top" />
        </div>

        {/* Dark glass surface — the previews use near-white (text-storm) ink,
            so they need a dark panel to read, exactly like the OS module panel. */}
        <div
          className="rounded-[28px] p-6 lg:p-8 min-h-[64vh] flex"
          style={{
            background: "rgba(30,32,35,0.78)",
            backdropFilter: "blur(44px) saturate(1.4)",
            WebkitBackdropFilter: "blur(44px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.10), 0 24px 60px -28px rgba(0,0,0,0.55)",
          }}
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <ActiveComp onOpen={() => navigate("/people")} />
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-2 border-t border-border/40">
        <SocialNav active={activeKey} onChange={setView} variant="bottom" />
      </div>
    </div>
  );
}