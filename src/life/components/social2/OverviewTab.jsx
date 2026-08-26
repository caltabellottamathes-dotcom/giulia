import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { StateGlyph, BarField, Meter, ObjectCard, PeopleCard, Chip, EmptyVisual, Rule, Kicker, Modal, TextInput, FieldLabel } from "./primitives";
import { meaningfulInteractions, weeklyActivityBars, personalBaseline, closeCircle, contactRecentTrend, daysSince, RELATIONSHIP_LABEL } from "@/lib/domainUtils";

/* OVERVIEW — the whole social system as one composed picture.
   §01.1 state · §01.2 activity · §01.3 baseline · §01.4 social space ·
   §01.5 important people · §01.6 upcoming · §01.7 opportunities ·
   §01.8 notable changes · §01.9 quick management */

const BLOCK_TYPES = { work: "#4a4a44", free: "#d8dab3", social: "#94925d", recovery: "#cfd9dd", protected: "#d5e24a", rest: "#b1bec6" };

export default function OverviewTab({ data, state, mi, openPerson, reload }) {
  const [modal, setModal] = useState(null);

  const bars = useMemo(() => weeklyActivityBars({ whatsapps: data.whatsapps, emails: data.emails, events: data.events }), [data]);
  const baseline = useMemo(() => personalBaseline({ whatsapps: data.whatsapps, emails: data.emails, events: data.events }), [data]);
  const verdict = baseline.current >= baseline.baseline * 1.15 ? "MORE ACTIVE THAN USUAL" : baseline.current <= baseline.baseline * 0.7 ? "QUIETER THAN USUAL" : "ON PACE";

  const people = useMemo(() => closeCircle(data.contacts, { whatsapps: data.whatsapps, planContactIds: (data.plans || []).flatMap((p) => p.contact_ids || []) }).sort((a, b) => daysSince(a.last_contact_date) - daysSince(b.last_contact_date)).slice(0, 6), [data]);

  const upcoming = useMemo(() => [
    ...(data.plans || []).filter((p) => ["proposed", "planned", "confirmed"].includes(p.status) && p.suggested_date).map((p) => ({ id: p.id, title: p.activity, at: p.suggested_date, status: p.status, kind: "plan" })),
    ...(data.events || []).filter((e) => e.domain === "life" && new Date(e.start) >= new Date()).map((e) => ({ id: e.id, title: e.title, at: e.start, status: "confirmed", kind: "event" })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at)).slice(0, 5), [data.plans, data.events]);

  const changes = useMemo(() => people.map((c) => ({ c, trend: contactRecentTrend(c.id, data.whatsapps) })).filter((x) => x.trend !== "steady"), [people, data.whatsapps]);

  const todayBlocks = useMemo(() => (data.blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === new Date().toDateString() && b.status !== "cancelled"), [data.blocks]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4">
        <ObjectCard kicker="01.1" title="Social State" className="justify-center items-center">
          <StateGlyph label={state} sub={`${mi.total} meaningful · 7d · ${data.plans?.length || 0} plans`} dots={Math.min(7, mi.total)} accent={state === "OVERLOADED" ? "urgent" : "olive"} />
        </ObjectCard>
        <ObjectCard kicker="01.2 / 01.3" title="Social Activity · This week">
          <BarField rows={bars.map((b) => ({ label: b.label, value: b.count, highlight: b.isToday }))} />
          <div className="mt-5 pt-4 border-t border-foreground/10 space-y-2">
            <Meter value={baseline.current} max={Math.max(baseline.current, baseline.baseline, 1)} label="Current" accent="olive" />
            <Meter value={baseline.baseline} max={Math.max(baseline.current, baseline.baseline, 1)} label="Baseline" accent="sand" />
            <p className="text-sm font-display font-semibold pt-2">{verdict}</p>
          </div>
        </ObjectCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ObjectCard kicker="01.4" title="Social Space · Today">
          <DayTimeline blocks={todayBlocks} />
        </ObjectCard>
        <ObjectCard kicker="01.5" title="Important People" action={<button onClick={() => setModal("person")} className="text-[10px] uppercase tracking-widest font-semibold text-olive">+ Add</button>}>
          {people.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {people.map((c) => <PeopleCard key={c.id} person={c} state={RELATIONSHIP_LABEL[c.relationship_state] || "UNKNOWN"} since={daysSince(c.last_meaningful_contact_date || c.last_contact_date)} trend={contactRecentTrend(c.id, data.whatsapps)} onClick={() => openPerson(c)} />)}
            </div>
          ) : <EmptyVisual title="YOUR NETWORK" subtitle="Start adding people, or let GIULIA discover relationships from context." />}
        </ObjectCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ObjectCard kicker="01.6" title="Upcoming Social">
          {upcoming.length ? (
            <div className="space-y-2">
              {upcoming.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl border border-foreground/10 px-3 py-2.5">
                  <div className="text-center shrink-0">
                    <div className="text-[9px] uppercase text-muted-foreground">{new Date(u.at).toLocaleDateString("nl-NL", { weekday: "short" })}</div>
                    <div className="font-display font-bold text-sm">{new Date(u.at).toLocaleDateString("nl-NL", { day: "numeric" })}</div>
                  </div>
                  <span className="text-sm flex-1 truncate">{u.title}</span>
                  <Chip tone={u.status === "confirmed" ? "olive" : u.status === "proposed" ? "sand" : "neutral"}>{u.status}</Chip>
                </div>
              ))}
            </div>
          ) : <EmptyVisual title="OPEN SPACE" subtitle="Nothing planned yet. Your week has room." />}
        </ObjectCard>
        <ObjectCard kicker="01.7" title="Opportunities">
          {(data.opportunities || []).length ? (
            <div className="space-y-3">
              {data.opportunities.slice(0, 4).map((o) => (
                <div key={o.id} className="rounded-xl border border-olive/20 bg-olive/[0.04] p-4">
                  <div className="flex items-center gap-2 mb-1"><span className="h-1.5 w-1.5 rounded-full bg-olive" /><p className="text-sm font-medium">{o.title}</p></div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{o.reasoning}</p>
                </div>
              ))}
            </div>
          ) : <EmptyVisual title="QUIET" subtitle="No opportunities detected right now." />}
        </ObjectCard>
      </div>

      {changes.length > 0 && (
        <ObjectCard kicker="01.8" title="Notable Changes">
          <div className="flex flex-wrap gap-2">
            {changes.map(({ c, trend }) => <Chip key={c.id} tone={trend === "up" ? "olive" : "sand"}>{trend === "up" ? "↑" : "↓"} {c.name} · {trend === "up" ? "more active" : "quieter"}</Chip>)}
          </div>
        </ObjectCard>
      )}

      <ObjectCard kicker="01.9" title="Quick Management">
        <div className="flex flex-wrap gap-2">
          {[["person", "Add person"], ["moment", "Add moment"], ["intention", "Create intention"], ["plan", "Create plan"], ["time", "Add time"]].map(([k, l]) => (
            <button key={k} onClick={() => setModal(k)} className="text-[11px] font-medium rounded-full px-3.5 py-2 border border-foreground/15 hover:bg-foreground/5">{l}</button>
          ))}
        </div>
      </ObjectCard>

      <QuickModal kind={modal} onClose={() => setModal(null)} onSaved={reload} contacts={data.contacts} />
    </div>
  );
}

