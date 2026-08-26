import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { LIFE, DARK } from "../socialColors";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <div className="rounded-[24px] p-5" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        <p className="text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: LIFE.morningDew }}>Opportunities</p>
        <div className="space-y-2 max-h-[480px] overflow-auto pr-1">
          {(data.opportunities || []).length ? data.opportunities.map((o) => (
            <div key={o.id} className="rounded-xl p-3" style={{ background: DARK.cardSoft }}>
              <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: LIFE.pistachio }} /><p className="text-white text-sm font-medium truncate flex-1">{o.title}</p></div>
              <p className="text-white/45 text-[11px] mt-1 leading-relaxed">{o.reasoning}</p>
              <button onClick={() => propose(o)} disabled={busyId === o.id} className="mt-2 text-[11px] font-semibold rounded-full px-3 py-1.5 disabled:opacity-40" style={{ background: LIFE.pistachio, color: "#141414" }}>
                {busyId === o.id ? "Stellen voor…" : "Stel voor"}
              </button>
            </div>
          )) : <p className="text-white/35 text-sm italic">No opportunities right now.</p>}
        </div>
      </div>

      <div className="rounded-[24px] p-5" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        <p className="text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: LIFE.morningDew }}>Open plans</p>
        <div className="space-y-2 max-h-[220px] overflow-auto pr-1 mb-4">
          {openPlans.length ? openPlans.map((p) => (
            <div key={p.id} className="rounded-xl p-3 flex items-center justify-between gap-2" style={{ background: DARK.cardSoft }}>
              <div className="min-w-0">
                <p className="text-white text-sm truncate">{p.activity}</p>
                <p className="text-white/40 text-[10px] flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{(p.contact_ids || []).map(contactName).join(", ")} · {p.status}</p>
              </div>
              <button onClick={() => confirm(p)} disabled={busyId === p.id} className="text-[10px] uppercase font-semibold shrink-0" style={{ color: LIFE.pistachio }}>Bevestig</button>
            </div>
          )) : <p className="text-white/35 text-sm italic">No open plans.</p>}
        </div>
        <p className="text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: LIFE.morningDew }}>Confirmed</p>
        <div className="space-y-2 max-h-[180px] overflow-auto pr-1">
          {confirmedPlans.length ? confirmedPlans.map((p) => (
            <div key={p.id} className="rounded-xl p-3 flex items-center gap-2" style={{ background: DARK.cardSoft }}>
              <CalendarHeart className="h-3.5 w-3.5 shrink-0" style={{ color: LIFE.pistachio }} />
              <span className="text-white text-sm truncate flex-1">{p.activity}</span>
              <span className="text-white/40 text-[10px]">{p.suggested_date ? new Date(p.suggested_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</span>
            </div>
          )) : <p className="text-white/35 text-sm italic">Nothing confirmed yet.</p>}
        </div>
      </div>
    </div>
  );
}