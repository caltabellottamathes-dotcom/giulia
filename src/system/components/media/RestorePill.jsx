import React from "react";
import { Play, Pause, Music } from "lucide-react";

/**
 * RestorePill — minimale zwevende pil voor de "verborgen" modus. Audio/
 * video speelt door; klik op de pil herstelt de mini-player.
 */
export default function RestorePill({ media, kind, playing, onToggle, onRestore }) {
  const Icon = kind === "video" ? Play : Music;
  return (
    <div className="fixed bottom-6 right-6 z-[61] glass-2 rounded-full pl-2 pr-3 py-2 flex items-center gap-2 text-ivory shadow-[0_18px_48px_-18px_rgba(0,0,0,0.6)]">
      <button onClick={onRestore} className="flex items-center gap-2 min-w-0">
        <span className="h-7 w-7 rounded-full bg-olive/20 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-olive" />
        </span>
        <span className="text-xs text-ivory/90 truncate max-w-[160px]">{media?.name}</span>
      </button>
      <button onClick={onToggle} className="h-7 w-7 rounded-full glass-1 flex items-center justify-center text-ivory/90 hover:text-ivory shrink-0" aria-label={playing ? "Pauze" : "Afspelen"}>
        {playing ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
      </button>
    </div>
  );
}