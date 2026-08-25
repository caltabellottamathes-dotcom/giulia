import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Loader2, Music as MusicIcon, Cloud, HardDrive } from "lucide-react";
import { WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useLocalMedia } from "@/lib/useLocalMedia";
import AudioReactiveLife from "@/life/widgets/new/AudioReactiveLife";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/f414f8166_HOBBIES.jpeg";
const DEEP = "hsl(var(--d-life-deep))";
const LIGHT = "hsl(var(--d-life-light))";
const IVORY = "hsl(var(--ivory))";
const BLUE = "hsl(205 45% 32%)";

/** MusicWidget — G·3:2·SPLIT (zelfde formaat als ThingsILove). Een échte,
 *  standalone music player: inline <audio> afspeelt binnen de widget, los
 *  van het fullscreen MediaPlayer-venster. Links: audio-reactieve bloom +
 *  sinus in LIFE-kleuren met een Play/Pause-knop. Rechts: fotokaart. Tik
 *  op de fotokaart → schuift links, rechts verschijnt de lijst met alle
 *  beschikbare muziekbestanden (cloud + lokaal). Tik een bestand → speelt
 *  inline. Tik op de widget-achtergrond → ModulePanel MediaPlayerPreview. */
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

  useEffect(() => {
    const a = new Audio();
    audioRef.current = a;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.pause();
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

  const resolveUrl = useCallback(async (t) => {
    if (t.source === "cloud") return t.url;
    const m = await local.openFile(t.raw);
    return m.url;
  }, [local]);

  const playTrack = useCallback(async (t) => {
    if (!t) return;
    setBusy(true);
    try {
      const url = await resolveUrl(t);
      const a = audioRef.current;
      if (!a) return;
      a.src = url;
      await a.play();
      setCurrentId(t.id);
      setLoadedId(t.id);
    } catch { /* negeer */ } finally { setBusy(false); }
  }, [resolveUrl]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (loadedId !== current.id) { playTrack(current); return; }
    if (a.paused) a.play().catch(() => {}); else a.pause();
  }, [current, loadedId, playTrack]);

  const glassShell = {
    background: "rgba(120,128,133,0.16)",
    backdropFilter: "blur(22px) saturate(1.35)",
    WebkitBackdropFilter: "blur(22px) saturate(1.35)",
    border: "1px solid rgba(255,255,255,0.14)",
  };

  const statusLabel = !current ? "—" : isPlaying ? "SPEELT" : loadedId === current.id ? "PAUZE" : "KLAAR";

  return (
    <div className="relative w-full aspect-[3/2] rounded-[28px] overflow-hidden cursor-pointer" style={{ "--tile-accent": DEEP, color: BLUE }} onClick={() => openModule("mediaplayer")}>
      <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" style={glassShell} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px z-10" style={{ background: `linear-gradient(90deg, transparent, ${DEEP} 18%, ${DEEP} 82%, transparent)` }} />

      {/* LINKS: AudioReactiveLife + Play/Pause (default) */}
      <AnimatePresence>
        {!slid && (
          <motion.div
            key="viz"
            className="absolute inset-y-0 left-0 w-1/2 flex flex-col p-4 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <WidgetHeader type="social" label="Music." count={tracks.length ? `${tracks.length} tracks` : ""} />
            <div className="relative flex-1 min-h-0 mt-2">
              <AudioReactiveLife playing={isPlaying} className="absolute inset-0" />
              <button
                onClick={togglePlay}
                disabled={!current || busy}
                className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-ivory text-charcoal flex items-center justify-center shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform disabled:opacity-40 z-10"
                aria-label={isPlaying ? "Pauze" : "Afspelen"}
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] opacity-40 mt-1.5">tik kaart → bibliotheek</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOTOKAART — schuift rechts ↔ links */}
      <motion.div
        className="absolute inset-y-0 z-20 overflow-hidden rounded-[24px]"
        initial={false}
        animate={{ left: slid ? "0%" : "50%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "50%", boxShadow: "-12px 0 30px -14px rgba(0,0,0,0.42), 12px 0 30px -14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.18)" }}
        onClick={(e) => { e.stopPropagation(); setSlid((v) => !v); }}
      >
        <img src={PHOTO} alt="Music" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.42), rgba(0,0,0,0.08) 55%, rgba(0,0,0,0.18))" }} />
        {slid ? (
          <div className="absolute inset-0 p-4 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: LIGHT }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold">{current ? `${current.source === "cloud" ? "CLOUD" : "LOKAAL"} · ${statusLabel}` : "—"}</span>
            </div>
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1 line-clamp-3">{current ? current.name : "Geen track"}</h3>
            <p className="text-[10px] uppercase tracking-[0.16em] mt-1 opacity-80">{tracks.length} bestanden beschikbaar</p>
            <div className="mt-auto">
              <p className="text-[8px] uppercase tracking-[0.2em] opacity-50">tik → terug</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 p-3.5 flex flex-col" style={{ color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
            <WidgetHeader type="social" label="Music." count={tracks.length ? `${tracks.length} tracks` : ""} />
            <h3 className="text-[20px] leading-[1.05] font-display font-semibold tracking-[-0.02em] mt-1">{tracks.length > 0 ? `${tracks.length} TRACKS` : "QUIETLY TUNED"}</h3>
            <p className="text-[10px] uppercase tracking-[0.18em] mt-1 opacity-60">{cloudMusic.length} cloud · {localMusic.length} lokaal</p>
            <div className="mt-auto space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-9 w-2 rounded-full shrink-0" style={{ background: "hsl(var(--d-life-deep))" }} />
                <div className="flex-1">
                  <p className="text-[12px] font-display font-semibold leading-none">Cloud</p>
                  <p className="text-[9px] uppercase tracking-[0.14em] opacity-60 mt-1">{cloudMusic.length} tracks</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-9 w-2 rounded-full shrink-0" style={{ background: "hsl(var(--d-life-light))" }} />
                <div className="flex-1">
                  <p className="text-[12px] font-display font-semibold leading-none">Lokaal</p>
                  <p className="text-[9px] uppercase tracking-[0.14em] opacity-60 mt-1">{localMusic.length} tracks</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* RECHTS: bestandenlijst (bij slide) */}
      <AnimatePresence>
        {slid && (
          <motion.div
            key="list"
            className="absolute inset-y-0 right-0 w-1/2 z-30 overflow-hidden rounded-r-[24px] flex flex-col"
            style={glassShell}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-3 pt-3 pb-2 flex items-center gap-2">
              <MusicIcon className="h-3.5 w-3.5" style={{ color: DEEP }} />
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold opacity-70">Bibliotheek · {tracks.length}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 space-y-1 no-scrollbar">
              {tracks.length === 0 && (
                <p className="text-[10px] opacity-50 px-2 py-6 text-center leading-relaxed">Geen muziekbestanden. Open MediaPlayer om toe te voegen.</p>
              )}
              {tracks.map((t) => {
                const active = current?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => playTrack(t)}
                    className={`w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition ${active ? "bg-charcoal/10" : "hover:bg-charcoal/5"}`}
                  >
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