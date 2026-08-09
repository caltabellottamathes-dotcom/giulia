import React, { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import WidgetTile from "@/components/widgets/WidgetTile";
import { WIDGETS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const COLS = 3;
const COL_W = 340;
const ROW_H = 300;
const GAP = 22;

function initialPos(i) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const stagger = row % 2 ? 36 : 0;
  return { x: col * (COL_W + GAP) + stagger + 8, y: row * (ROW_H + GAP) + 96 };
}

const QUICK = [
  { to: "/agenda", label: "Agenda", img: IMAGES.sittingChairs },
  { to: "/projects", label: "Projecten", img: IMAGES.feetChair },
  { to: "/email", label: "Email", img: IMAGES.walkingChairs },
  { to: "/whatsapp", label: "WhatsApp", img: IMAGES.topDownWalk },
  { to: "/chat", label: "Chat", img: IMAGES.portraitBootFace },
  { to: "/knowledge", label: "Kennis", img: IMAGES.portraitThinking },
];

/**
 * DesktopCanvas — the OS desktop. Widgets are free, overlapping, draggable
 * windows over a photographic backdrop (persisted x/y). A quick-access dock of
 * photo-buttons jumps to the main pages.
 */
export default function DesktopCanvas({ widgets, onRemove, onMove, onAdd, userName, panelOpen }) {
  const canvasRef = useRef(null);
  const [zMap, setZMap] = useState({});
  const [zMax, setZMax] = useState(20);

  const sorted = [...widgets].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
  const name = userName ? userName.split(" ")[0] : "Salvo";

  const focus = (id) => {
    const next = zMax + 1;
    setZMax(next);
    setZMap((m) => ({ ...m, [id]: next }));
  };

  return (
    <div ref={canvasRef} className="relative h-[calc(100svh-3.5rem)] overflow-hidden">
      {/* Photographic backdrop */}
      <div className={cn("absolute inset-0 z-0 transition-opacity duration-700", panelOpen && "opacity-40")}>
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-background/35 via-transparent to-charcoal/25" />
      </div>

      {/* Greeting */}
      <div className={cn("absolute top-6 left-8 z-20 max-w-[60%] transition-all duration-700", panelOpen && "opacity-0 -translate-x-6")}>
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 font-semibold mb-2">
          {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-5xl font-display font-semibold tracking-[-0.02em] text-foreground text-shadow-soft leading-none">
          {greet}, {name}.
        </h1>
      </div>

      {/* Add widget */}
      <button
        onClick={onAdd}
        className="absolute top-6 right-8 z-20 inline-flex items-center gap-2 rounded-full glass-1 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-foreground/5 transition"
      >
        <Plus className="h-4 w-4" /> Widget
      </button>

      {/* Free, overlapping widgets */}
      {sorted.map((w, i) => {
        const def = WIDGETS[w.widget_type];
        if (!def) return null;
        const hasPos = w.x || w.y;
        const pos = hasPos ? { x: w.x, y: w.y } : initialPos(i);
        const tile = { ...w, x: pos.x, y: pos.y };
        return (
          <WidgetTile
            key={w.id}
            widget={tile}
            def={def}
            zIndex={zMap[w.id] || 10 + i}
            canvasRef={canvasRef}
            onMove={onMove}
            onRemove={onRemove}
            onFocus={focus}
          />
        );
      })}

      {/* Quick-access dock — photo buttons to the main pages */}
      <div
        className={cn(
          "absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-end gap-2 rounded-full glass-2 specular-edge px-3 py-2 transition-all duration-700",
          panelOpen && "opacity-0 translate-y-6 pointer-events-none"
        )}
      >
        {QUICK.map((q) => (
          <NavLink key={q.to} to={q.to} className="group flex flex-col items-center gap-1 px-1">
            <span className="h-11 w-11 rounded-full overflow-hidden border border-white/30 group-hover:scale-105 transition shadow-sm">
              <img src={q.img} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="text-[8px] uppercase tracking-wide text-foreground/70 font-semibold">{q.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}