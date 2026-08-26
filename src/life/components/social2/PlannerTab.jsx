import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { ObjectCard, Chip, EmptyVisual, Kicker } from "./primitives";
import { daysSince, capacityFromCheckIn } from "@/lib/domainUtils";

/* SOCIAL PLANNER — what could happen. Intentions, opportunity field,
   proposed plans, planning board (drag between states), calendar
   overlay, social load. A proposal is not a commitment. */

const STAGES = [
  { key: "proposed", label: "Proposed" },
  { key: "planned", label: "Planned" },
  { key: "confirmed", label: "Confirmed" },
  { key: "done", label: "Completed" },
];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCK_COLOR = { work: "#4a4a44", free: "#d8dab3", social: "#94925d", recovery: "#cfd9dd", protected: "#d5e24a", rest: "#b1bec6" };

export default function PlannerTab({ data, contacts = [], checkIn, reload }) {
  const [busy, setBusy] = useState(null);

  const plansByStage = useMemo(() => {
    const map = { proposed: [], planned: [], confirmed: [], done: [] };
    (data.plans || []).forEach((p) => { if (map[p.status]) map[p.status].push(p); });
    return map;
  }, [data.plans]);

  const oppPerson = useMemo(() => {
    const o = (data.opportunities || []).find((x) => x.contact_id) || (data.opportunities || [])[0];
    const c = o && contacts.find((x) => x.id === o.contact_id);
    return { o, c };
  }, [data.opportunities, contacts]);

  const load = useMemo(() => {
    const now = new Date(); const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const start = new Date(now); start.setDate(now.getDate() - dow); start.setHours(0, 0, 0, 0);
    const buckets = Array.from({ length: 7 }, () => 0);
    [...(data.plans || []).filter((p) => ["planned", "proposed", "confirmed"].includes(p.status)), ...(data.events || []).filter((e) => e.domain === "life")].forEach((it) => {
      const ts = it.suggested_date || it.start; if (!ts) return;
      const idx = Math.floor((new Date(ts) - start) / 86400000);
      if (idx >= 0 && idx < 7) buckets[idx]++;
    });
    return buckets;
  }, [data.plans, data.events]);
  const maxLoad = Math.max(1, ...load);

  const weekGrid = useMemo(() => {
    const now = new Date(); const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const start = new Date(now); start.setDate(now.getDate() - dow); start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, d) => {
      const day = new Date(start); day.setDate(start.getDate() + d);
      const events = (data.events || []).filter((e) => e.domain === "life" && new Date(e.start).toDateString() === day.toDateString());
      const plans = (data.plans || []).filter((p) => ["planned", "confirmed"].includes(p.status) && p.suggested_date && new Date(p.suggested_date).toDateString() === day.toDateString());
      return { day, events, plans };
    });
  }, [data.events, data.plans]);

  const onDragEnd = async (r) => {
    if (!r.destination) return;
    const id = r.draggableId;
    const newStatus = STAGES[Number(r.destination.droppableId.replace("col", ""))].key;
    setBusy(id);
    try { await base44.entities.SocialPlan.update(id, { status: newStatus }); if (newStatus === "confirmed") await base44.functions.invoke("socialPlanManagement", { plan_id: id }).catch(() => null); reload(); } finally { setBusy(null); }
  };

  const confirmPlan = async (p) => { setBusy(p.id); try { await base44.entities.SocialPlan.update(p.id, { status: "confirmed", confirmed_at: new Date().toISOString() }); await base44.functions.invoke("socialPlanManagement", { plan_id: p.id }).catch(() => null); reload(); } finally { setBusy(null); } };
  const dismissPlan = async (p) => { setBusy(p.id); try { await base44.entities.SocialPlan.update(p.id, { status: "cancelled" }); reload(); } finally { setBusy(null); } };
  const planIntention = async (i) => { setBusy(i.id); try { const p = await base44.entities.SocialPlan.create({ contact_ids: i.contact_id ? [i.contact_id] : [], activity: i.description, status: "proposed", source: "intention" }); await base44.entities.SocialIntention.update(i.id, { status: "acted", social_plan_id: p.id }); reload(); } finally { setBusy(null); } };

  const nameOf = (id) => contacts.find((c) => c.id === id)?.name;
  const capacity = capacityFromCheckIn(checkIn);

  return (
    <div className="space-y-4">
      {(data.intentions || []).length > 0 && (
        <ObjectCard kicker="04.1" title="Social Intentions">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {data.intentions.map((i) => (
              <div key={i.id} className="shrink-0 w-52 rounded-2xl border border-foreground/10 p-4 flex flex-col">
                <Chip tone="sand" className="self-start mb-2">{i.kind?.replace(/_/g, " ") || "intention"}</Chip>
                <p className="text-sm font-medium flex-1">{i.description}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">no date yet</p>
                <button onClick={() => planIntention(i)} disabled={busy === i.id} className="mt-3 text-[10px] uppercase font-semibold bg-olive text-white rounded-full py-2 disabled:opacity-50">{busy === i.id ? "Planning…" : "Plan"}</button>
              </div>
            ))}
          </div>
        </ObjectCard>
      )}

      {oppPerson.o && (
        <ObjectCard kicker="04.2" title="Opportunity Field · connected signals">
          <div className="flex flex-wrap items-center gap-3 justify-center text-center">
            <SignalBlock label="Open time" value={oppPerson.o.suggested_window_start ? new Date(oppPerson.o.suggested_window_start).toLocaleDateString("nl-NL", { weekday: "short" }) : "this week"} />
            <Connector />
            <SignalBlock label="Person" value={oppPerson.c?.name || "—"} sub={oppPerson.c ? `${daysSince(oppPerson.c.last_contact_date)}d since contact` : ""} />
            <Connector />
            <SignalBlock label="Capacity" value={capacity.level} tone={capacity.level === "HIGH" ? "olive" : capacity.level === "LOW" ? "urgent" : "neutral"} />
            <Connector />
            <div className="rounded-xl bg-olive/10 border border-olive/30 px-5 py-3"><p className="text-[9px] uppercase tracking-wide text-olive">Social opportunity</p><p className="text-sm font-medium mt-1">{oppPerson.o.title}</p></div>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-3">{oppPerson.o.reasoning}</p>
        </ObjectCard>
      )}

      {plansByStage.proposed.length > 0 && (
        <ObjectCard kicker="04.3" title="Proposed Plans">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {plansByStage.proposed.map((p) => (
              <div key={p.id} className="shrink-0 w-60 rounded-2xl border border-foreground/10 p-4">
                <p className="text-sm font-medium">{p.activity}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{p.suggested_date ? new Date(p.suggested_date).toLocaleString("nl-NL", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "no date"}</p>
                {p.contact_ids?.length ? <p className="text-[10px] text-muted-foreground mt-1">{p.contact_ids.map(nameOf).filter(Boolean).join(", ")}</p> : null}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => confirmPlan(p)} disabled={busy === p.id} className="flex-1 text-[10px] uppercase font-semibold bg-olive text-white rounded-full py-1.5 disabled:opacity-50">Confirm</button>
                  <button onClick={() => dismissPlan(p)} disabled={busy === p.id} className="text-[10px] uppercase font-semibold px-3 rounded-full border border-foreground/15">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </ObjectCard>
      )}

      <ObjectCard kicker="04.4" title="Planning Board · drag to move" bodyClass="min-h-0">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STAGES.map((s, si) => (
              <Droppable key={s.key} droppableId={`col${si}`}>
                {(prov, snap) => (
                  <div ref={prov.innerRef} {...prov.droppableProps} className={`rounded-xl border p-2 min-h-[160px] ${snap.isDraggingOver ? "border-olive/40 bg-olive/[0.04]" : "border-foreground/10 bg-foreground/[0.02]"}`}>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2 px-1">{s.label} · {plansByStage[s.key].length}</p>
                    {plansByStage[s.key].map((p, idx) => (
                      <Draggable key={p.id} draggableId={p.id} index={idx}>
                        {(p2) => (
                          <div ref={p2.innerRef} {...p2.draggableProps} {...p2.dragHandleProps} className="rounded-lg bg-card border border-foreground/10 p-2.5 mb-2 cursor-grab active:cursor-grabbing">
                            <p className="text-xs font-medium leading-snug">{p.activity}</p>
                            {p.suggested_date && <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(p.suggested_date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}</p>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {plansByStage[s.key].length === 0 && <p className="text-[9px] text-muted-foreground/50 text-center py-4">—</p>}
                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </ObjectCard>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
        <ObjectCard kicker="04.5" title="Social Calendar · this week">
          <div className="flex gap-1">
            {weekGrid.map((wd, i) => (
              <div key={i} className="flex-1 min-w-0">
                <p className="text-[9px] uppercase text-muted-foreground text-center mb-1">{DOW[i]}</p>
                <div className="space-y-1 min-h-[120px]">
                  {wd.plans.map((p) => <div key={p.id} className="rounded-md bg-olive/25 border border-olive/40 px-1.5 py-1"><p className="text-[9px] font-medium truncate">{p.activity}</p><p className="text-[8px] text-muted-foreground">{new Date(p.suggested_date).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</p></div>)}
                  {wd.events.map((e) => <div key={e.id} className="rounded-md bg-foreground/[0.06] px-1.5 py-1"><p className="text-[9px] truncate">{e.title}</p></div>)}
                  {!wd.plans.length && !wd.events.length && <div className="rounded-md border border-dashed border-foreground/15 h-6 flex items-center justify-center"><span className="text-[8px] text-muted-foreground/50">free</span></div>}
                </div>
              </div>
            ))}
          </div>
        </ObjectCard>
        <ObjectCard kicker="04.6" title="Social Load · this week">
          <div className="flex items-end gap-2 h-40">
            {load.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-md bg-foreground/[0.05] overflow-hidden flex items-end" style={{ height: 110 }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(v / maxLoad) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.5 }} className="w-full rounded-md bg-olive/70" />
                </div>
                <span className="text-[9px] uppercase text-muted-foreground">{DOW[i]}</span>
                <span className="text-[10px] tabular-nums font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </ObjectCard>
      </div>
    </div>
  );
}

function SignalBlock({ label, value, sub, tone = "neutral" }) {
  return (
    <div className="rounded-xl border border-foreground/10 px-4 py-3 min-w-[100px]">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
function Connector() { return <span className="text-olive text-lg">↓</span>; }