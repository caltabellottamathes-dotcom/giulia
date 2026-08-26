import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassPanel from "@/system/components/glass/GlassPanel";
import RelationshipGraph3D from "../RelationshipGraph3D";
import { closeCircle, contactSignals, daysSince } from "@/lib/domainUtils";

const SIGNALS = [
  { key: "connection", label: "Connection" },
  { key: "recency", label: "Recency" },
  { key: "rhythm", label: "Rhythm" },
  { key: "reciprocity", label: "Reciprocity" },
];

function Dots({ value = 0 }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < value ? "bg-olive" : "bg-muted"}`} />
      ))}
    </span>
  );
}

/** RelationshipsSection — §5.2 3D Relationship Map, built from actual
 *  close-circle contacts. Hover shows real signals computed from WhatsApp
 *  history (connection/recency/rhythm/reciprocity) — never a fabricated
 *  health score. */
export default function RelationshipsSection({ contacts = [], whatsapps = [], planContactIds = [] }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const circle = closeCircle(contacts, { whatsapps, planContactIds });
  const changing = contacts.filter((c) => c.relationship_pattern_note).slice(0, 4);

  const handleHover = (c, p) => { setHovered(c); if (p) setPos(p); };
  const signals = hovered ? contactSignals(hovered, whatsapps) : null;

  return (
    <div className="space-y-4">
      <GlassPanel level={2} className="relative h-[480px] overflow-hidden p-0">
        <div className="absolute top-4 left-5 z-10 pointer-events-none">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Relationship Map</p>
          <p className="text-xs text-foreground/60 mt-0.5">{circle.length} close circle · drag to rotate</p>
        </div>

        {circle.length ? (
          <RelationshipGraph3D contacts={circle} onHover={handleHover} onSelect={(c) => navigate(`/people/${c.id}`)} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-1 text-center px-6">
            <p className="text-sm font-medium text-foreground/70">YOUR NETWORK</p>
            <div className="h-px w-10 bg-border my-1" />
            <p className="text-sm text-muted-foreground italic">Start adding people, or let Giulia discover relationships from WhatsApp and email context.</p>
          </div>
        )}

        {hovered && signals && (
          <div className="fixed z-50 w-60 rounded-2xl p-4 pointer-events-none glass-3 shadow-xl" style={{ left: pos.x + 16, top: pos.y - 10 }}>
            <p className="font-display font-semibold text-sm text-foreground">{hovered.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-olive mt-0.5">
              {signals.since === Infinity ? "No contact recorded" : `Last contact ${signals.since}d ago`}
            </p>
            <div className="mt-3 space-y-1.5">
              {SIGNALS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{label}</span>
                  <Dots value={signals[key]} />
                </div>
              ))}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/30 mt-2">
                <span className="text-muted-foreground">Messages</span>
                <span className="text-foreground/85">{signals.sent} sent · {signals.received} received</span>
              </div>
            </div>
          </div>
        )}
      </GlassPanel>

      {changing.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {changing.map((c) => (
            <span key={c.id} className="text-[11px] rounded-full px-3 py-1.5 bg-muted text-foreground/70 border border-border/50">{c.name}: {c.relationship_pattern_note}</span>
          ))}
        </div>
      )}
    </div>
  );
}