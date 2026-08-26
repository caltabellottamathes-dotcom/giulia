import React, { useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import AudioReactiveLife from "@/life/widgets/new/AudioReactiveLife";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/aa291c631_MElodies.jpeg";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";
const BLUE = "hsl(205 45% 32%)";

const SUBTLE = "h-9 w-9 rounded-full flex items-center justify-center text-ivory/70 hover:text-ivory hover:bg-white/12 transition-colors";

/** MusicViewerStage — de LIFE MusicWidget-look, maar dan gevend in de
 *  media-shell: bovenste helft blauwe sine + Whipped-Pistachio bloom met
 *  gecentreerde transport-knoppen, onderste helft flush fotokaart met
 *  de tracknaam. Audio-reactief via een AnalyserNode op het persistente
 *  <audio>-element uit MediaFullscreenWindow. */
export default function MusicViewerStage({ media, audioRef, playing, onToggle, onSkip }) {
  const analyserRef = useRef(null);
  const ctxRef = useRef(null);

  // Eénmaal de WebAudio-grafo opzetten op het persistente audio-element.
  useEffect(() => {
    const a = audioRef?.current;
    if (!a || ctxRef.current) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = new AC();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.74;
      const src = ctx.createMediaElementSource(a);
      src.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
    } catch { /* negeer — grafo al bestaat of niet ondersteund */ }
  }, [audioRef]);

  useEffect(() => { if (playing) ctxRef.current?.resume?.(); }, [playing]);

  return (
    <div className="absolute inset-0 z-[58]" style={{ color: BLUE }}>
      {/* BOVENSTE HELFT — bloom + sine + knoppen */}
      <div className="absolute top-0 inset-x-0 h-1/2 z-10">
        <AudioReactiveLife analyserRef={analyserRef} isPlaying={playing} className="absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5">
          <button onClick={() => onSkip(-15)} className={SUBTLE} aria-label="15s terug"><SkipBack className="h-4 w-4" /></button>
          <button onClick={onToggle} className={SUBTLE} aria-label={playing ? "Pauze" : "Afspelen"}>
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button onClick={() => onSkip(15)} className={SUBTLE} aria-label="15s vooruit"><SkipForward className="h-4 w-4" /></button>
        </div>
      </div>

      {/* ONDERSTE HELFT — flush fotokaart */}
      <div className="absolute inset-x-0 top-1/2 h-1/2 z-20 overflow-hidden">
        <img src={PHOTO} alt="Music" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.06) 58%, rgba(0,0,0,0.22))" }} />
        <div className="absolute inset-0 p-5 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          <div className="mt-auto">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: LIGHT }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{playing ? "SPEELT" : "KLAAR"}</span>
            </div>
            <h3 className="text-[22px] leading-[1.1] font-display font-semibold tracking-[-0.02em] mt-1.5 line-clamp-3">{media?.name || "Onbekende track"}</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] mt-1.5 opacity-70">audio</p>
          </div>
        </div>
      </div>
    </div>
  );
}