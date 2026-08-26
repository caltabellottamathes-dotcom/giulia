import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import SocialPlanBoard from "../SocialPlanBoard";
import OpportunityDiagram from "../v2/OpportunityDiagram";
import { CountUp, SectionLabel, EmptyState, StatusPill } from "../v2/primitives";
import { Check, X } from "lucide-react";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const INTENTION_KINDS = ["see_someone", "call", "reconnect", "invite", "respond", "spend_time", "protect_time", "alone_time", "spontaneous"];

/** PlannerSection v2 — §4 de afstand tussen willen en gepland: intentions,
 *  opportunity field, proposed plans, drag&drop board, calendar overlay, load. */
export default function PlannerSection({ data, contacts = [], checkIn, reload }) {
  const [busyId, setBusyId] = useState(null);

  const propose = async (o) => {
    setBusyId(o.id);
    try {
      const plan = await base44.entities.SocialPlan.create({ contact_ids: o.contact_id ? [o.contact_id] : [], activity: (o.title || "Meet up").replace(/^Reconnect with /, "Meet "), status: "proposed", source: "opportunity", source_opportunity_id: o.id, suggested_date: o.suggested_window_start || new Date(Date.now() + 2 * 86400000).toISOString() });
      await base44.functions.invoke("socialPlanManagement", { plan_id: plan.id }).catch(() => null);
      await reload();
    } finally { setBusyId(null); }
  };
  const planIntention = async (i) => {
    setBusyId(i.id);
    try {
      const plan = await base44.entities.SocialPlan.create({ contact_ids: i.contact_id ? [i.contact_id] : [], activity: i.description, status: "proposed", source: "intention" });
      await base44.entities.SocialIntention.update(i.id, { status: "acted", social_plan_id: plan.id });
      await reload();
    } finally { setBusyId(null); }
  };
  const confirmPlan = async (p) => { setBusyId(p.id); try { await base44.entities.SocialPlan.update(p.id, { status: "confirmed", confirmed_at: new Date().toISOString() }); await base44.functions.invoke("socialPlanManagement", { plan_id: p.id }).catch(() => null); await reload(); } finally { setBusyId(null); } };
  const dismissPlan = async (p) => { setBusyId(p.id); try { await base44.entities.SocialPlan.update(p.id, { status: "cancelled" }); await reload(); } finally { setBusyId(null); } };

  const boardPlans = (data.plans || []).filter((p) => ["proposed", "planned", "confirmed"].includes(p.status));
  const proposed = boardPlans.filter((p) => p.status === "proposed");

  // 4.2 opportunity: combineer top opportunity + attention + available space
  const oppPerson = useMemo(() => {
    const attention = (data.opportunities || []).find((o) => o.contact_id);
    const contact = attention ? (contacts.find((c) => c.id === attention.contact_id) || null) : null;
    return { opportunity: attention || (data.opportunities || [])[0] || null, contact };
  }, [data.opportunities, contacts]);

  // 4.6 social load deze week
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

  // 4.5 calendar overlay — uren per dag deze week
  const weekGrid = useMemo(() => {
    const now = new Date();
    const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const start = new Date(now); start.setDate(now.getDate() - dow); start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, d) => {
      const day = new Date(start); day.setDate(start.getDate() + d);
      const dayEvents = (data.events || []).filter((e) => e.domain === "life" && new Date(e.start).toDateString() === day.toDateString());
      const dayPlans = (data.plans || []).filter((p) => ["planned", "confirmed"].includes(p.status) && p.suggested_date && new Date(p.suggested_date).toDateString() === day.toDateString());
      return { day, events: dayEvents, plans: dayPlans };
    });
  }, [data.events, data.plans]);

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-4">
      {/* 4.1 INTENTIONS */}
      {(data.intentions || []).length > 0 && (
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-3">Social Intentions</SectionLabel>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {data.intentions.map((i, idx) => (
                <motion.div key={i.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} className="shrink-0 w-52 rounded-2xl glass-1 p-4 flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-olive mb-1">{i.kind.replace(/_/g, " ")}</span>
                  <p className="text-sm font-medium leading-snug flex-1">{i.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">no date yet</p>
                  <GlassButton variant="primary" size="sm" className="mt-3" disabled={busyId === i.id} onClick={() => planIntention(i)}>{busyId === i.id ? "Planning…" : "Plan"}</GlassButton>
                </motion.div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* 4.2 OPPORTUNITY FIELD */}
      {oppPerson.opportunity && (
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-6">
            <SectionLabel className="mb-4">Opportunity Field · Connected Signals</SectionLabel>
            <OpportunityDiagram
              person={oppPerson.contact}
              personState={oppPerson.contact?.relationship_state || "UNKNOWN"}
              lastContactDays={oppPerson.contact ? Math.round((Date.now() - new Date(oppPerson.contact.last_contact_date).getTime()) / 86400000) || Infinity : Infinity}
              availablePct={70}
              checkIn={checkIn}
              onPlan={() => propose(oppPerson.opportunity)}
            />
          </GlassPanel>
        </motion.div>
      )}

      {/* 4.3 PROPOSED PLANS */}
      {proposed.length > 0 && (
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-3">Proposed Plans</SectionLabel>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {proposed.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} className="shrink-0 w-64 rounded-2xl glass-1 p-4">
                  <p className="text-sm font-medium leading-snug">{p.activity}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{p.suggested_date ? new Date(p.suggested_date).toLocaleString("nl-NL", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "no date"}</p>
                  <div className="flex items-center gap-1.5 mt-2"><span className="h-1.5 w-1.5 rounded-full bg-olive" /><span className="text-[10px] text-muted-foreground">Available · Good capacity</span></div>
                  <div className="flex gap-2 mt-3">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => confirmPlan(p)} disabled={busyId === p.id} className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] uppercase font-semibold rounded-full py-1.5 bg-olive text-white disabled:opacity-50"><Check className="h-3 w-3" />Confirm</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => dismissPlan(p)} disabled={busyId === p.id} className="inline-flex items-center justify-center h-7 w-7 rounded-full glass-1"><X className="h-3 w-3" /></motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* 4.4 PLANNING BOARD */}
      <motion.div variants={fadeUp}>
        <GlassPanel level={2} className="p-5">
          <SectionLabel className="mb-3">Planning Board · drag to move</SectionLabel>
          {boardPlans.length ? <SocialPlanBoard plans={boardPlans} contacts={contacts} reload={reload} /> : <EmptyState title="OPEN SPACE" subtitle="No plans yet — intentions and opportunities flow here." />}
        </GlassPanel>
      </motion.div>

      {/* 4.5 CALENDAR OVERLAY + 4.6 LOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-3">Social Calendar · This week</SectionLabel>
            <div className="flex gap-1">
              {weekGrid.map((wd, i) => (
                <div key={i} className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground text-center mb-1">{DOW[i]}</p>
                  <div className="space-y-1 min-h-[120px]">
                    {wd.plans.length > 0 && wd.plans.map((p) => (
                      <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-md bg-olive/30 border border-olive/40 px-1.5 py-1">
                        <p className="text-[9px] font-medium truncate">{p.activity}</p>
                        <p className="text-[8px] text-muted-foreground">{new Date(p.suggested_date).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p>
                      </motion.div>
                    ))}
                    {wd.events.length > 0 && wd.events.map((e) => (
                      <div key={e.id} className="rounded-md bg-muted/40 px-1.5 py-1">
                        <p className="text-[9px] truncate">{e.title}</p>
                      </div>
                    ))}
                    {wd.plans.length === 0 && wd.events.length === 0 && <div className="rounded-md border border-dashed border-border/40 h-6 flex items-center justify-center"><span className="text-[8px] text-muted-foreground/50">free</span></div>}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-3">Social Load · This week</SectionLabel>
            <div className="flex items-end gap-2 h-32">
              {load.map((v, i) => (
                <div key={DOW[i]} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-md glass-1 overflow-hidden flex items-end" style={{ height: 80 }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(v / maxLoad) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.6 }} className="w-full rounded-md bg-olive/60" />
                  </div>
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{DOW[i]}</span>
                  <CountUp value={v} className="text-[10px] tabular-nums font-semibold text-foreground/70" />
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </motion.div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };