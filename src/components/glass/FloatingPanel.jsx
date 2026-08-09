import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * FloatingPanel — spatial glass overlay that slides in from the sides.
 * `width` (px) scales the right-positioned panel so the content determines
 * the size — not every panel needs the same ratio.
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
  dim = true,
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
  const posClass =
    position === "right"
      ? `fixed right-4 lg:right-6 top-4 lg:top-6 bottom-4 lg:bottom-6 w-[calc(100%-2rem)] ${widthClass[width] || widthClass[720]} z-50`
      : positions[position];

  return (
    <>
      {showOverlay && (
        <div
          className={cn(
            "fixed inset-0 z-40 animate-fade-in",
            dim ? "bg-charcoal/15" : "bg-transparent",
            !closeOnOverlay && "pointer-events-none"
          )}
          onClick={closeOnOverlay ? onClose : undefined}
        />
      )}
      <div className={cn(posClass, animations[position], className)}>
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
              className="absolute top-4 left-4 z-10 h-8 w-8 rounded-lg glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
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