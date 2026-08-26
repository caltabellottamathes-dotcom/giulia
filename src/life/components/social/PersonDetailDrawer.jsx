import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import Avatar from "@/system/components/glass/Avatar";
import RhythmWave from "./RhythmWave";
import RelationshipTimeline from "./RelationshipTimeline";
import { contactSignals, contactRecentTrend, desiredFreq } from "@/lib/domainUtils";
import { X, ArrowUp, ArrowDown } from "lucide-react";

const TYPES = ["friend", "family", "professional", "creative", "other"];

/** PersonDetailDrawer — §2.10/§9 detail overlay + inline relationship
 *  management. Slides in from the right, closes on backdrop click. */
export default function PersonDetailDrawer({ contact, whatsapps = [], onClose, onUpdated }) {
  const [saving, setSaving] = useState(false);
  if (!contact) return null;
  const signals = contactSignals(contact, whatsapps);
  const trend = contactRecentTrend(contact.id, whatsapps);

  const update = async (patch) => {
    setSaving(true);
    try { await base44.entities.Contact.update(contact.id, patch); await onUpdated?.(); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-charcoal/20" onClick={onClose} />
      <div className="relative w-full max-w-sm h-full glass-3 p-6 overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 left-5 h-8 w-8 rounded-full bg-muted/60 flex items-center justify-center"><X className="h-4 w-4" /></button>
        <div className="flex flex-col items-center text-center mt-12 mb-6">
          <Avatar src={contact.avatar} name={contact.name} size="xl" className="mb-3" />
          <p className="font-display text-xl font-semibold">{contact.name}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            {signals.since === Infinity ? "no contact recorded" : `${signals.since}d ago`}
            {trend === "up" && <ArrowUp className="h-3 w-3 text-olive" />}
            {trend === "down" && <ArrowDown className="h-3 w-3 text-urgent" />}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Relationship type</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((t) => (
                <button key={t} disabled={saving} onClick={() => update({ relationship_type: t })}
                  className={`text-[11px] capitalize rounded-full px-3 py-1 border transition-colors ${contact.relationship_type === t ? "bg-olive text-white border-olive" : "border-border text-muted-foreground"}`}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Signals</p>
            <div className="space-y-1.5">
              {[["Connection", signals.connection], ["Recency", signals.recency], ["Rhythm", signals.rhythm], ["Reciprocity", signals.reciprocity]].map(([label, v]) => (
                <div key={label} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="inline-flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < v ? "bg-olive" : "bg-muted"}`} />)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Rhythm</p>
            <RhythmWave freqDays={desiredFreq(contact)} sinceDays={signals.since} />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Timeline · 6 months</p>
            <RelationshipTimeline contactId={contact.id} whatsapps={whatsapps} />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Pattern</p>
            <p className="text-[12px] text-foreground/70 italic">{contact.relationship_pattern_note || "No pattern detected yet."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}