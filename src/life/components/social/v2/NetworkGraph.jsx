import React, { useMemo, useRef, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY } from "d3";
import { contactSignals, daysSince, desiredFreq } from "@/lib/domainUtils";
import { SignalDots } from "./primitives";

/* ── NetworkGraph — §2.1 interactieve force-directed netwerkgrafiek.
 * Eigen d3-force simulatie + canvas-render (geen library-default).
 * Salvo = centraal knooppunt. Nodes = mensen (kleur = recency-zone,
 * gloed = overdue). Hover → signal popover; click → focus; drag → visueel. */

const LIFE = {
  ridgeSky: "#b1bec6",
  pistachio: "#d8dab3",
  olive: "#94925d",
  urgent: "#d5e24a",
  smoke: "#8a8a82",
  charcoal: "#4a4a44",
};

function nodeColor(c) {
  const since = daysSince(c.last_meaningful_contact_date || c.last_contact_date);
  const freq = desiredFreq(c);
  if (since > freq) return LIFE.urgent;
  if (since <= 7) return LIFE.ridgeSky;
  if (since <= 21) return LIFE.pistachio;
  return LIFE.olive;
}

export default function NetworkGraph({ contacts = [], whatsapps = [], onHover, onSelect, width = 600, height = 460 }) {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const nodesRef = useRef([]);
  const [hovered, setHovered] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [tick, setTick] = useState(0);

  const graph = useMemo(() => {
    const center = { id: "__salvo", name: "SALVO", __center: true, fx: width / 2, fy: height / 2 };
    const nodes = [center, ...contacts.map((c) => ({ id: c.id, name: c.name, contact: c }))];
    const links = contacts.map((c) => ({ source: "__salvo", target: c.id }));
    contacts.forEach((c, i) => {
      contacts.forEach((c2, j) => {
        if (j <= i) return;
        const s1 = contactSignals(c, whatsapps);
        const s2 = contactSignals(c2, whatsapps);
        if (s1.connection + s2.connection > 4) links.push({ source: c.id, target: c2.id, weak: true });
      });
    });
    return { nodes, links };
  }, [contacts, whatsapps, width, height]);

  useEffect(() => {
    const sim = forceSimulation(graph.nodes)
      .force("link", forceLink(graph.links).id((d) => d.id).distance((l) => (l.source.__center ? 80 : 130)).strength(0.2))
      .force("charge", forceManyBody().strength(-140))
      .force("collide", forceCollide().radius((d) => (d.__center ? 22 : 14)))
      .force("x", forceX(width / 2).strength(0.04))
      .force("y", forceY(height / 2).strength(0.04))
      .on("tick", () => setTick((t) => t + 1));
    simRef.current = sim;
    nodesRef.current = graph.nodes;
    return () => sim.stop();
  }, [graph, width, height]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    // links
    graph.links.forEach((l) => {
      ctx.strokeStyle = l.weak ? "rgba(148,146,93,0.12)" : "rgba(148,146,93,0.30)";
      ctx.lineWidth = l.weak ? 0.5 : 1.2;
      ctx.beginPath();
      ctx.moveTo(l.source.x, l.source.y);
      ctx.lineTo(l.target.x, l.target.y);
      ctx.stroke();
    });
    // nodes
    graph.nodes.forEach((n) => {
      if (n.__center) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 16, 0, 2 * Math.PI);
        ctx.fillStyle = LIFE.charcoal;
        ctx.fill();
        ctx.strokeStyle = LIFE.urgent;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "700 13px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("S", n.x, n.y);
        return;
      }
      const c = n.contact;
      const color = nodeColor(c);
      const since = daysSince(c.last_meaningful_contact_date || c.last_contact_date);
      const overdue = since > desiredFreq(c);
      const r = 7 + Math.min(6, contactSignals(c, whatsapps).connection * 0.8);
      if (overdue) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 5, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(213,226,74,0.16)";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.font = "600 9px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText((c.name || "").split(" ")[0], n.x, n.y + r + 3);
    });
  }, [graph, whatsapps, width, height]);

  useEffect(() => { draw(); }, [tick, draw]);

  const handleMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * width;
    const my = ((e.clientY - rect.top) / rect.height) * height;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    const hit = nodesRef.current.find((n) => n.contact && Math.hypot(n.x - mx, n.y - my) < 14);
    setHovered(hit?.contact || null);
    onHover?.(hit?.contact || null);
    canvas.style.cursor = hit ? "pointer" : "default";
  };
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * width;
    const my = ((e.clientY - rect.top) / rect.height) * height;
    const hit = nodesRef.current.find((n) => n.contact && Math.hypot(n.x - mx, n.y - my) < 14);
    if (hit?.contact) onSelect?.(hit.contact);
  };

  const signals = hovered ? contactSignals(hovered, whatsapps) : null;

  return (
    <div className="relative w-full" style={{ height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: "100%", height: "100%" }}
        onMouseMove={handleMove}
        onMouseLeave={() => { setHovered(null); onHover?.(null); }}
        onClick={handleClick}
      />
      {hovered && signals && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute z-20 w-56 glass-3 rounded-2xl p-4 pointer-events-none"
          style={{ left: Math.min(pos.x + 16, width - 230), top: Math.max(8, pos.y - 60) }}
        >
          <p className="font-display font-semibold text-sm text-foreground">{hovered.name}</p>
          <p className="text-[9px] uppercase tracking-widest text-olive mt-0.5">
            {signals.since === Infinity ? "No contact recorded" : `${signals.since}d since meaningful`}
          </p>
          <div className="mt-3 space-y-1.5">
            {[["Connection", signals.connection], ["Recency", signals.recency], ["Rhythm", signals.rhythm], ["Reciprocity", signals.reciprocity]].map(([label, v]) => (
              <div key={label} className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{label}</span>
                <SignalDots value={v} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}