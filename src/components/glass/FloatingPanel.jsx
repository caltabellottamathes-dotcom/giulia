import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { X, GripHorizontal } from "lucide-react";

/**
 * FloatingPanel — spatial glass overlay. Slides in from the chosen side, or —
 * when `draggable` — behaves like a real OS window: a free-positioned panel
 * with a grip strip you can drag by pointer, that sits within the viewport.
 *
 * Positions: right · left · bottom · top · center
 * Glass levels: 2 (subtle), 3 (feature), 4 (modal/focus)
 */

const widthClass = {
  380: "lg:w-[380px]",
  460: "lg:w-[460px]",
  560: "lg:w-[560px]",
  720: "lg:w-[720px]",
  860: "lg:w-[860px]",
  1000: "lg:w-[1000px]",
  1100: "lg:w-[1100px]",
};

const positions = {
  left: "fixed left-4 lg:left-6 top-4 lg:top-6 bottom-4 lg:bottom-6 w-[calc(100%-2rem)] lg:w-[380px] z-50",
  bottom: "fixed left-4 lg:left-6 right-4 lg:right-6 bottom-4 lg:bottom-6 z-50",
  top: "fixed left-4 lg:left-6 right-4 lg:right-6 top-4 lg:top-6 z-50",
  center: "fixed inset-0 z-50 flex items-center justify-center p-6",
};

const animations = {
  right: "animate-slide-right",
  left: "animate-slide-left",
  bottom: "animate-slide-up",
  top: "animate-slide-down",
  center: "animate-scale-in",
};

const glassLevels = { 2: "glass-2", 3: "glass-3", 4: "glass-4" };

export default function FloatingPanel({
  open,
  onClose,
  position = "right",
  level = 3,
  width = 720,
  children,
  className,
  showOverlay = true,
  closeOnOverlay = true,
  draggable = false,
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef({ active: false, sx: 0, sy: 0, bx: 0, by: 0 });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && open) onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const isCenter = position === "center";
  const isWindow = draggable;

  const posClass = isWindow
    ? `fixed top-[4vh] right-4 lg:right-6 z-50 w-[calc(100%-2rem)] ${widthClass[width] || widthClass[720]}`
    : position === "right"
      ? `fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 w-[calc(100%-2rem)] ${widthClass[width] || widthClass[720]} z-50`
      : positions[position];

  const onPointerDown = (e) => {
    if (!isWindow) return;
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, bx: offset.x, by: offset.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    setOffset({
      x: drag.current.bx + (e.clientX - drag.current.sx),
      y: drag.current.by + (e.clientY - drag.current.sy),
    });
  };
  const endDrag = (e) => {
    drag.current.active = false;
    e?.currentTarget?.releasePointerCapture?.(e.pointerId);
  };

  return (
    <>
      {showOverlay && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-charcoal/15 animate-fade-in",
            !closeOnOverlay && "pointer-events-none"
          )}
          onClick={closeOnOverlay ? onClose : undefined}
        />
      )}
      <div
        className={cn(posClass, animations[position], className)}
        style={isWindow ? { transform: `translate(${offset.x}px, ${offset.y}px)`, maxHeight: "92vh" } : undefined}
      >
        <div
          className={cn(
            glassLevels[level] || "glass-3",
            "specular-edge float-shadow rounded-[28px] overflow-hidden relative flex flex-col",
            isCenter ? "w-full max-w-lg max-h-[85vh]" : isWindow ? "h-[88vh]" : "h-full"
          )}
        >
          {isWindow && (
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="glass-grip shrink-0 h-9 flex items-center justify-center border-b border-white/10 select-none"
            >
              <GripHorizontal className="h-4 w-4 text-foreground/40" />
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {children}
        </div>
      </div>
    </>
  );
}