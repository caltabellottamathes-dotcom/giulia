import React, { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { NavLink } from "react-router-dom";
import { WIDGETS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import DraggableCell from "@/components/widgets/DraggableCell";

// Editorial bento spans (12-col grid). The hero is tall-left, the briefing
// wide-top, the rest flow as a tidy, readable arrangement.
const SPAN = {
  giuliaHero: "col-span-3 row-span-2",
  giulia: "col-span-6 row-span-1",
  approvals: "col-span-3 row-span-1",
  agenda: "col-span-4 row-span-1",
  tasks: "col-span-4 row-span-1",
  email: "col-span-4 row-span-1",
  whatsapp: "col-span-4 row-span-1",
  insights: "col-span-3 row-span-1",
  projects: "col-span-4 row-span-1",
  people: "col-span-3 row-span-1",
  documents: "col-span-3 row-span-1",
  knowledge: "col-span-4 row-span-1",
  activity: "col-span-6 row-span-1",
  memory: "col-span-3 row-span-1",
};

const QUICK = [
  { to: "/agenda", label: "Agenda", img: IMAGES.sittingChairs },
  { to: "/projects", label: "Projecten", img: IMAGES.feetChair },
  { to: "/email", label: "Email", img: IMAGES.walkingChairs },
  { to: "/whatsapp", label: "WhatsApp", img: IMAGES.topDownWalk },
  { to: "/chat", label: "Chat", img: IMAGES.portraitBootFace },
  { to: "/knowledge", label: "Kennis", img: IMAGES.portraitThinking },
];

/**
 * DesktopDashboard — the best of every version: an editorial, draggable
 * bento that's readable on every desktop/tablet size (no chaotic overlap),
 * over a photographic backdrop, with a floating greeting and a photo dock
 * for quick access to the main pages.
 */
export default function DesktopDashboard({ widgets, onReorder, onRemove, onAdd, userName, panelOpen }) {
  const [order, setOrder] = useState([]);

  useEffect(() => {
    const sorted = [...widgets].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    setOrder(sorted.map((w) => w.id));
  }, [widgets]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
  const name = userName ? userName.split(" ")[0] : "Salvo";

  return (
    <div className="relative h-[calc(100svh-3.5rem)] overflow-hidden">
      {/* Photographic backdrop */}
      <div className={cn("absolute inset-0 z-0 transition-opacity duration-700", panelOpen && "opacity-30")}>
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/10 to-charcoal/20" />
      </div>

      {/* Floating greeting */}
      <div className={cn("absolute top-5 left-6 lg:left-8 z-20 max-w-[60%] transition-all duration-700", panelOpen && "opacity-0 -translate-x-6")}>
        <p className="text-[10px] lg:text-[11px] uppercase tracking-[0.28em] text-foreground/70 font-semibold mb-1.5">
          {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-3xl lg:text-5xl font-display font-semibold tracking-[-0.02em] text-foreground text-shadow-soft leading-none">
          {greet}, {name}.
        </h1>
      </div>

      {/* Add widget */}
      <button
        onClick={onAdd}
        className="absolute top-5 right-6 lg:right-8 z-20 inline-flex items-center gap-2 rounded-full glass-1 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-foreground/5 transition"
      >
        <Plus className="h-4 w-4" /> Widget
      </button>

      {/* Editorial bento grid */}
      <Reorder.Group
        axis="y"
        values={order}
        onReorder={onReorder}
        className="dash-grid relative z-10 grid grid-cols-12 gap-3 lg:gap-4 auto-rows-[210px] h-[calc(100svh-3.5rem)] overflow-y-auto overflow-x-hidden px-6 lg:px-8 pt-24 pb-28"
      >
        {order.map((id) => {
          const w = widgets.find((x) => x.id === id);
          if (!w) return null;
          const def = WIDGETS[w.widget_type];
          if (!def) return null;
          const span = SPAN[w.widget_type] || "col-span-3 row-span-1";
          return <DraggableCell key={w.id} widget={w} def={def} className={span} onRemove={onRemove} />;
        })}
      </Reorder.Group>

      {/* Quick-access dock — photo buttons to the main pages */}
      <div
        className={cn(
          "absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-end gap-2 rounded-full glass-2 specular-edge px-3 py-2 max-w-[92vw] overflow-x-auto no-scrollbar transition-all duration-700",
          panelOpen && "opacity-0 translate-y-6 pointer-events-none"
        )}
      >
        {QUICK.map((q) => (
          <NavLink key={q.to} to={q.to} className="group flex flex-col items-center gap-1 px-1 shrink-0">
            <span className="h-10 w-10 lg:h-11 lg:w-11 rounded-full overflow-hidden border border-white/30 group-hover:scale-105 transition shadow-sm">
              <img src={q.img} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="text-[8px] uppercase tracking-wide text-foreground/70 font-semibold">{q.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}