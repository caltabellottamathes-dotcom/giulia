import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Loader2, Music as MusicIcon, Cloud, HardDrive, ArrowUpRight } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useLocalMedia } from "@/lib/useLocalMedia";
import AudioReactiveLife from "@/life/widgets/new/AudioReactiveLife";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/aa291c631_MElodies.jpeg";
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";
const BLUE = "hsl(205 45% 32%)";

const SUBTLE = "h-9 w-9 flex items-center justify-center transition-transform hover:scale-110 disabled:opacity-30";

/** MusicWidget — P·3:4 (iets kleiner). Bovenste helft: blauwe, veel grotere
 *  pistache-gloeiende bloom + volledige-breedte sinus + subtiele knoppen,
 *  alles in het midden van het bovenste gedeelte. Onderste helft: flush
 *  fotokaart (precies halve shell) die omhoog/beneden schuift; eronder de
 *  bibliotheek. Bloom/sine bewegen enkel als de muziek speelt, écht op de
 *  audio. Tik op de achtergrond of het lijstknopje opent het ModulePanel. */
export default function MusicWidget({ fill }) {
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
      analyser.smoothingTimeConstant = 0.74;
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
    <div className={"relative w-full rounded-[28px] overflow-hidden cursor-pointer " + (fill ? "h-full" : "aspect-[3/4]")} style={{ "--tile-accent": DEEP, color: BLUE }} onClick={() => openModule("mediaplayer")}>
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={glassShell} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      {/* BOVENSTE HELFT — bloom + sine + knoppen in het midden hiervan */}
      <div className="absolute top-0 inset-x-0 h-1/2 z-10">
        <AudioReactiveLife analyserRef={analyserRef} isPlaying={isPlaying} className="absolute inset-0" />
        <div className="absolute top-3 left-4 flex items-center gap-1.5 z-20">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: LIGHT }} />
          <span className="text-[9px] uppercase tracking-[0.16em] font-bold opacity-55">Melodies I listen to!</span>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button onClick={prev} disabled={!tracks.length} className={SUBTLE} aria-label="Vorige"><SkipBack className="h-4 w-4" /></button>
          <button onClick={togglePlay} disabled={!current || busy} className={SUBTLE} aria-label={isPlaying ? "Pauze" : "Afspelen"}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button onClick={next} disabled={!tracks.length} className={SUBTLE} aria-label="Volgende"><SkipForward className="h-4 w-4" /></button>
        </div>
      </div>

      {/* FOTOKAART — flush, precies halve shell, schuift boven/beneden */}
      <motion.div
        className="absolute inset-x-0 h-1/2 z-20 overflow-hidden rounded-[28px]"
        initial={false}
        animate={{ top: slid ? "0%" : "50%", boxShadow: slid ? "0 14px 34px -10px rgba(0,0,0,0.50)" : "0 -14px 34px -10px rgba(0,0,0,0.50)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => { e.stopPropagation(); setSlid((v) => !v); }}
      >
        <img src={PHOTO} alt="Music" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.06) 58%, rgba(0,0,0,0.22))" }} />
        <div className="absolute inset-0 p-4 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
          {slid ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: LIGHT }} />
                <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{current ? `${current.source === "cloud" ? "CLOUD" : "LOKAAL"} · ${statusLabel}` : "—"}</span>
              </div>
              <h3 className="text-[20px] leading-[1.12] font-display font-semibold tracking-[-0.02em] mt-1.5 line-clamp-3">{current ? current.name : "Geen track"}</h3>
              <p className="text-[10px] uppercase tracking-[0.16em] mt-1.5 opacity-75">{tracks.length} bestanden</p>
              <p className="mt-auto text-[9px] uppercase tracking-[0.2em] opacity-45">tik → terug</p>
            </>
          ) : (
            <>
              <div className="mt-auto">
                <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em]">{tracks.length > 0 ? `${tracks.length} TRACKS` : "QUIETLY TUNED"}</h3>
                <p className="text-[10px] uppercase tracking-[0.18em] mt-1.5 opacity-70">{cloudMusic.length} cloud · {localMusic.length} lokaal</p>
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-3.5 pt-3 pb-2 flex items-center gap-2">
              <MusicIcon className="h-4 w-4" style={{ color: DEEP }} />
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-70">Bibliotheek · {tracks.length}</span>
              <button
                onClick={(e) => { e.stopPropagation(); openModule("mediaplayer"); }}
                className="ml-auto h-7 w-7 rounded-full flex items-center justify-center text-charcoal/55 hover:text-charcoal hover:bg-charcoal/10 transition-colors"
                aria-label="Open MediaPlayer"
              >
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-2.5 pb-2.5 space-y-1.5 no-scrollbar">
              {tracks.length === 0 && (
                <p className="text-[11px] opacity-50 px-2 py-8 text-center leading-relaxed">Geen muziekbestanden. Open MediaPlayer om toe te voegen.</p>
              )}
              {tracks.map((t) => {
                const active = current?.id === t.id;
                return (
                  <button key={t.id} onClick={() => playTrack(t)} className={`w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition ${active ? "bg-charcoal/10" : "hover:bg-charcoal/5"}`}>
                    <span className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: t.source === "cloud" ? "hsl(var(--d-life-deep))" : "hsl(var(--d-life-light))", color: IVORY }}>
                      {t.source === "cloud" ? <Cloud className="h-4 w-4" /> : <HardDrive className="h-4 w-4" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate" style={{ color: BLUE }}>{t.name}</p>
                      <p className="text-[9px] uppercase tracking-[0.14em] opacity-50" style={{ color: BLUE }}>{t.source === "cloud" ? "cloud" : "lokaal"}</p>
                    </span>
                    {active && isPlaying ? <Pause className="h-3.5 w-3.5 shrink-0 opacity-70" style={{ color: DEEP }} /> : <Play className="h-3.5 w-3.5 shrink-0 opacity-60" style={{ color: DEEP }} />}
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