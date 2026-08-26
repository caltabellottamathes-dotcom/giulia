import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { contactSignals, contactRecentTrend, daysSince, desiredFreq, RELATIONSHIP_LABEL } from "@/lib/domainUtils";
import { Chip, SignalDots, Meter, Rule, Kicker } from "./primitives";

/* PersonDrawer — Relationship Detail overlay. Shows state, signals (no
   score), rhythm, last meaningful contact, context, recent timeline, and
   inline management (type, desired frequency). */

const INTENTION_KINDS = ["see_someone", "call", "reconnect", "invite", "spend_time", "protect_time", "alone_time"];

export default function PersonDrawer({ contact, whatsapps = [], moments = [], plans = [], onClose, onSaved }) {
  const [type, setType] = useState(contact?.relationship_type || "");
  const [freq, setFreq] = useState(desiredFreq(contact) || 14);
  const [saving, setSaving] = useState(false);
  const [intentionKind, setIntentionKind] = useState("see_someone");
  const [showIntention, setShowIntention] = useState(false);

  const signals = useMemo(() => contactSignals(contact, whatsapps), [contact, whatsapps]);
  const state = contact?.relationship_state || "UNKNOWN";
  const since = daysSince(contact?.last_meaningful_contact_date || contact?.last_contact_date);
  const trend = useMemo(() => contactRecentTrend(contact?.id, whatsapps), [contact, whatsapps]);

  const personMoments = useMemo(() => (moments || []).filter((m) => (m.contact_ids || []).includes(contact?.id)).slice(0, 8), [moments, contact]);
  const personPlans = useMemo(() => (plans || []).filter((p) => (p.contact_ids || []).includes(contact?.id)).slice(0, 5), [plans, contact]);

  const save = async () => {
    setSaving(true);
    try { await base44.entities.Contact.update(contact.id, { relationship_type: type, desired_frequency_days: Number(freq) }); onSaved?.(); } finally { setSaving(false); }
  };
  const addIntention = async () => {
    setSaving(true);
    try { await base44.entities.SocialIntention.create({ description: `${intentionKind.replace(/_/g, " ")} — ${contact?.name}`, contact_id: contact.id, kind: intentionKind, status: "open", created_via: "manual" }); onSaved?.(); setShowIntention(false); } finally { setSaving(false); }
  };

  if (!contact) return null;
  const initials = (contact.name || "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" />
      <motion.div initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md h-full bg-card border-l border-foreground/10 overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-5 left-5 h-8 w-8 rounded-full hover:bg-foreground/10 flex items-center justify-center text-muted-foreground">✕</button>
        <div className="mt-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-olive/15 text-olive font-display font-semibold flex items-center justify-center text-lg overflow-hidden">{contact.avatar ? <img src={contact.avatar} alt="" className="h-full w-full object-cover" /> : initials}</div>
            <div>
              <h2 className="font-display font-bold text-xl tracking-tight">{contact.name}</h2>
              <Chip tone="olive" className="mt-1">{RELATIONSHIP_LABEL[state] || state}</Chip>
            </div>
          </div>

          <div>
            <Kicker className="block mb-2">Relationship signals · not a score</Kicker>
            <div className="space-y-2 rounded-xl border border-foreground/10 p-4">
              <SignalDots label="Connection" value={signals.connection} />
              <SignalDots label="Recency" value={signals.recency} />
              <SignalDots label="Rhythm" value={signals.rhythm} />
              <SignalDots label="Reciprocity" value={signals.reciprocity} />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground w-24">Change</span>
                <span className={trend === "up" ? "text-olive text-xs" : trend === "down" ? "text-urgent text-xs" : "text-muted-foreground text-xs"}>{trend === "up" ? "↑ more active" : trend === "down" ? "↓ quieter" : "→ steady"}</span>
              </div>
            </div>
          </div>

          <div>
            <Kicker className="block mb-2">Rhythm</Kicker>
            <Meter value={Math.min(100, (signals.rhythm / 5) * 100)} label={`Typical · ~${desiredFreq(contact)}d`} sub={`${since === Infinity ? "never" : since + "d"} since meaningful`} accent="sand" />
          </div>

          {contact.relationship_pattern_note && (
            <div>
              <Kicker className="block mb-2">Pattern</Kicker>
              <p className="text-sm text-foreground/80 leading-relaxed rounded-xl bg-foreground/[0.04] p-3">{contact.relationship_pattern_note}</p>
            </div>
          )}

          <div>
            <Kicker className="block mb-2">Timeline</Kicker>
            {personMoments.length ? (
              <div className="space-y-2">
                {personMoments.map((m) => (
                  <div key={m.id} className="flex gap-3 items-start">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
                    <div>
                      <p className="text-sm">{m.title}</p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{new Date(m.occurred_at || m.created_date).toLocaleDateString("nl-NL", { month: "short", day: "numeric" })} · {m.moment_type}</p>
                    </div>
                  </div>
                ))}
                {personPlans.map((p) => (
                  <div key={p.id} className="flex gap-3 items-start">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sand shrink-0" />
                    <div><p className="text-sm">{p.activity}</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.status}</p></div>
                  </div>
                ))}
              </div>
            ) : <p className="text-[11px] text-muted-foreground">No meaningful moments recorded yet.</p>}
          </div>

          <div>
            <Kicker className="block mb-3">Manage relationship</Kicker>
            <div className="space-y-3">
              <div><label className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5">Type</label><input value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-olive/50" /></div>
              <div><label className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-1.5">Desired rhythm (days)</label><input type="number" value={freq} onChange={(e) => setFreq(e.target.value)} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-olive/50" /></div>
              <button onClick={save} disabled={saving} className="w-full text-xs uppercase tracking-wide font-semibold bg-olive text-white rounded-lg py-2.5 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
              <button onClick={() => setShowIntention((v) => !v)} className="w-full text-xs uppercase tracking-wide font-semibold rounded-lg py-2.5 border border-foreground/15">+ Social intention</button>
              {showIntention && (
                <div className="rounded-xl border border-foreground/10 p-3 space-y-2">
                  <select value={intentionKind} onChange={(e) => setIntentionKind(e.target.value)} className="w-full rounded-lg border border-foreground/15 bg-background px-2 py-2 text-xs outline-none">{INTENTION_KINDS.map((k) => <option key={k} value={k}>{k.replace(/_/g, " ")}</option>)}</select>
                  <button onClick={addIntention} disabled={saving} className="w-full text-xs uppercase tracking-wide font-semibold bg-olive text-white rounded-lg py-2 disabled:opacity-50">{saving ? "…" : "Create intention"}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}