import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/** Inline-editable text. Click to edit, Enter/blur commits, Escape cancels. */
export function InlineText({ value, onCommit, placeholder, className, multiline, inputClassName }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || "");
  useEffect(() => setVal(value || ""), [value]);

  const commit = () => {
    setEditing(false);
    if ((val || "").trim() !== (value || "").trim()) onCommit?.(val.trim());
  };

  if (!editing) {
    return (
      <span
        className={cn("cursor-text rounded px-1 -mx-1 transition hover:bg-foreground/5", className)}
        onClick={() => setEditing(true)}
        title="Klik om te bewerken"
      >
        {value || <span className="text-muted-foreground/50 italic">{placeholder || "—"}</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setVal(value); setEditing(false); }
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
        }}
        rows={3}
        className={cn(
          "w-full bg-transparent border border-border/60 rounded-lg px-2 py-1 outline-none focus:border-olive resize-none",
          inputClassName
        )}
      />
    );
  }

  return (
    <input
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setVal(value); setEditing(false); }
      }}
      className={cn(
        "bg-transparent border border-border/60 rounded-lg px-2 py-0.5 outline-none focus:border-olive min-w-0",
        inputClassName
      )}
    />
  );
}

/** Inline select dropdown. */
export function InlineSelect({ value, options, onCommit, className }) {
  return (
    <select
      value={value}
      onChange={(e) => onCommit?.(e.target.value)}
      className={cn(
        "bg-transparent border border-border/40 rounded-lg px-2 py-0.5 text-xs outline-none focus:border-olive cursor-pointer",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/** Inline date input. */
export function InlineDate({ value, onCommit, className }) {
  return (
    <input
      type="date"
      value={value ? String(value).slice(0, 10) : ""}
      onChange={(e) => onCommit?.(e.target.value)}
      className={cn("bg-transparent border border-border/40 rounded-lg px-2 py-0.5 text-xs outline-none focus:border-olive", className)}
    />
  );
}