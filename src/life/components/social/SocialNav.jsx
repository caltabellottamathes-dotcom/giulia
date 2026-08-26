import React from "react";
import { cn } from "@/lib/utils";

const sections = ["Overview", "Relationships", "Pulse", "Planner", "Personal Time"];

/** SocialNav — identical mechanics to ProjectNav. `dark` schakelt naar
 *  ivory-tekst voor gebruik op de donkere foto-ondergrond van de Social-pagina. */
export default function SocialNav({ active, onChange, variant = "top", dark = false }) {
  const isBottom = variant === "bottom";
  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto no-scrollbar", isBottom ? "py-1.5 px-3" : cn("pb-1 border-b -mx-1 px-1", dark ? "border-white/10" : "border-border/40"))}>
      {sections.map((s) => {
        const on = active === s;
        if (isBottom) {
          return (
            <button key={s} onClick={() => onChange(s)} className={cn("whitespace-nowrap transition-all px-3 py-1 text-xs", on ? "text-olive font-medium" : dark ? "text-ivory/55 hover:text-ivory" : "text-foreground/55 hover:text-foreground")}>{s}</button>
          );
        }
        return (
          <button key={s} onClick={() => onChange(s)} className={cn("whitespace-nowrap transition-all px-4 py-2 text-sm border-b-2 -mb-px", on ? cn(dark ? "border-ivory text-ivory" : "border-olive text-foreground", "font-medium") : cn("border-transparent", dark ? "text-ivory/55 hover:text-ivory" : "text-muted-foreground hover:text-foreground"))}>{s}</button>
        );
      })}
    </div>
  );
}