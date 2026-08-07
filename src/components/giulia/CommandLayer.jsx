import React, { useState, useMemo, useEffect } from "react";
import FloatingPanel from "@/components/glass/FloatingPanel";
import { usePanel } from "@/lib/PanelContext";
import { MODULES } from "@/lib/moduleRegistry";
import { Search } from "lucide-react";

/**
 * Global command layer — Spotlight/Raycast-style, invocable from anywhere
 * (Cmd/Ctrl+K, or the ambient presence light), typed input, aware of every module.
 */
export default function CommandLayer({ open, onClose }) {
  const [query, setQuery] = useState("");
  const { openModule } = usePanel();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(MODULES).filter(([, m]) => !q || m.label.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = (key) => {
    openModule(key);
    onClose();
  };

  return (
    <FloatingPanel open={open} onClose={onClose} position="center" level={4}>
      <div className="absolute inset-0 liquid-glass-surface rounded-2xl" />
      <div className="relative z-10 flex flex-col max-h-[70vh]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vraag Giulia, of ga naar..."
            className="bg-transparent text-sm flex-1 focus:outline-none placeholder:text-muted-foreground/50"
          />
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">ESC</span>
        </div>
        <div className="overflow-y-auto py-2 px-2">
          {results.map(([key, m]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left hover:bg-foreground/[0.04] transition-colors rounded-xl"
            >
              <m.icon className="h-4 w-4 text-muted-foreground" />
              {m.label}
            </button>
          ))}
          {results.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">Geen resultaten.</p>
          )}
        </div>
      </div>
    </FloatingPanel>
  );
}