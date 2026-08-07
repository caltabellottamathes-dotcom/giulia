import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/**
 * SidebarPanel — the floating glass dock that slides in from the left.
 * Detached from the viewport edges (margin on all sides), grey glass,
 * heavy blur, real depth. The OS "apps" rail.
 */
export default function SidebarPanel({ open, onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && open) onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-3 lg:left-5 top-4 bottom-4 lg:top-5 lg:bottom-5 w-[244px] max-w-[78vw] z-50 lg:z-40",
          "glass-3 depth-2 rounded-[28px] overflow-hidden",
          "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "-translate-x-[130%]"
        )}
      >
        {/* top highlight */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px z-10"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(40 34% 100% / 0.8) 30%, hsl(40 34% 100% / 0.5) 70%, transparent)",
          }}
        />
        <button
          onClick={onClose}
          className="lg:hidden absolute top-5 right-4 z-20 h-8 w-8 rounded-lg glass-1 flex items-center justify-center text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </aside>
    </>
  );
}