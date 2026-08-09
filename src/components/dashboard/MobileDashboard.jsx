import React, { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { WIDGETS } from "@/lib/widgetRegistry";
import { cn } from "@/lib/utils";
import DraggableCell from "@/components/widgets/DraggableCell";

const DESKTOP_SPAN = { 3: "lg:col-span-3", 4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6", 8: "lg:col-span-8" };
const MOBILE_SPAN = {
  giulia: "col-span-2 row-span-2",
  giuliaHero: "col-span-1 row-span-2",
  activity: "col-span-2",
  projects: "col-span-2",
  insights: "col-span-2",
};

/**
 * MobileDashboard — one fixed screen, like an OS home. Every visible widget
 * fits in the viewport with no scrolling: a 2-col grid whose rows share the
 * height equally (1fr). Tiles shrink to fit (see .dash-grid CSS override).
 * Still draggable to reorder.
 */
export default function MobileDashboard({ widgets, onReorder, onRemove }) {
  const [order, setOrder] = useState([]);

  useEffect(() => {
    const sorted = [...widgets].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    setOrder(sorted.map((w) => w.id));
  }, [widgets]);

  if (order.length === 0) return null;

  return (
    <Reorder.Group
      axis="y"
      values={order}
      onReorder={onReorder}
      className="dash-grid grid grid-cols-2 gap-2.5 auto-rows-fr h-[calc(100svh-7.5rem)] overflow-hidden px-3 pt-2"
    >
      {order.map((id) => {
        const w = widgets.find((x) => x.id === id);
        if (!w) return null;
        const def = WIDGETS[w.widget_type];
        if (!def) return null;
        const span = cn(MOBILE_SPAN[w.widget_type] || "col-span-1");
        return <DraggableCell key={w.id} widget={w} def={def} className={span} onRemove={onRemove} />;
      })}
    </Reorder.Group>
  );
}