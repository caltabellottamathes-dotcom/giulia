import React from "react";
import { DOMAIN_HEX, DOMAIN_LABEL } from "@/lib/domainUtils";
import { cn } from "@/lib/utils";

/** Subtle rounded domain badge — groen = FOCUS, lichtblauw = LIFE, burgundy = SELF.
 *  Pass `onChange` to render an inline-edit dropdown; omit for read-only chip. */
export default function DomainChip({ domain, onChange, size = "sm", className }) {
  const color = DOMAIN_HEX[domain] || "hsl(var(--muted-foreground) / 0.55)";
  const label = domain ? DOMAIN_LABEL[domain] : "—";

  if (onChange) {
    return (
      <div className={cn("relative inline-flex", className)} onClick={(e) => e.stopPropagation()}>
        <select
          value={domain || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className={cn(
            "appearance-none rounded-full pl-2.5 pr-5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer outline-none",
            size === "xs" ? "py-0.5" : "py-1"
          )}
          style={{ background: domain ? `${color}22` : "hsl(var(--muted) / 0.3)", color: domain ? color : "hsl(var(--muted-foreground))", border: `1px solid ${domain ? `${color}66` : "hsl(var(--border))"}` }}
        >
          <option value="">Ongetagd</option>
          <option value="focus">FOCUS</option>
          <option value="life">LIFE</option>
          <option value="self">SELF</option>
        </select>
      </div>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2 font-semibold uppercase tracking-wider", size === "xs" ? "py-0.5 text-[9px]" : "py-1 text-[10px]", className)}
      style={{ background: domain ? `${color}1f` : "transparent", color, border: `1px solid ${domain ? `${color}55` : "hsl(var(--border))"}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}