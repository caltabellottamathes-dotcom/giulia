import React, { useState } from "react";
import ConciergeAvatar from "../../giulia/components/ConciergeAvatar";
import ConciergePanel from "../../giulia/components/ConciergePanel";
import { MessageSquare, X } from "lucide-react";

/**
 * ConciergeWidget — the fixed anchor point for the Giulia communication
 * system. Lives in the dashboard layout, not a modal. The avatar is
 * tap-to-talk; the chat-bubble toggle opens the text panel.
 */
export default function ConciergeWidget({ onRemove }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 lg:bottom-7 lg:left-7 z-40 flex flex-col items-start gap-3">
      {open && <ConciergePanel />}
      <div className="flex items-center gap-2">
        <ConciergeAvatar />
        <button
          onClick={() => setOpen((o) => !o)}
          className="h-9 w-9 rounded-full bg-ivory/10 border border-ivory/20 backdrop-blur-md flex items-center justify-center text-ivory/80 hover:text-ivory transition-colors"
          aria-label="Typ naar Giulia"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
        {onRemove && (
          <button
            onClick={onRemove}
            className="h-9 w-9 rounded-full bg-ivory/10 border border-ivory/20 backdrop-blur-md flex items-center justify-center text-ivory/80 hover:text-ivory transition-colors"
            aria-label="Verwijder concierge"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}