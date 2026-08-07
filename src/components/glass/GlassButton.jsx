import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-charcoal text-ivory border-transparent hover:bg-charcoal/90",
  glass: "glass-button text-foreground",
  outline: "border border-foreground/20 text-foreground hover:bg-foreground/5",
  ghost: "text-foreground hover:bg-foreground/5",
  dark: "glass-dark text-ivory border-white/10",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
  icon: "h-9 w-9",
  pill: "px-5 py-2 text-xs rounded-full",
};

export default function GlassButton({
  variant = "glass",
  size = "md",
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}