import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PanelForm from "@/system/components/glass/PanelForm";
import GlassInput from "@/system/components/glass/GlassInput";
import GlassButton from "@/system/components/glass/GlassButton";
import Avatar from "@/system/components/glass/Avatar";
import { contactSignals, contactRecentTrend, daysSince, desiredFreq, RELATIONSHIP_LABEL } from "@/lib/domainUtils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { Chip, SignalDots, Meter, Kicker } from "./primitives";

/* PersonDrawer — Relationship Detail overlay (PanelForm). Inline editing
   of contact data saves straight to the Contact entity and reflects the
   change immediately (optimistic local state + reload). Signals stay
   descriptive, never a single score. */

const INTENTION_KINDS = ["see_someone", "call", "reconnect", "invite", "spend_time", "protect_time", "alone_time"];
const FIELDS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "role", label: "Role" },
  { key: "relationship_type", label: "Relationship type" },
  { key: "avatar", label: "Avatar URL" },
];

export default function PersonDrawer({ contact, whatsapps = [], moments = [], plans = [], onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [freq, setFreq] = useState(14);
  const [notes, setNotes] = useState("");
  const [showIntention, setShowIntention] = useState(false);
  const [intentionKind, setIntentionKind] = useState("see_someone");

  // re-seed whenever a different contact opens
  useEffect(() => {
    if (!contact) return;
    setForm({
      name: contact.name || "", email: contact.email || "", phone: contact.phone || "",
      company: contact.company || "", role: contact.role || "", relationship_type: contact.relationship_type || "",
      avatar: contact.avatar || "",
    });
    setFreq(desiredFreq(contact) || 14);
    setNotes(contact.notes || "");
    setSavedAt(null);
  }, [contact?.id]);

  const signals = useMemo(() => contactSignals(contact, whatsapps), [contact, whatsapps]);
  const state = contact?.relationship_state || "UNKNOWN";
  const since = daysSince(contact?.last_meaningful_contact_date || contact?.last_contact_date);
  const trend = useMemo(() => contactRecentTrend(contact?.id, whatsapps), [contact, whatsapps]);
  const personMoments = useMemo(() => (moments || []).filter((m) => (m.contact_ids || []).includes(contact?.id)).slice(0, 8), [moments, contact]);
  const personPlans = useMemo(() => (plans || []).filter((p) => (p.contact_ids || []).includes(contact?.id)).slice(0, 5), [plans, contact]);

  if (!contact || !form) return null;

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Contact.update(contact.id, { ...form, desired_frequency_days: Number(freq) || null, notes });
      setSavedAt(Date.now());
      onSaved?.(); // reload underlying data → reflects immediately across the page
    } finally { setSaving(false); }
  };

  const addIntention = async () => {
    setSaving(true);
    try {
      await base44.entities.SocialIntention.create({ description: `${intentionKind.replace(/_/g, " ")} — ${contact.name}`, contact_id: contact.id, kind: intentionKind, status: "open", created_via: "manual" });
      onSaved?.();
      setShowIntention(false);
    } finally { setSaving(false); }
  };

  return (
    <PanelForm
      open={!!contact}
      onClose={onClose}
      title={contact.name}
      eyebrow="Relationship detail"
      width={460}
      footer={
        <>
          <span className="text-[11px] text-muted-foreground mr-auto">{savedAt ? "Saved ✓" : "Changes save to the contact"}</span>
          <GlassButton variant="ghost" size="sm" onClick={onClose}>Close</GlassButton>
          <GlassButton variant="primary" size="sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</GlassButton>
        </>
      }
    >
      {/* Identity + state */}
      <div className="flex items-center gap-4">
        <Avatar src={form.avatar || contact.avatar} name={contact.name} size="xl" />
        <div className="min-w-0">
          <p className="font-display font-semibold text-lg tracking-tight truncate">{contact.name}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Chip tone={state === "CLOSE" ? "olive" : state === "QUIETER_THAN_USUAL" ? "sand" : "neutral"}>{RELATIONSHIP_LABEL[state] || state}</Chip>
            <Chip tone="neutral">{since === Infinity ? "never" : `${since}d since contact`}</Chip>
          </div>
        </div>
      </div>

      {/* Signals — descriptive, not a score */}
      <div>
        <Kicker className="block mb-2">Relationship signals</Kicker>
        <GlassPanel level={1} className="p-4 space-y-2">
          <SignalDots label="Connection" value={signals.connection} />
          <SignalDots label="Recency" value={signals.recency} />
          <SignalDots label="Rhythm" value={signals.rhythm} />
          <SignalDots label="Reciprocity" value={signals.reciprocity} />
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground w-24">Change</span>
            <span className={trend === "up" ? "text-olive text-xs" : trend === "down" ? "text-urgent text-xs" : "text-muted-foreground text-xs"}>{trend === "up" ? "↑ more active" : trend === "down" ? "↓ quieter" : "→ steady"}</span>
          </div>
        </GlassPanel>
      </div>

      <div>
        <Kicker className="block mb-2">Rhythm</Kicker>
        <Meter value={Math.min(100, (signals.rhythm / 5) * 100)} label={`Typical · ~${desiredFreq(contact)}d`} sub={`${since === Infinity ? "never" : since + "d"} since meaningful`} accent="sand" />
      </div>

      {contact.relationship_pattern_note && (
        <div>
          <Kicker className="block mb-2">Pattern</Kicker>
          <GlassPanel level={1} className="p-3"><p className="text-sm text-foreground/80 leading-relaxed">{contact.relationship_pattern_note}</p></GlassPanel>
        </div>
      )}

      {/* Timeline */}
      <div>
        <Kicker className="block mb-2">Timeline</Kicker>
        {(personMoments.length || personPlans.length) ? (
          <div className="space-y-2">
            {personMoments.map((m) => (
              <div key={m.id} className="flex gap-3 items-start">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-olive shrink-0" />
                <div><p className="text-sm">{m.title}</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{new Date(m.occurred_at || m.created_date).toLocaleDateString("nl-NL", { month: "short", day: "numeric" })} · {m.moment_type}</p></div>
              </div>
            ))}
            {personPlans.map((p) => (
              <div key={p.id} className="flex gap-3 items-start">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sand shrink-0" />
                <div><p className="text-sm">{p.activity}</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.status}</p></div>
              </div>
            ))}
          </div>
        ) : <p className="text-[11px] text-muted-foreground">No meaningful moments recorded yet.</p>}
      </div>

      {/* Inline editing of contact data */}
      <div>
        <Kicker className="block mb-3">Contact details · inline edit</Kicker>
        <div className="space-y-3">
          {FIELDS.map((f) => (
            <GlassInput key={f.key} label={f.label} type={f.type || "text"} value={form[f.key]} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} />
          ))}
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Desired rhythm (days)" type="number" value={freq} onChange={(e) => setFreq(e.target.value)} />
            <GlassInput label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Management */}
      <div>
        <Kicker className="block mb-2">Actions</Kicker>
        <GlassButton variant="glass" size="sm" className="w-full" onClick={() => setShowIntention((v) => !v)}>+ Social intention</GlassButton>
        {showIntention && (
          <GlassPanel level={1} className="p-3 mt-2 space-y-2">
            <select value={intentionKind} onChange={(e) => setIntentionKind(e.target.value)} className="w-full rounded-xl bg-white/40 backdrop-blur-md border border-white/50 px-3 py-2.5 text-sm outline-none">
              {INTENTION_KINDS.map((k) => <option key={k} value={k}>{k.replace(/_/g, " ")}</option>)}
            </select>
            <GlassButton variant="primary" size="sm" className="w-full" onClick={addIntention} disabled={saving}>{saving ? "…" : "Create intention"}</GlassButton>
          </GlassPanel>
        )}
      </div>
    </PanelForm>
  );
}