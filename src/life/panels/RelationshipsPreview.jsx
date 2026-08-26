import React, { useEffect, useMemo, useState } from "react";
import PreviewShell from "@/system/panels/PreviewShell";
import { base44 } from "@/api/base44Client";
import { closeCircle, daysSince, orbitTier, ORBIT_TIERS, RELATIONSHIP_LABEL } from "@/lib/domainUtils";

const LIGHT = "#d8dab3";
const IVORY = "#ffffff";

const STATE_COLOR = {
  ACTIVE: "#d8dab3", CLOSE: "#94925d", QUIET: "#8fa3b6", QUIETER_THAN_USUAL: "#c6a15b",
  EMERGING: "#b7c9d6", RECONNECTING: "#d5e24a", CHANGING: "#e08e6d", UNKNOWN: "#7a7a7a",
};

/** RelationshipsPreview — §14.1 RELATIONSHIPS-tab: Relationship Map (datavisualisatie,
 *  géén psychologische afstand) + states + patterns. "Who matters?" */
export default function RelationshipsPreview({ onOpen }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setContacts((await base44.entities.Contact.filter({}, "name", 200).catch(() => [])) || []); }
      finally { setLoading(false); }
    })();
  }, []);

  const circle = useMemo(
    () => closeCircle(contacts).slice().sort((a, b) => daysSince(a.last_contact_date) - daysSince(b.last_contact_date)).slice(0, 10),
    [contacts]
  );
  const orbit = useMemo(() => circle.map((c, i) => {
    const days = daysSince(c.last_meaningful_contact_date || c.last_contact_date);
    const tier = orbitTier(days);
    const a = (i / Math.max(circle.length, 1)) * 360 - 90;
    return { contact: c, days, r: tier.r, color: tier.color, a };
  }), [circle]);

  const changing = contacts.filter((c) => c.relationship_pattern_note).slice(0, 3);

  return (
    <PreviewShell index="01" section="RELATIONSHIPS" statement="Who matters?" kicker={`${circle.length} CLOSE CIRCLE \u00b7 ${changing.length} CHANGING`} accent={LIGHT}
      context={[
        { label: "MAP", text: "Position reflects recency data \u2014 not psychological distance." },
        { label: "PATTERNS", text: changing.length ? changing.map((c) => c.relationship_pattern_note).join(" \u00b7 ") : "No pattern shifts detected." },
        { label: "PRINCIPLE", text: "Contact frequency \u2260 relationship health." },
      ]}
      actions={[{ label: "Overview", to: "/life/social?view=overview" }, { label: "Pulse", to: "/life/social?view=pulse" }, { label: "Planner", primary: true, to: "/life/social?view=planner" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 h-full overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-[220px]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {ORBIT_TIERS.map((t, i) => (
                <circle key={i} cx="50" cy="50" r={t.r} fill="none" stroke={IVORY} strokeOpacity={0.08} strokeWidth="0.4" strokeDasharray="1.4 2.2" />
              ))}
              {orbit.map((o, i) => {
                const rad = (o.a * Math.PI) / 180;
                const x = 50 + Math.cos(rad) * o.r, y = 50 + Math.sin(rad) * o.r;
                return (
                  <g key={i}>
                    <line x1="50" y1="50" x2={x} y2={y} stroke={o.color} strokeWidth="0.7" opacity={0.6} />
                    <circle cx={x} cy={y} r="3" fill={STATE_COLOR[o.contact.relationship_state] || o.color} />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-storm/50 text-[10px] tracking-[0.25em] mb-2">RELATIONSHIP STATES</p>
          <div className="flex-1 overflow-auto pr-1 space-y-1.5">
            {loading ? <p className="text-storm/40 text-sm">Loading…</p> : circle.length ? circle.map((c) => (
              <div key={c.id} onClick={onOpen} className="flex items-center gap-3 rounded-xl border border-marble/20 bg-marble/5 px-3 py-2.5 cursor-pointer hover:bg-marble/10 transition">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: STATE_COLOR[c.relationship_state] || "#7a7a7a" }} />
                <span className="text-sm text-storm flex-1 truncate">{c.name}</span>
                <span className="text-[10px] text-storm/50 uppercase tracking-wide">{RELATIONSHIP_LABEL[c.relationship_state] || "Unknown"}</span>
              </div>
            )) : <p className="text-sm text-storm/45 italic px-1">No close-circle contacts yet.</p>}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}