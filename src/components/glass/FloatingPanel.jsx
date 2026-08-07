import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const positions = {
  right: "fixed right-0 top-0 bottom-0 w-full max-w-md z-50 animate-slide-right",
  left: "fixed left-0 top-0 bottom-0 w-full max-w-sm z-50 animate-slide-left",
  bottom: "fixed left-0 right-0 bottom-0 z-50 animate-slide-up",
  center: "fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in",
};

export default function FloatingPanel({
  open,
  onClose,
  position = "right",
  children,
  className,
  showOverlay = true,
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

  return (
    <>
      {showOverlay && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/10 backdrop-blur-[2px] animate-fade-in"
          onClick={onClose}
        />
      )}
      <div className={cn(positions[position], className)}>
        {position === "center" ? (
          <div className="glass-3 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-8 relative">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {children}
          </div>
        ) : (
          <div className="glass-3 h-full overflow-y-auto p-8 relative">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {children}
          </div>
        )}
      </div>
    </>
  );
}