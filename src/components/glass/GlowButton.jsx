import React from "react";
import { cn } from "@/lib/utils";

/**
 * GlowButton — a glowing action button "with light": a solid palette chip with
 * a blurred halo behind it. Icon-only for the header; `block` for a full-width
 * labelled row (chat / call) in the sidebar.
 */
const TONES = {
  sand: "hsl(var(--sand))",
  olive: "hsl(var(--olive))",
  blue: "hsl(var(--blue-grey))",
  ivory: "hsl(var(--ivory))",
};
const FG = {
  sand: "hsl(var(--charcoal))",
  olive: "hsl(var(--ivory))",
  blue: "hsl(var(--charcoal))",
  ivory: "hsl(var(--charcoal))",
};

export default function GlowButton({ icon: Icon, onClick, label, sublabel, tone = "sand", block = false, className }) {
  const bg = TONES[tone] || TONES.sand;
  const fg = FG[tone] || FG.sand;
  const chip = (
    <span className="relative h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: bg, color: fg }}>
      <span className="absolute -inset-1.5 rounded-full blur-md opacity-50" style={{ background: bg }} />
      <Icon className="relative h-4 w-4" strokeWidth={1.75} />
    </span>
  );

  if (block) {
    return (
      <button onClick={onClick} className={cn("group relative w-full rounded-2xl bg-charcoal text-ivory px-3.5 py-3 flex items-center gap-3 overflow-hidden hover:scale-[1.02] transition", className)} aria-label={label}>
        <span className="absolute -inset-1 opacity-25 blur-2xl" style={{ background: bg }} />
        <span className="relative">{chip}</span>
        <span className="relative text-left min-w-0">
          {label && <span className="block text-sm font-semibold leading-none">{label}</span>}
          {sublabel && <span className="block text-[10px] text-ivory/60 mt-1">{sublabel}</span>}
        </span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className={cn("group relative h-9 w-9 rounded-full flex items-center justify-center hover:scale-110 transition", className)} aria-label={label}>
      {chip}
    </button>
  );
}