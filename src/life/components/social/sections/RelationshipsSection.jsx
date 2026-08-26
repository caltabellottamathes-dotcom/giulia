import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RelationshipGraph3D from "../RelationshipGraph3D";
import { LIFE } from "../socialColors";
import { closeCircle, RELATIONSHIP_LABEL } from "@/lib/domainUtils";

const SIGNAL_LABELS = {
  connection: "Connection", recency: "Recency", rhythm: "Rhythm", reciprocity: "Reciprocity",
  quality: "Quality", context: "Context", intention: "Intention", change: "Change",
};

/** RelationshipsSection — §5.2 3D Relationship Map. Roteerbaar; hover toont
 *  de 8-signaal health-kaart; klik navigeert naar de persoon. */
export default function RelationshipsSection({ contacts = [] }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const circle = closeCircle(contacts);
  const changing = contacts.filter((c) => c.relationship_pattern_note).slice(0, 4);

  const handleHover = (c, p) => { setHovered(c); if (p) setPos(p); };

  return (
    <div className="relative h-full min-h-[560px] rounded-[28px] overflow-hidden" style={{ background: "radial-gradient(circle at 30% 20%, rgba(148,146,93,0.14), transparent 60%), #161616" }}>
      <div className="absolute top-5 left-6 z-10 pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: LIFE.morningDew }}>Relationship Map</p>
        <p className="text-white/40 text-[11px] mt-1">{circle.length} close circle · drag to rotate</p>
      </div>

      {circle.length ? (
        <RelationshipGraph3D contacts={circle} onHover={handleHover} onSelect={(c) => navigate(`/people/${c.id}`)} />
      ) : (
        <div className="h-full flex items-center justify-center"><p className="text-white/35 text-sm italic">No close-circle contacts yet.</p></div>
      )}

      {hovered && (
        <div className="fixed z-50 w-64 rounded-2xl p-4 pointer-events-none" style={{ left: pos.x + 16, top: pos.y - 10, background: "rgba(20,20,20,0.94)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}>
          <p className="text-white font-display font-semibold text-sm">{hovered.name}</p>
          <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: LIFE.pistachio }}>{RELATIONSHIP_LABEL[hovered.relationship_state] || "Unknown"}</p>
          <div className="mt-3 space-y-1.5">
            {Object.entries(SIGNAL_LABELS).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between text-[11px]">
                <span className="text-white/45">{label}</span>
                <span className="text-white/85 capitalize">{(hovered.relationship_health?.[k] || "unknown").replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {changing.length > 0 && (
        <div className="absolute bottom-5 left-6 right-6 z-10 flex flex-wrap gap-2">
          {changing.map((c) => (
            <span key={c.id} className="text-[11px] rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.06)", color: LIFE.morningDew, border: "1px solid rgba(255,255,255,0.1)" }}>
              {c.name}: {c.relationship_pattern_note}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}