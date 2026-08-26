import React, { useMemo, useRef, useState } from "react";
import { ORBIT_TIERS, orbitTier, daysSince } from "@/lib/domainUtils";

/* RelationshipMap — radial orbit around Salvo. People sit on concentric
   rings by recency (inner = today, outer = 2 months). Colour by cluster
   (relationship_type). Edges from Salvo to each person; faint edges between
   people of the same cluster. Hover → info; click → focus + open detail;
   drag → reposition (visual only, never relational meaning). */

const CLUSTER_COLORS = ["#94925d", "#b1bec6", "#d8dab3", "#7a7a44", "#595f34", "#cfd9dd"];

function clusterIndex(contact, types) {
  const t = (contact?.relationship_type || "").toLowerCase();
  const idx = types.indexOf(t);
  return idx >= 0 ? idx : types.length;
}

export default function RelationshipMap({ contacts = [], onOpenPerson }) {
  const types = useMemo(() => {
    const set = new Set();
    contacts.forEach((c) => c.relationship_type && set.add(c.relationship_type.toLowerCase()));
    return Array.from(set);
  }, [contacts]);

  const people = useMemo(() => contacts.filter((c) => c.name && !((c.name || "").toLowerCase().includes("salvatore"))).slice(0, 18), [contacts]);

  const base = useMemo(() => {
    const map = {};
    people.forEach((c, i) => {
      const tier = orbitTier(daysSince(c.last_contact_date));
      const angle = (i / Math.max(1, people.length)) * Math.PI * 2 - Math.PI / 2;
      map[c.id] = { x: 200 + Math.cos(angle) * tier.r * 3.6, y: 200 + Math.sin(angle) * tier.r * 3.6 };
    });
    return map;
  }, [people]);

  const [overrides, setOverrides] = useState({});
  const posOf = (id) => overrides[id] || base[id] || { x: 200, y: 200 };

  const [hover, setHover] = useState(null);
  const [focus, setFocus] = useState(null);
  const dragRef = useRef(null);

  const onPointerDown = (e, id) => {
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: posOf(id).x, oy: posOf(id).y };
    e.target.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const rect = e.currentTarget.getBoundingClientRect?.();
    const scale = rect ? 400 / rect.width : 1;
    const dx = (e.clientX - d.sx) * scale;
    const dy = (e.clientY - d.sy) * scale;
    setOverrides((o) => ({ ...o, [d.id]: { x: Math.max(20, Math.min(380, d.ox + dx)), y: Math.max(20, Math.min(380, d.oy + dy)) } }));
  };
  const onPointerUp = () => { dragRef.current = null; };

  const ringRadii = [7, 13, 20, 28, 35, 44].map((r) => r * 3.6);

  return (
    <div className="relative w-full max-w-[440px] mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-auto touch-none" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        {ringRadii.map((r, i) => <circle key={i} cx="200" cy="200" r={r} fill="none" stroke="hsl(var(--foreground) / 0.08)" strokeDasharray="2 4" />)}
        {people.map((a, i) => people.map((b, j) => {
          if (j <= i || clusterIndex(a, types) !== clusterIndex(b, types)) return null;
          const pa = posOf(a.id), pb = posOf(b.id);
          return Math.hypot(pa.x - pb.x, pa.y - pb.y) < 120 ? <line key={`${i}-${j}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={CLUSTER_COLORS[clusterIndex(a, types) % 6]} strokeWidth="0.5" opacity="0.25" /> : null;
        }))}
        {people.map((c) => {
          const p = posOf(c.id); const isFocus = focus === c.id || hover === c.id;
          return <line key={`e${c.id}`} x1="200" y1="200" x2={p.x} y2={p.y} stroke={isFocus ? CLUSTER_COLORS[clusterIndex(c, types) % 6] : "hsl(var(--foreground) / 0.12)"} strokeWidth={isFocus ? 1.2 : 0.6} opacity={isFocus ? 0.7 : 0.4} />;
        })}
        <circle cx="200" cy="200" r="9" fill="hsl(var(--olive))" />
        <circle cx="200" cy="200" r="14" fill="none" stroke="hsl(var(--olive))" strokeWidth="0.8" opacity="0.4">
          <animate attributeName="r" values="14;20;14" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <text x="200" y="224" textAnchor="middle" fontSize="9" fill="hsl(var(--foreground))" style={{ letterSpacing: "0.1em" }} className="font-display">SALVO</text>
        {people.map((c) => {
          const p = posOf(c.id); const col = CLUSTER_COLORS[clusterIndex(c, types) % 6]; const isFocus = focus === c.id || hover === c.id;
          const initials = (c.name || "").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
          return (
            <g key={c.id} onPointerDown={(e) => onPointerDown(e, c.id)} onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)} onClick={() => { setFocus(c.id); onOpenPerson?.(c); }} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={isFocus ? 12 : 8} fill={col} stroke="hsl(var(--card))" strokeWidth="1.5" />
              <text x={p.x} y={p.y + 2} textAnchor="middle" fontSize="6.5" fill="hsl(var(--card))" style={{ pointerEvents: "none" }} className="font-display">{initials}</text>
              {isFocus && <text x={p.x} y={p.y - 16} textAnchor="middle" fontSize="7.5" fill="hsl(var(--foreground))" style={{ pointerEvents: "none" }} className="font-display">{(c.name || "").split(" ")[0].toUpperCase()}</text>}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {types.map((t, i) => <div key={t} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: CLUSTER_COLORS[i % 6] }} /><span className="text-[9px] uppercase tracking-wide text-muted-foreground">{t || "other"}</span></div>)}
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-muted-foreground"><span className="h-2 w-2 rounded-full bg-olive" />inner = recent</div>
      </div>
      {hover && (() => { const c = people.find((p) => p.id === hover); if (!c) return null; const d = daysSince(c.last_contact_date); return (
        <div className="absolute top-2 right-2 rounded-lg border border-foreground/10 bg-card px-3 py-2 text-[11px] shadow-sm max-w-[200px]">
          <p className="font-medium">{c.name}</p>
          <p className="text-muted-foreground">{c.relationship_type || "—"} · {d === Infinity ? "never" : `${d}d ago`}</p>
        </div>
      ); })()}
    </div>
  );
}