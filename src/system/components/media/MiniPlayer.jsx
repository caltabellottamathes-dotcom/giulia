import React from "react";
import { Play, Pause, Maximize2, EyeOff, X, Music } from "lucide-react";

const hashHue = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
};
const fmt = (s) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

/**
 * MiniPlayer — zwevende "now playing"-kaak rechtsonder. Houdt audio/video
 * aan de praat; expand → fullscreen, hide → verborgen pil, close → stop.
 */
export default function MiniPlayer({ media, kind, playing, cur, dur, onToggle, onSeek, onExpand, onHide, onClose }) {
  if (kind === "video") {
    return (
      <div className="fixed bottom-6 right-6 z-[61] w-72 glass-4 rounded-2xl px-2.5 py-2 flex items-center gap-2 text-ivory shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
        <button onClick={onToggle} className="h-9 w-9 rounded-full glass-1 flex items-center justify-center shrink-0">
          {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>
        <p className="text-xs text-ivory/85 truncate flex-1">{media?.name}</p>
        <button onClick={onExpand} className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory shrink-0" aria-label="Fullscreen"><Maximize2 size={14} /></button>
        <button onClick={onClose} className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory shrink-0" aria-label="Sluiten"><X size={14} /></button>
      </div>
    );
  }

  const hue = hashHue(media?.name || "audio");
  return (
    <div className="fixed bottom-6 right-6 z-[61] w-80 glass-4 rounded-2xl p-3 flex items-center gap-3 text-ivory shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
      <div
        className="h-12 w-12 rounded-full shrink-0 ring-1 ring-ivory/15"
        style={{ background: `radial-gradient(circle at 50% 45%, hsl(${hue} 38% 32%), hsl(${(hue + 40) % 360} 28% 18%))` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ivory/95 truncate">{media?.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <input
            type="range"
            min={0}
            max={dur || 0}
            value={cur}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="flex-1 accent-olive h-1 cursor-pointer min-w-0"
          />
          <span className="text-[10px] font-mono text-ivory/45 tabular-nums shrink-0">{fmt(cur)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onToggle} className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-ivory/90 hover:text-ivory">{playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}</button>
        <button onClick={onExpand} className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory" aria-label="Fullscreen"><Maximize2 size={14} /></button>
        <button onClick={onHide} className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory" aria-label="Verbergen"><EyeOff size={14} /></button>
        <button onClick={onClose} className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-ivory/70 hover:text-ivory" aria-label="Sluiten"><X size={14} /></button>
      </div>
    </div>
  );
}