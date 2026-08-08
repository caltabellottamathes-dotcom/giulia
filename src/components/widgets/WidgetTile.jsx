import React from "react";
import { motion, useMotionValue, useDragControls } from "framer-motion";
import { X } from "lucide-react";

/**
 * WidgetTile — a freely-draggable, overlapping widget on the spatial canvas.
 * Drag via the handle pill at the top; inner content stays interactive.
 * Position is controlled with motion values and persisted on drag end.
 */
export default function WidgetTile({ widget, def, zIndex, canvasRef, onMove, onRemove, onFocus }) {
  const x = useMotionValue(widget.x || 0);
  const y = useMotionValue(widget.y || 0);
  const controls = useDragControls();
  const Comp = def.Component;
  const width = def.w || (def.span >= 8 ? 350 : 300);

  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={canvasRef}
      style={{ x, y, position: "absolute", zIndex, width }}
      onDragStart={() => onFocus?.(widget.id)}
      onDragEnd={() => onMove?.(widget.id, x.get(), y.get())}
      whileDrag={{ scale: 1.03 }}
      className="touch-none"
    >
      <div className="relative group">
        {/* Drag handle */}
        <div
          onPointerDown={(e) => controls.start(e)}
          style={{ touchAction: "none" }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 h-6 w-20 rounded-full bg-sand flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm opacity-100 lg:opacity-50 lg:group-hover:opacity-100 transition-opacity"
          aria-label="Slepen"
        >
          <span className="block h-1 w-8 rounded-full bg-ivory/55" />
        </div>

        {/* Remove */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.(widget.id); }}
          className="absolute top-1.5 right-1.5 z-30 h-7 w-7 rounded-full bg-ivory text-charcoal shadow-sm flex items-center justify-center hover:text-destructive opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
          aria-label="Verwijderen"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <Comp />
      </div>
    </motion.div>
  );
}