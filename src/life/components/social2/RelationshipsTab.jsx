import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import RelationshipMap from "./RelationshipMap";
import { ObjectCard, Chip, EmptyVisual, Kicker, SignalDots, Meter } from "./primitives";
import { contactSignals, contactRecentTrend, daysSince, desiredFreq, closeCircle, RELATIONSHIP_LABEL } from "@/lib/domainUtils";

/* RELATIONSHIPS — who matters. Central Relationship Map + per-person
   state, signals (no score), rhythm, context, patterns, management. */

export default function RelationshipsTab({ data, openPerson }) {
  const [clusterFilter, setClusterFilter] = useState(null);
  const people = useMemo(() => closeCircle(data.contacts, { whatsapps: data.whatsapps, planContactIds: (data.plans || []).flatMap((p) => p.contact_ids || []) }), [data]);

  const types = useMemo(() => {
    const set = new Set();
    people.forEach((c) => c.relationship_type && set.add(c.relationship_type.toLowerCase()));
    return Array.from(set);
  }, [people]);

  const shown = useMemo(() => (clusterFilter ? people.filter((c) => (c.relationship_type || "").toLowerCase() === clusterFilter) : people), [people, clusterFilter]);

  return (
    <div className="space-y-4">
      <ObjectCard kicker="02.1 · 02.3" title="Relationship Map" action={
        <div className="flex flex-wrap gap-1.5 justify-end">
          <button onClick={() => setClusterFilter(null)} className={`text-[9px] uppercase tracking-wide px-2 py-1 rounded-full border ${!clusterFilter ? "bg-olive text-white border-olive" : "border-foreground/15 text-muted-foreground"}`}>All</button>
          {types.map((t) => <button key={t} onClick={() => setClusterFilter(t === clusterFilter ? null : t)} className={`text-[9px] uppercase tracking-wide px-2 py-1 rounded-full border ${clusterFilter === t ? "bg-olive text-white border-olive" : "border-foreground/15 text-muted-foreground"}`}>{t}</button>)}
        </div>
      } bodyClass="flex justify-center">
        {shown.length ? <RelationshipMap contacts={shown} onOpenPerson={openPerson} /> : <EmptyVisual title="YOUR NETWORK" subtitle="Start adding people, or let GIULIA discover relationships from context." />}
      </ObjectCard>

      <ObjectCard kicker="02.4 / 02.5" title="Relationship States · everyone">
        {shown.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shown.slice(0, 12).map((c) => {
              const sig = contactSignals(c, data.whatsapps);
              return (
                <motion.button key={c.id} whileHover={{ y: -2 }} onClick={() => openPerson(c)} className="text-left rounded-xl border border-foreground/10 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{c.name}</span>
                    <Chip tone={c.relationship_state === "CLOSE" ? "olive" : c.relationship_state === "QUIETER_THAN_USUAL" ? "sand" : "neutral"}>{RELATIONSHIP_LABEL[c.relationship_state] || "UNKNOWN"}</Chip>
                  </div>
                  <SignalDots label="Conn" value={sig.connection} />
                  <SignalDots label="Rhythm" value={sig.rhythm} />
                  <SignalDots label="Recent" value={sig.recency} />
                </motion.button>
              );
            })}
          </div>
        ) : <EmptyVisual title="YOUR NETWORK" subtitle="No people yet." />}
      </ObjectCard>

      {shown.length > 0 && (
        <ObjectCard kicker="02.6" title="Relationship Rhythm · overview">
          <div className="space-y-3">
            {shown.slice(0, 6).map((c) => {
              const freq = desiredFreq(c); const since = daysSince(c.last_meaningful_contact_date || c.last_contact_date);
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-[11px] mb-1"><span className="font-medium">{c.name}</span><span className="text-muted-foreground tabular-nums">typical ~{freq}d · {since === Infinity ? "never" : since + "d"}</span></div>
                  <Meter value={Math.max(0, 100 - (since / freq) * 100)} accent={since > freq ? "urgent" : "olive"} />
                </div>
              );
            })}
          </div>
        </ObjectCard>
      )}

      {shown.length > 0 && (
        <ObjectCard kicker="02.9" title="Relationship Patterns">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shown.filter((c) => c.relationship_pattern_note).slice(0, 4).map((c) => (
              <div key={c.id} className="rounded-xl bg-foreground/[0.04] p-3">
                <p className="text-xs font-medium mb-1">{c.name}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{c.relationship_pattern_note}</p>
              </div>
            ))}
            {shown.filter((c) => !c.relationship_pattern_note).length > 0 && <div className="rounded-xl bg-foreground/[0.04] p-3 col-span-full"><p className="text-[11px] text-muted-foreground">No patterns detected yet — patterns emerge from historical rhythm. Positions on the map are a visualisation of recency, never psychological truth.</p></div>}
          </div>
        </ObjectCard>
      )}
    </div>
  );
}