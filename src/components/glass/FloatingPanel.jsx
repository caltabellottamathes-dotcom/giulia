import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * FloatingPanel — spatial glass overlay that slides in from the sides.
 * Panels are DETACHED from the viewport edges (margin on all sides),
 * floating with shadow — like a translucent card hovering above the workspace.
 *
 * Positions:
 *   right  → approvals, actions, contextual info, AI suggestions
 *   left   → navigation, filters, context, collections
 *   bottom → Giulia, chat previews, voice
 *   top    → notifications, urgent information
 *   center → modal / focus panel (glass-4)
 *
 * Glass levels: 2 (subtle), 3 (feature), 4 (modal/focus)
 */

const positions = {
  right:
    "fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 w-[calc(100%-2rem)] lg:w-[720px] z-50",
  left:
    "fixed left-4 lg:left-6 top-4 lg:top-6 bottom-4 lg:bottom-6 w-[calc(100%-2rem)] lg:w-[380px] z-50",
  bottom:
    "fixed left-4 lg:left-6 right-4 lg:right-6 bottom-4 lg:bottom-6 z-50",
  top:
    "fixed left-4 lg:left-6 right-4 lg:right-6 top-4 lg:top-6 z-50",
  center:
    "fixed inset-0 z-50 flex items-center justify-center p-6",
};

const animations = {
  right: "animate-slide-right",
  left: "animate-slide-left",
  bottom: "animate-slide-up",
  top: "animate-slide-down",
  center: "animate-scale-in",
};

const glassLevels = {
  2: "glass-2",
  3: "glass-3",
  4: "glass-4",
};

export default function FloatingPanel({
  open,
  onClose,
  position = "right",
  level = 3,
  children,
  className,
  showOverlay = true,
  closeOnOverlay = true,
}) {
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
        className={cn(
          positions[position],
          animations[position],
          className
        )}
      >
        <div
          className={cn(
            glassLevels[level] || "glass-3",
            "float-shadow rounded-[28px] overflow-hidden relative flex flex-col",
            isCenter ? "w-full max-w-lg max-h-[85vh]" : "h-full"
          )}
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-lg glass-1 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
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