function DayTimeline({ blocks = [] }) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 7);
  return (
    <div className="space-y-1">
      {hours.map((h) => {
        const block = blocks.find((b) => { const s = new Date(b.start).getHours(); const e = new Date(b.end || b.start).getHours(); return s <= h && e > h; });
        return (
          <div key={h} className="flex items-center gap-2">
            <span className="text-[9px] tabular-nums text-muted-foreground w-6">{String(h).padStart(2, "0")}</span>
            <div className="flex-1 h-3 rounded-md bg-foreground/[0.05] overflow-hidden">
              {block && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.4 }} className="h-full rounded-md" style={{ background: BLOCK_TYPES[block.type] || BLOCK_TYPES.free }} />}
            </div>
            {block && <span className="text-[8px] uppercase tracking-wide text-muted-foreground w-16 truncate">{block.type}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function QuickModal({ kind, onClose, onSaved, contacts = [] }) {
  const [v, setV] = useState({});
  if (!kind) return null;
  const save = async () => {
    if (kind === "person") await base44.entities.Contact.create({ name: v.name, relationship_type: v.type });
    if (kind === "moment") await base44.entities.SocialMoment.create({ title: v.title, occurred_at: new Date().toISOString(), contact_ids: v.contact_id ? [v.contact_id] : [] });
    if (kind === "intention") await base44.entities.SocialIntention.create({ description: v.desc, kind: "see_someone", status: "open", created_via: "manual" });
    if (kind === "plan") await base44.entities.SocialPlan.create({ activity: v.activity, status: "proposed", contact_ids: v.contact_id ? [v.contact_id] : [], suggested_date: v.date ? new Date(v.date).toISOString() : undefined });
    if (kind === "time") { const s = new Date(); const e = new Date(Date.now() + (Number(v.dur) || 30) * 60000); await base44.entities.PersonalTimeBlock.create({ title: v.title, type: v.type || "free", start: s.toISOString(), end: e.toISOString(), duration_min: Number(v.dur) || 30, status: "scheduled", is_protected: v.type === "protected" }); }
    setV({}); onClose(); onSaved?.();
  };
  const titles = { person: "Add person", moment: "Add social moment", intention: "Create intention", plan: "Create social plan", time: "Add personal time" };
  return (
    <Modal open={!!kind} onClose={onClose} title={titles[kind] || ""} footer={<><button onClick={onClose} className="text-sm text-muted-foreground px-3 py-1.5">Cancel</button><button onClick={save} className="text-sm font-semibold text-white bg-olive px-4 py-1.5 rounded-full">Save</button></>}>
      {kind === "person" && <><FieldLabel>Name</FieldLabel><TextInput value={v.name || ""} onChange={(e) => setV({ ...v, name: e.target.value })} autoFocus /><FieldLabel>Type</FieldLabel><TextInput value={v.type || ""} onChange={(e) => setV({ ...v, type: e.target.value })} placeholder="friend / family / work…" /></>}
      {kind === "moment" && <><FieldLabel>Title</FieldLabel><TextInput value={v.title || ""} onChange={(e) => setV({ ...v, title: e.target.value })} autoFocus /><FieldLabel>Person (optional)</FieldLabel><select value={v.contact_id || ""} onChange={(e) => setV({ ...v, contact_id: e.target.value })} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none"><option value="">—</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></>}
      {kind === "intention" && <><FieldLabel>What do you want?</FieldLabel><TextInput value={v.desc || ""} onChange={(e) => setV({ ...v, desc: e.target.value })} autoFocus placeholder="See Sophie…" /></>}
      {kind === "plan" && <><FieldLabel>Activity</FieldLabel><TextInput value={v.activity || ""} onChange={(e) => setV({ ...v, activity: e.target.value })} autoFocus /><FieldLabel>Date (optional)</FieldLabel><input type="datetime-local" value={v.date || ""} onChange={(e) => setV({ ...v, date: e.target.value })} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none" /><FieldLabel>Person (optional)</FieldLabel><select value={v.contact_id || ""} onChange={(e) => setV({ ...v, contact_id: e.target.value })} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none"><option value="">—</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></>}
      {kind === "time" && <><FieldLabel>Title</FieldLabel><TextInput value={v.title || ""} onChange={(e) => setV({ ...v, title: e.target.value })} autoFocus /><FieldLabel>Type</FieldLabel><select value={v.type || "free"} onChange={(e) => setV({ ...v, type: e.target.value })} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none">{["rest", "recovery", "free", "protected"].map((t) => <option key={t} value={t}>{t}</option>)}</select><FieldLabel>Duration (min)</FieldLabel><input type="number" value={v.dur || 30} onChange={(e) => setV({ ...v, dur: e.target.value })} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none" /></>}
    </Modal>
  );
}