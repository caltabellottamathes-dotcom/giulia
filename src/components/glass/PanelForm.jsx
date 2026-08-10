import React from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";

/**
 * PanelForm — consistent create/edit side panel: a fixed header (title +
 * optional eyebrow), a scrollable body, and a pinned footer with action
 * buttons. Content is never cut off and the actions are always reachable.
 */
export default function PanelForm({ open, onClose, title, eyebrow, children, footer, width = 460, ...rest }) {
  return (
    <FloatingPanel open={open} onClose={onClose} position="right" width={width} {...rest}>
      <div className="flex flex-col h-full">
        <div className="shrink-0 px-7 lg:px-8 pt-7 pb-4 border-b border-border/40">
          {eyebrow && (
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-1.5">{eyebrow}</p>
          )}
          <h2 className="text-xl font-display font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-7 lg:px-8 py-6 space-y-4">
          {children}
        </div>
        {footer && (
          <div className="shrink-0 px-7 lg:px-8 py-4 border-t border-border/40 flex items-center gap-2">
            {footer}
          </div>
        )}
      </div>
    </FloatingPanel>
  );
}