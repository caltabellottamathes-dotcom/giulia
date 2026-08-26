import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassPanel from "@/system/components/glass/GlassPanel";
import RelationshipGraph3D from "../RelationshipGraph3D";
import { closeCircle, RELATIONSHIP_LABEL } from "@/lib/domainUtils";

const SIGNAL_LABELS = {
  connection: "Connection", recency: "Recency", rhythm: "Rhythm", reciprocity: "Reciprocity",
  quality: "Quality", context: "Context", intention: "Intention", change: "Change",
};

/** RelationshipsSection — §5.2 3D Relationship Map on the OS's light glass
 *  surface. Drag to rotate, hover a node for its 8-signal health card,
 *  click to open the person. */
export default function RelationshipsSection({ contacts = [] }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const circle = closeCircle(contacts);
  const changing = contacts.filter((c) => c.relationship_pattern_note).slice(0, 4);

  const handleHover = (c, p) => { setHovered(c); if (p) setPos(p); };

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
          <div className="h-full flex items-center justify-center"><p className="text-sm text-muted-foreground italic">No close-circle contacts yet.</p></div>
        )}

        {hovered && (
          <div className="fixed z-50 w-64 rounded-2xl p-4 pointer-events-none glass-3 shadow-xl" style={{ left: pos.x + 16, top: pos.y - 10 }}>
            <p className="font-display font-semibold text-sm text-foreground">{hovered.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-olive mt-0.5">{RELATIONSHIP_LABEL[hovered.relationship_state] || "Unknown"}</p>
            <div className="mt-3 space-y-1.5">
              {Object.entries(SIGNAL_LABELS).map(([k, label]) => (
                <div key={k} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground/85 capitalize">{(hovered.relationship_health?.[k] || "unknown").replace(/_/g, " ")}</span>
                </div>
              ))}
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