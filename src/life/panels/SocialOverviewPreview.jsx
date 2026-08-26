import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { AnimatedRing, PulseWave } from "@/glass/components/modules/viz";
import { base44 } from "@/api/base44Client";
import { meaningfulInteractions, closeCircle, pulseState, PULSE_LABEL } from "@/lib/domainUtils";
import { Heart, CalendarHeart, Sparkles } from "lucide-react";

const LIGHT = "#d8dab3";

/** SocialOverviewPreview — §14.1 OVERVIEW-tab: het complete Social-systeem in
 *  één blik (pulse state, wie aandacht kan gebruiken, plannen, ruimte, kansen). */
export default function SocialOverviewPreview({ onOpen }) {
  const [contacts, setContacts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [plans, setPlans] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [intentions, setIntentions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, e, w, p, b, o, i] = await Promise.all([
          base44.entities.Contact.filter({}, "name", 150).catch(() => []),
          base44.entities.Email.list("-timestamp", 100).catch(() => []),
          base44.entities.WhatsAppMessage.list("-timestamp", 150).catch(() => []),
          base44.entities.SocialPlan.list("-created_date", 60).catch(() => []),
          base44.entities.PersonalTimeBlock.list("-start", 40).catch(() => []),
          base44.entities.SocialOpportunity.filter({ status: "open" }).catch(() => []),
          base44.entities.SocialIntention.filter({ status: "open" }).catch(() => []),
        ]);
        setContacts(c || []); setEmails(e || []); setWhatsapps(w || []); setPlans(p || []); setBlocks(b || []); setOpportunities(o || []); setIntentions(i || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const mi = useMemo(() => meaningfulInteractions({ emails, whatsapps, days: 7 }), [emails, whatsapps]);
  const activePlans = (plans || []).filter((p) => ["proposed", "planned", "confirmed"].includes(p.status));
  const availableMin = useMemo(() => {
    const today = new Date().toDateString();
    const used = (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === today && b.status !== "cancelled").reduce((s, b) => s + (b.duration_min || 0), 0);
    return Math.max(0, (24 - 6) * 60 - used);
  }, [blocks]);
  const pulse = pulseState({ meaningfulCount: mi.total, activePlans: activePlans.length, openInvitations: intentions.length, availableMin });
  const important = useMemo(() => closeCircle(contacts).filter((c) => ["QUIETER_THAN_USUAL", "QUIET", "RECONNECTING"].includes(c.relationship_state)).slice(0, 3), [contacts]);

  return (
    <PreviewShell index="00" section="OVERVIEW" statement={PULSE_LABEL[pulse]} kicker={`${mi.total} MEANINGFUL \u00b7 ${activePlans.length} PLANS \u00b7 ${intentions.length} OPEN`} accent={LIGHT}
      context={[
        { label: "PEOPLE", text: important.length ? `${important.map((c) => c.name).join(", ")} could use attention.` : "No relationship currently needs attention." },
        { label: "SPACE", text: `${Math.floor(availableMin / 60)}h${availableMin % 60 ? " " + (availableMin % 60) + "m" : ""} available today.` },
        { label: "OPPORTUNITIES", text: opportunities.length ? `${opportunities.length} possibility detected \u2014 not a task.` : "No opportunities surfaced right now." },
      ]}
      actions={[
        { label: "Relationships", to: "/life/social?view=relationships" },
        { label: "Pulse", to: "/life/social?view=pulse" },
        { label: "Planner", primary: true, to: "/life/social?view=planner" },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5 h-full overflow-hidden">
        <div className="flex flex-col gap-4 overflow-auto pr-1">
          <div className="flex flex-col items-center"><AnimatedRing pct={Math.min(100, mi.total * 12)} size={140} color={LIGHT} label={String(mi.total)} sub="MEANINGFUL \u00b7 7D" /></div>
          <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3"><p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">PULSE \u00b7 LIVE</p><PulseWave color={LIGHT} bars={18} height={36} /></div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">WHAT MATTERS RIGHT NOW</p>
          <div className="flex-1 overflow-auto pr-1 space-y-2">
            {loading ? <p className="text-storm/40 text-sm">Loading…</p> : (
              <>
                {important.length ? important.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-marble/20 bg-marble/5 p-3 flex items-center gap-3">
                    <Heart className="w-4 h-4 shrink-0" style={{ color: LIGHT }} />
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-storm truncate">{c.name}</p><p className="text-[10px] text-storm/50">{(c.relationship_state || "unknown").replace(/_/g, " ")}</p></div>
                  </div>
                )) : <p className="text-sm text-storm/55 italic px-1">No relationship currently needs attention.</p>}

                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2 mt-3">UPCOMING PLANS</p>
                {activePlans.length ? activePlans.slice(0, 4).map((p) => (
                  <div key={p.id} onClick={onOpen} className="flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 px-3 py-2.5 cursor-pointer hover:bg-marble/10 transition">
                    <CalendarHeart className="w-3.5 h-3.5 text-storm/50 shrink-0" />
                    <span className="text-sm text-storm flex-1 truncate">{p.activity}</span>
                    <span className="text-[10px] text-storm/40 uppercase">{p.status}</span>
                  </div>
                )) : <p className="text-sm text-storm/45 italic px-1">No active social plans.</p>}

                <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2 mt-3">OPPORTUNITIES</p>
                {opportunities.length ? opportunities.slice(0, 3).map((o) => (
                  <div key={o.id} className="rounded-2xl border border-marble/20 bg-marble/5 p-3">
                    <div className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: LIGHT }} /><p className="text-sm font-semibold text-storm truncate">{o.title}</p></div>
                    <p className="text-[11px] text-storm/55 mt-1 leading-relaxed">{o.reasoning}</p>
                  </div>
                )) : <p className="text-sm text-storm/45 italic px-1">Nothing surfaced \u2014 that's fine.</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}