import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * TaskSelect — an elegant glass dropdown to pick a task (no native blue select).
 * Uses the widget's currentColor so it reads on any tile.
 */
export default function TaskSelect({ tasks, value, onChange, disabled, placeholder = "Kies een taak" }) {
  const [open, setOpen] = useState(false);
  const selected = tasks.find((t) => t.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
        disabled={disabled}
        className="w-full glass-1 rounded-xl px-3.5 py-2.5 text-sm text-current flex items-center justify-between gap-2 transition hover:bg-white/5 disabled:opacity-60"
      >
        <span className={"truncate " + (selected ? "" : "opacity-50")}>{selected ? selected.title : placeholder}</span>
        <ChevronDown className={"h-4 w-4 shrink-0 opacity-60 transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1.5 w-full glass-3 rounded-2xl p-1.5 max-h-60 overflow-y-auto shadow-2xl">
            {tasks.length === 0 ? (
              <p className="px-3 py-3 text-sm opacity-50">Geen taken</p>
            ) : tasks.map((t) => (
              <button
                key={t.id}
                onClick={() => { onChange(t.id); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm rounded-xl flex items-center gap-2 hover:bg-white/10 transition truncate"
              >
                <span className="flex-1 truncate">{t.title}</span>
                {t.id === value && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--tile-accent)" }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}