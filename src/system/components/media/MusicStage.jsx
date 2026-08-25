import React from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

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
 * MusicStage — fullscreen, OS-stijl muziekspeler. Draaiende vinyl met
 * generatieve kleur uit de tracknaam, equalizer-balken, eigen seek + transport.
 * Het <audio>-element zelf leeft in MediaFullscreenWindow (persistente laag).
 */
export default function MusicStage({ media, playing, cur, dur, onToggle, onSeek, onSkip }) {
  const hue = hashHue(media?.name || "audio");
  const hue2 = (hue + 38) % 360;
  const hue3 = (hue + 72) % 360;
  const letter = (media?.name?.trim()?.[0] || "♪").toUpperCase();

  return (
    <div className="absolute inset-0 z-[58] flex flex-col items-center justify-center px-6 pb-10 pointer-events-auto">
      {/* sfeer */}
      <div
        className="ambient-bloom"
        style={{ background: `hsl(${hue} 45% 50%)`, opacity: 0.22 }}
      />

      {/* vinyl */}
      <div className="relative mb-9 flex flex-col items-center">
        <div
          className={`relative h-56 w-56 sm:h-64 sm:w-64 rounded-full ${playing ? "spin-slow" : ""}`}
          style={{
            background: `radial-gradient(circle at 50% 45%, hsl(${hue} 38% 32%), hsl(${hue2} 30% 20%) 62%, hsl(${hue3} 22% 12%))`,
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.45)",
          }}
        >
          <div className="absolute inset-3 rounded-full border border-ivory/8" />
          <div className="absolute inset-8 rounded-full border border-ivory/6" />
          <div className="absolute inset-14 rounded-full border border-ivory/5" />
          <div className="absolute inset-20 rounded-full border border-ivory/4" />
          <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-charcoal/75 backdrop-blur flex items-center justify-center ring-1 ring-ivory/15">
            <span className="text-2xl font-display font-bold text-ivory/90">{letter}</span>
          </div>
        </div>

        {/* equalizer */}
        <div className="mt-7 flex items-end justify-center gap-1 h-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-olive ${playing ? "eq-bar" : "scale-y-25"}`}
              style={{ height: "100%", animationDelay: `${i * 0.11}s` }}
            />
          ))}
        </div>
      </div>

      {/* meta */}
      <p className="text-[10px] uppercase tracking-[0.34em] font-bold text-ivory/45 mb-2">Nu afspelen</p>
      <h2 className="text-2xl sm:text-3xl font-display font-semibold text-ivory text-center max-w-xl tracking-[-0.02em] line-clamp-2">
        {media?.name || "Onbekende track"}
      </h2>

      {/* seek */}
      <div className="w-full max-w-md mt-8 flex items-center gap-3">
        <span className="text-[11px] font-mono text-ivory/55 tabular-nums w-10 text-right">{fmt(cur)}</span>
        <input
          type="range"
          min={0}
          max={dur || 0}
          value={cur}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="flex-1 accent-olive h-1 cursor-pointer"
        />
        <span className="text-[11px] font-mono text-ivory/55 tabular-nums w-10">{fmt(dur)}</span>
      </div>

      {/* transport */}
      <div className="flex items-center gap-8 mt-7">
        <button
          onClick={() => onSkip(-15)}
          className="h-12 w-12 rounded-full glass-1 flex items-center justify-center text-ivory/80 hover:text-ivory transition-colors"
          aria-label="15s terug"
        >
          <SkipBack size={20} />
        </button>
        <button
          onClick={onToggle}
          className="h-16 w-16 rounded-full bg-ivory text-charcoal flex items-center justify-center hover:scale-105 transition-transform"
          aria-label={playing ? "Pauze" : "Afspelen"}
        >
          {playing ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
        </button>
        <button
          onClick={() => onSkip(15)}
          className="h-12 w-12 rounded-full glass-1 flex items-center justify-center text-ivory/80 hover:text-ivory transition-colors"
          aria-label="15s vooruit"
        >
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
}