import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { Sparkles, CalendarHeart, Clock } from "lucide-react";

/** PlannerSection — §7.3/§20 Approval-bridge: 'Stel voor' maakt een
 *  SocialPlan(proposed) waarna socialPlanManagement automatisch een
 *  Approval-concept aanmaakt (verschijnt in Waiting on You). 'Bevestig'
 *  zet het plan op confirmed; de bestaande workflow maakt dan de
 *  CalendarEvent via calendarPropagation. */
export default function PlannerSection({ data, contacts = [], reload }) {
  const [busyId, setBusyId] = useState(null);
  const contactName = (id) => contacts.find((c) => c.id === id)?.name || "—";

  const propose = async (o) => {
    setBusyId(o.id);
    try {
      const plan = await base44.entities.SocialPlan.create({
        contact_ids: o.contact_id ? [o.contact_id] : [],
        activity: (o.title || "Meet up").replace(/^Reconnect with /, "Meet "),
        status: "proposed",
        source: "opportunity",
        source_opportunity_id: o.id,
        suggested_date: o.suggested_window_start || new Date(Date.now() + 2 * 86400000).toISOString(),
      });
      await base44.functions.invoke("socialPlanManagement", { plan_id: plan.id }).catch(() => null);
      await reload();
    } finally { setBusyId(null); }
  };

  const confirm = async (p) => {
    setBusyId(p.id);
    try { await base44.entities.SocialPlan.update(p.id, { status: "confirmed" }); await reload(); }
    finally { setBusyId(null); }
  };

  const openPlans = (data.plans || []).filter((p) => p.status === "planned" || p.status === "proposed");
  const confirmedPlans = (data.plans || []).filter((p) => p.status === "confirmed");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <GlassPanel level={2} className="p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Opportunities</p>
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {(data.opportunities || []).length ? data.opportunities.map((o) => (
            <div key={o.id} className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-olive shrink-0" /><p className="text-sm font-medium truncate flex-1">{o.title}</p></div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{o.reasoning}</p>
              <GlassButton variant="primary" size="sm" className="mt-2" onClick={() => propose(o)} disabled={busyId === o.id}>
                {busyId === o.id ? "Stellen voor…" : "Stel voor"}
              </GlassButton>
            </div>
          )) : <p className="text-sm text-muted-foreground italic">No opportunities right now.</p>}
        </div>
      </GlassPanel>

      <GlassPanel level={2} className="p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Open plans</p>
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 mb-4">
          {openPlans.length ? openPlans.map((p) => (
            <div key={p.id} className="rounded-xl bg-muted/40 p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.activity}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{(p.contact_ids || []).map(contactName).join(", ")} · {p.status}</p>
              </div>
              <button onClick={() => confirm(p)} disabled={busyId === p.id} className="text-[10px] uppercase font-semibold text-olive shrink-0">Bevestig</button>
            </div>
          )) : <p className="text-sm text-muted-foreground italic">No open plans.</p>}
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Confirmed</p>
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {confirmedPlans.length ? confirmedPlans.map((p) => (
            <div key={p.id} className="rounded-xl bg-muted/40 p-3 flex items-center gap-2">
              <CalendarHeart className="h-3.5 w-3.5 text-olive shrink-0" />
              <span className="text-sm truncate flex-1">{p.activity}</span>
              <span className="text-[10px] text-muted-foreground">{p.suggested_date ? new Date(p.suggested_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</span>
            </div>
          )) : <p className="text-sm text-muted-foreground italic">Nothing confirmed yet.</p>}
        </div>
      </GlassPanel>
    </div>
  );
}