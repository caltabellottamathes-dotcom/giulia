import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Loader2, Music as MusicIcon, Cloud, HardDrive, ArrowUpRight } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useLocalMedia } from "@/lib/useLocalMedia";
import AudioReactiveLife from "@/life/widgets/new/AudioReactiveLife";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/eecda9230_Music.jpeg";
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";
const BLUE = "hsl(205 45% 32%)";

const SUBTLE = "h-8 w-8 rounded-full flex items-center justify-center text-ivory/65 hover:text-ivory hover:bg-white/10 transition-colors disabled:opacity-30";

/** MusicWidget — P·3:4·SPLIT (portrait). Boven: audio-reactieve bloom +
 *  volledige-breedte sinus (bewegen enkel als de muziek speelt, méé met de
 *  audio via WebAudio). Beneden: fotokaart met subtiele prev/play/next.
 *  Tik op de fotokaart → schuift omhoog, eronder verschijnt de bibliotheek.
 *  Een klein knopje opent het ModulePanel (MediaPlayerPreview). */
export default function MusicWidget() {
  const { openModule } = usePanel();
  const cloud = useMediaLibrary();
  const local = useLocalMedia();
  const [slid, setSlid] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const audioRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    const a = new Audio();
    a.crossOrigin = "anonymous";
    a.preload = "auto";
    audioRef.current = a;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.pause();
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  const cloudMusic = useMemo(
    () => (cloud.items || []).filter((i) => kindOfUpload(i) === "music")
      .map((i) => ({ id: "c:" + i.id, name: i.filename || "track", source: "cloud", url: i.file_url, raw: i })),
    [cloud.items]
  );
  const localMusic = useMemo(
    () => (local.files || []).filter((f) => f.kind === "music")
      .map((f) => ({ id: "l:" + f.id, name: f.name.split("/").pop(), source: "local", raw: f })),
    [local.files]
  );
  const tracks = useMemo(() => [...cloudMusic, ...localMusic], [cloudMusic, localMusic]);
  const current = tracks.find((t) => t.id === currentId) || tracks[0] || null;
  const idx = tracks.findIndex((t) => t.id === currentId);

  const resolveUrl = useCallback(async (t) => {
    if (t.source === "cloud") return t.url;
    const m = await local.openFile(t.raw);
    return m.url;
  }, [local]);

  const ensureGraph = useCallback(() => {
    if (ctxRef.current) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = new AC();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      const src = ctx.createMediaElementSource(audioRef.current);
      src.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
    } catch { /* negeer */ }
  }, []);

  const playTrack = useCallback(async (t) => {
    if (!t) return;
    setBusy(true);
    try {
      const url = await resolveUrl(t);
      const a = audioRef.current;
      if (!a) return;
      a.src = url;
      ensureGraph();
      ctxRef.current?.resume?.();
      await a.play();
      setCurrentId(t.id);
      setLoadedId(t.id);
    } catch { /* negeer */ } finally { setBusy(false); }
  }, [resolveUrl, ensureGraph]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (loadedId !== current.id) { playTrack(current); return; }
    if (a.paused) { ctxRef.current?.resume?.(); a.play().catch(() => {}); } else a.pause();
  }, [current, loadedId, playTrack]);

  const next = useCallback(() => {
    if (!tracks.length) return;
    const i = idx < 0 ? 0 : (idx + 1) % tracks.length;
    playTrack(tracks[i]);
  }, [tracks, idx, playTrack]);
  const prev = useCallback(() => {
    if (!tracks.length) return;
    const i = idx < 0 ? 0 : (idx - 1 + tracks.length) % tracks.length;
    playTrack(tracks[i]);
  }, [tracks, idx, playTrack]);

  const glassShell = {
    background: "rgba(120,128,133,0.16)",
    backdropFilter: "blur(22px) saturate(1.35)",
    WebkitBackdropFilter: "blur(22px) saturate(1.35)",
    border: "1px solid rgba(255,255,255,0.14)",
  };
  const statusLabel = !current ? "—" : isPlaying ? "SPEELT" : loadedId === current.id ? "PAUZE" : "KLAAR";

  return (
    <div className="relative w-full aspect-[3/4] rounded-[28px] overflow-hidden cursor-pointer" style={{ "--tile-accent": DEEP, color: BLUE }} onClick={() => openModule("mediaplayer")}>
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={glassShell} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      {/* BOVEN: Bloom + SineLayers (default) */}
      <AnimatePresence>
        {!slid && (
          <motion.div
            key="viz"
            className="absolute top-0 inset-x-0 h-1/2 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <AudioReactiveLife analyserRef={analyserRef} isPlaying={isPlaying} className="absolute inset-0" />
            <div className="absolute top-3 left-3.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: LIGHT }} />
              <span className="text-[9px] uppercase tracking-[0.22em] font-bold opacity-55">Music.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHOTOCARD — schuift van beneden (50%) omhoog (0%) */}
      <motion.div
        className="absolute inset-x-0 h-1/2 z-20 overflow-hidden"
        initial={false}
        animate={{ top: slid ? "0%" : "50%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ boxShadow: "0 10px 26px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18)" }}
        onClick={(e) => { e.stopPropagation(); setSlid((v) => !v); }}
      >
        <img src={PHOTO} alt="Music" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.28))" }} />
        <div className="absolute inset-0 p-3.5 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          {slid ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: LIGHT }} />
                <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{current ? `${current.source === "cloud" ? "CLOUD" : "LOKAAL"} · ${statusLabel}` : "—"}</span>
              </div>
              <h3 className="text-[18px] leading-[1.12] font-display font-semibold tracking-[-0.02em] mt-1 line-clamp-3">{current ? current.name : "Geen track"}</h3>
              <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-75">{tracks.length} bestanden</p>
              <p className="mt-auto text-[8px] uppercase tracking-[0.2em] opacity-45 mb-1.5">tik → terug</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: LIGHT }} />
                <span className="text-[9px] uppercase tracking-[0.22em] font-bold opacity-70">Music.</span>
              </div>
              <h3 className="text-[18px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{tracks.length > 0 ? `${tracks.length} TRACKS` : "QUIETLY TUNED"}</h3>
              <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-65">{cloudMusic.length} cloud · {localMusic.length} lokaal</p>
              <div className="mt-auto" />
            </>
          )}
          {/* subtiele controls — altijd onderaan de fotokaart */}
          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={prev} disabled={!tracks.length} className={SUBTLE} aria-label="Vorige"><SkipBack className="h-3.5 w-3.5" /></button>
            <button onClick={togglePlay} disabled={!current || busy} className={SUBTLE} aria-label={isPlaying ? "Pauze" : "Afspelen"}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button onClick={next} disabled={!tracks.length} className={SUBTLE} aria-label="Volgende"><SkipForward className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </motion.div>

      {/* ONDER: bestandenlijst (bij slide) */}
      <AnimatePresence>
        {slid && (
          <motion.div
            key="list"
            className="absolute inset-x-0 bottom-0 h-1/2 z-30 overflow-hidden flex flex-col"
            style={glassShell}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-3 pt-2.5 pb-2 flex items-center gap-2">
              <MusicIcon className="h-3.5 w-3.5" style={{ color: DEEP }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold opacity-70">Bibliotheek · {tracks.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); openModule("mediaplayer"); }}
                className="ml-auto h-6 w-6 rounded-full flex items-center justify-center text-charcoal/55 hover:text-charcoal hover:bg-charcoal/10 transition-colors"
                aria-label="Open MediaPlayer"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 space-y-1 no-scrollbar">
              {tracks.length === 0 && (
                <p className="text-[10px] opacity-50 px-2 py-6 text-center leading-relaxed">Geen muziekbestanden. Open MediaPlayer om toe te voegen.</p>
              )}
              {tracks.map((t) => {
                const active = current?.id === t.id;
                return (
                  <button key={t.id} onClick={() => playTrack(t)} className={`w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition ${active ? "bg-charcoal/10" : "hover:bg-charcoal/5"}`}>
                    <span className="h-7 w-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: t.source === "cloud" ? "hsl(var(--d-life-deep))" : "hsl(var(--d-life-light))", color: IVORY }}>
                      {t.source === "cloud" ? <Cloud className="h-3.5 w-3.5" /> : <HardDrive className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate" style={{ color: BLUE }}>{t.name}</p>
                      <p className="text-[8px] uppercase tracking-[0.14em] opacity-50" style={{ color: BLUE }}>{t.source === "cloud" ? "cloud" : "lokaal"}</p>
                    </span>
                    {active && isPlaying ? <Pause className="h-3 w-3 shrink-0 opacity-70" style={{ color: DEEP }} /> : <Play className="h-3 w-3 shrink-0 opacity-60" style={{ color: DEEP }} />}
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