import React from "react";
import { cn } from "@/lib/utils";

export default function GlassPanel({ level = 2, className, children, ...props }) {
  const levelClass = level === 1 ? "glass-1" : level === 3 ? "glass-3" : "glass";
  return (
    <div className={cn(levelClass, "rounded-2xl", className)} {...props}>
      {children}
    </div>
  );
}