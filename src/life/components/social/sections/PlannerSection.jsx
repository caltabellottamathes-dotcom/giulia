import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import { Sparkles, CalendarHeart, Clock } from "lucide-react";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** PlannerSection — §4 what should happen: intentions, opportunities,
 *  proposed/confirmed plans and the coming week's social load. */
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

  const planIntention = async (intention) => {
    setBusyId(intention.id);
    try {
      const plan = await base44.entities.SocialPlan.create({
        contact_ids: intention.contact_id ? [intention.contact_id] : [],
        activity: intention.description,
        status: "proposed",
        source: "intention",
      });
      await base44.entities.SocialIntention.update(intention.id, { status: "acted", social_plan_id: plan.id });
      await reload();
    } finally { setBusyId(null); }
  };

  const confirm = async (p) => {
    setBusyId(p.id);
    try { await base44.entities.SocialPlan.update(p.id, { status: "confirmed" }); await reload(); }
    finally { setBusyId(null); }
  };
  const dismiss = async (p) => {
    setBusyId(p.id);
    try { await base44.entities.SocialPlan.update(p.id, { status: "cancelled" }); await reload(); }
    finally { setBusyId(null); }
  };

  const openPlans = (data.plans || []).filter((p) => p.status === "planned" || p.status === "proposed");
  const confirmedPlans = (data.plans || []).filter((p) => p.status === "confirmed");

  const load = useMemo(() => {
    const now = new Date();
    const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const start = new Date(now); start.setDate(now.getDate() - dow); start.setHours(0, 0, 0, 0);
    const buckets = Array.from({ length: 7 }, () => 0);
    [...(data.plans || []).filter((p) => ["planned", "proposed", "confirmed"].includes(p.status)), ...(data.events || []).filter((e) => e.domain === "life")].forEach((item) => {
      const ts = item.suggested_date || item.start;
      if (!ts) return;
      const idx = Math.floor((new Date(ts) - start) / 86400000);
      if (idx >= 0 && idx < 7) buckets[idx]++;
    });
    return buckets;
  }, [data.plans, data.events]);
  const maxLoad = Math.max(1, ...load);

  return (
    <div className="space-y-4">
      {(data.intentions || []).length > 0 && (
        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Social Intentions</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {data.intentions.map((i) => (
              <div key={i.id} className="shrink-0 w-52 rounded-2xl bg-muted/40 p-3.5">
                <p className="text-sm font-medium leading-snug">{i.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1 capitalize">{i.kind.replace(/_/g, " ")} · no date yet</p>
                <GlassButton variant="primary" size="sm" className="mt-2" disabled={busyId === i.id} onClick={() => planIntention(i)}>
                  {busyId === i.id ? "Planning…" : "Plan"}
                </GlassButton>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      <GlassPanel level={2} className="p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Social Load · this week</p>
        <div className="flex items-end gap-2 h-14">
          {load.map((v, i) => (
            <div key={DOW[i]} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full rounded-md bg-muted overflow-hidden flex items-end" style={{ height: 40 }}>
                <div className="w-full rounded-md bg-olive/60" style={{ height: `${Math.max(6, (v / maxLoad) * 100)}%` }} />
              </div>
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{DOW[i]}</span>
            </div>
          ))}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassPanel level={2} className="p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Opportunities</p>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Proposed & open plans</p>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 mb-4">
            {openPlans.length ? openPlans.map((p) => (
              <div key={p.id} className="rounded-xl bg-muted/40 p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.activity}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{(p.contact_ids || []).map(contactName).join(", ")} · {p.status}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => confirm(p)} disabled={busyId === p.id} className="text-[10px] uppercase font-semibold text-olive">Confirm</button>
                  <button onClick={() => dismiss(p)} disabled={busyId === p.id} className="text-[10px] uppercase font-semibold text-muted-foreground">Dismiss</button>
                </div>
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
    </div>
  );
}