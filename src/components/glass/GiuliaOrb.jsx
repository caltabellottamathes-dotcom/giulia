import React, { useState } from "react";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * GiuliaOrb — the Giulia presence control: her portrait in a ring with a soft
 * glowing halo ("light") and a live status dot. Icon-only in the header; `block`
 * for a labelled row in the sidebar. Opens the chat window on click.
 */
export default function GiuliaOrb({ onClick, size = 36, label, sublabel, block = false }) {
  const orb = (
    <span className="relative rounded-full shrink-0" style={{ width: size, height: size }}>
      <span className="absolute -inset-1 rounded-full blur-md opacity-60 bg-gradient-to-br from-sand to-olive" />
      <span className="relative h-full w-full rounded-full overflow-hidden ring-1 ring-ivory/40">
        <img src={IMAGES.giuliaConcierge} alt="Giulia" className="h-full w-full object-cover" />
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-background" />
    </span>
  );

  if (block) {
    return (
      <button onClick={onClick} className="group relative w-full rounded-2xl glass-1 specular-edge px-3 py-2.5 flex items-center gap-3 hover:scale-[1.02] transition" aria-label={label}>
        {orb}
        <span className="text-left min-w-0">
          {label && <span className="block text-sm font-semibold leading-none">{label}</span>}
          {sublabel && <span className="block text-[10px] text-foreground/50 mt-1">{sublabel}</span>}
        </span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className="group relative rounded-full hover:scale-110 transition" style={{ width: size, height: size }} aria-label={label}>
      {orb}
    </button>
  );
}