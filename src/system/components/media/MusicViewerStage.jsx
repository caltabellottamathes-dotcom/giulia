import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Loader2, Music as MusicIcon, Cloud, HardDrive } from "lucide-react";
import AudioReactiveLife from "@/life/widgets/new/AudioReactiveLife";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/aa291c631_MElodies.jpeg";
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";
const BLUE = "hsl(205 45% 32%)";

const SUBTLE = "h-11 w-11 rounded-full flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/15 transition-colors disabled:opacity-30";
const glassShell = {
  background: "rgba(120,128,133,0.16)",
  backdropFilter: "blur(22px) saturate(1.35)",
  WebkitBackdropFilter: "blur(22px) saturate(1.35)",
  border: "1px solid rgba(255,255,255,0.14)",
};

/** MusicViewerStage — exacte, vergrote kopie van de LIFE MusicWidget.
 *  GlassShell met bovenste helft blauwe sine + Whipped-Pistachio bloom +
 *  gecentreerde transport-knoppen, en onderste helft een flush fotokaart
 *  (4 afgeronde hoeken) die omhoog schuift om de volledige bibliotheek
 *  te tonen. Audio-reactief via de gedeelde AnalyserNode uit
 *  MediaFullscreenWindow. Alle knoppen werken (vorige/speel/volgende +
 *  track kiezen in de lijst). */
export default function MusicViewerStage({ analyserRef, tracks = [], currentTrack, playing, busy, onToggle, onPrev, onNext, onSelect }) {
  const [slid, setSlid] = useState(false);
  const statusLabel = !currentTrack ? "—" : playing ? "SPEELT" : "KLAAR";
  const cloudCount = tracks.filter((t) => t.source === "cloud").length;
  const localCount = tracks.filter((t) => t.source === "local").length;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ "--tile-accent": DEEP, color: BLUE }}>
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10" style={glassShell} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      {/* BOVENSTE HELFT — bloom + sine + audio-reactieve knoppen */}
      <div className="absolute top-0 inset-x-0 h-1/2 z-10">
        <AudioReactiveLife analyserRef={analyserRef} isPlaying={playing} className="absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex items-center gap-2">
          <button onClick={onPrev} disabled={!tracks.length} className={SUBTLE} aria-label="Vorige"><SkipBack className="h-5 w-5" /></button>
          <button onClick={onToggle} disabled={!currentTrack || busy} className={SUBTLE} aria-label={playing ? "Pauze" : "Afspelen"}>
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button onClick={onNext} disabled={!tracks.length} className={SUBTLE} aria-label="Volgende"><SkipForward className="h-5 w-5" /></button>
        </div>
      </div>

      {/* FOTOKAART — flush, precies halve shell, 4 afgeronde hoeken, schuift boven/beneden */}
      <motion.div
        className="absolute inset-x-0 h-1/2 z-20 overflow-hidden rounded-[28px] cursor-pointer"
        initial={false}
        animate={{ top: slid ? "0%" : "50%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => setSlid((v) => !v)}
      >
        <img src={PHOTO} alt="Music" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.06) 58%, rgba(0,0,0,0.22))" }} />
        <div className="absolute inset-0 p-4 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          {slid ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: LIGHT }} />
                <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{currentTrack ? `${currentTrack.source === "cloud" ? "CLOUD" : "LOKAAL"} · ${statusLabel}` : "—"}</span>
              </div>
              <h3 className="text-[20px] leading-[1.12] font-display font-semibold tracking-[-0.02em] mt-1.5 line-clamp-3">{currentTrack ? currentTrack.name : "Geen track"}</h3>
              <p className="text-[10px] uppercase tracking-[0.16em] mt-1.5 opacity-75">{tracks.length} bestanden</p>
              <p className="mt-auto text-[9px] uppercase tracking-[0.2em] opacity-45">tik → terug</p>
            </>
          ) : (
            <>
              <div className="mt-auto">
                <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em]">{tracks.length > 0 ? `${tracks.length} TRACKS` : "QUIETLY TUNED"}</h3>
                <p className="text-[10px] uppercase tracking-[0.18em] mt-1.5 opacity-70">{cloudCount} cloud · {localCount} lokaal</p>
                <p className="text-[9px] uppercase tracking-[0.2em] mt-3 opacity-40">tik → bibliotheek</p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* BIBLIOTHEEK — flush, onderste helft (bij slide) */}
      <AnimatePresence>
        {slid && (
          <motion.div
            key="list"
            className="absolute inset-x-0 top-1/2 h-1/2 z-30 overflow-hidden flex flex-col"
            style={glassShell}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="shrink-0 px-3.5 pt-3 pb-2 flex items-center gap-2">
              <MusicIcon className="h-4 w-4" style={{ color: DEEP }} />
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-70">Bibliotheek · {tracks.length}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-2 grid grid-cols-3 gap-x-2 gap-y-2.5 content-start no-scrollbar">
              {tracks.length === 0 && (
                <p className="col-span-3 text-[11px] opacity-50 px-2 py-8 text-center leading-relaxed">Geen muziekbestanden.</p>
              )}
              {tracks.map((t) => {
                const active = currentTrack?.id === t.id;
                return (
                  <button key={t.id} onClick={() => onSelect(t)} className="group flex flex-col items-center text-center">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                      <div className="absolute inset-0" style={{ background: t.source === "cloud" ? "linear-gradient(150deg, #d8dab3, #5d7388)" : "linear-gradient(150deg, #c6d3de, #8fa3b6)" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {t.source === "cloud" ? <Cloud className="h-5 w-5 text-white/85" /> : <HardDrive className="h-5 w-5 text-white/85" />}
                      </div>
                      {active && <span className="absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        {active && playing ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white translate-x-0.5" />}
                      </div>
                    </div>
                    <p className="mt-1 text-[9px] font-medium leading-tight truncate w-full" style={{ color: BLUE }}>{t.name}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}