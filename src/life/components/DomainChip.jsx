import React from "react";
import { DOMAIN_HEX, DOMAIN_LABEL } from "@/lib/domainUtils";
import { cn } from "@/lib/utils";

/** Subtle rounded domain badge — groen = FOCUS, lichtblauw = LIFE.
 *  SELF is gefuseerd in LIFE; self-records worden als LIFE getoond.
 *  Pass `onChange` to render an inline-edit dropdown; omit for read-only chip. */
export default function DomainChip({ domain, onChange, size = "sm", className }) {
  const effDomain = domain === "self" ? "life" : domain;
  const color = DOMAIN_HEX[effDomain] || "hsl(var(--muted-foreground) / 0.55)";
  const label = effDomain ? DOMAIN_LABEL[effDomain] : "—";

  if (onChange) {
    return (
      <div className={cn("relative inline-flex", className)} onClick={(e) => e.stopPropagation()}>
        <select
          value={effDomain || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className={cn(
            "appearance-none rounded-full pl-2.5 pr-5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer outline-none",
            size === "xs" ? "py-0.5" : "py-1"
          )}
          style={{ background: effDomain ? `${color}22` : "hsl(var(--muted) / 0.3)", color: effDomain ? color : "hsl(var(--muted-foreground))", border: `1px solid ${effDomain ? `${color}66` : "hsl(var(--border))"}` }}
        >
          <option value="">Ongetagd</option>
          <option value="focus">FOCUS</option>
          <option value="life">LIFE</option>
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