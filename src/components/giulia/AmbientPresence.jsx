import React from "react";

/**
 * Giulia's only visual presence — a small, persistent ambient light,
 * never an avatar/bubble/mascot. Continuous breathing animation.
 * Click opens the global command layer.
 */
export default function AmbientPresence({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Vraag Giulia"
      className="fixed bottom-6 left-6 z-40 h-11 w-11 transition-transform duration-300 hover:scale-110"
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo/60 to-ochre/40 blur-lg animate-breathe" />
      <span className="absolute inset-[3px] rounded-full bg-gradient-to-br from-indigo/80 to-ochre/60 border border-white/50" />
    </button>
  );
}