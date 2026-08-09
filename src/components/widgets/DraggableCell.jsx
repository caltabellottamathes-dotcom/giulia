import React from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DraggableCell — one reorderable dashboard tile. Drag via the grip pill on
 * top (pointer/touch); the widget content stays fully interactive. Remove via
 * the corner control. Position order is persisted by the parent on reorder.
 */
export default function DraggableCell({ widget, def, className, onRemove }) {
  const controls = useDragControls();
  const Comp = def.Component;
  return (
    <Reorder.Item
      value={widget.id}
      dragListener={false}
      dragControls={controls}
      className={cn("h-full list-none", className)}
      style={{ touchAction: "none" }}
    >
      <div className="relative group h-full">
        {/* Drag handle */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-40 h-5 w-16 rounded-full bg-charcoal/85 text-ivory flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
          aria-label="Slepen"
        >
          <GripVertical className="h-3 w-3" />
        </div>
        {/* Remove */}
        <button
          onClick={() => onRemove(widget.id)}
          className="absolute top-1.5 right-1.5 z-40 h-6 w-6 rounded-full bg-ivory/90 text-charcoal shadow-sm flex items-center justify-center hover:text-destructive opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
          aria-label="Verwijderen"
        >
          <X className="h-3 w-3" />
        </button>
        <div className="h-full">
          <Comp />
        </div>
      </div>
    </Reorder.Item>
  );
}