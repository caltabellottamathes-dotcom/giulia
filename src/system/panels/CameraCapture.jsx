import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useMediaLibrary } from "@/lib/useMediaLibrary";
import { Camera, Video, X, Check } from "lucide-react";

const FOLDER = "PlayTime";

/** CameraCapture — webcam/camera in de MediaStage (tab "Camera").
 *  Maak foto's of film video's; opnames worden geüpload én opgeslagen in de
 *  map "PlayTime" (Upload-entity) en verschijnen direct in de mediatheek.
 *  Exposeert een imperative API (capturePhoto / startRecord / stopRecord) zodat
 *  Mattia de camera via playtime:media-command kan bedienen. */
const CameraCapture = forwardRef(function CameraCapture({ onClose }, ref) {
  const { upload } = useMediaLibrary();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const [mode, setMode] = useState("photo");
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(false);
  const [saved, setSaved] = useState(0);

  const stopStream = useCallback(() => {
    try { if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop(); } catch { /* ignore */ }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setRecording(false); setSeconds(0);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        stopStream();
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
        if (!alive) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
        setReady(true); setError("");
      } catch {
        setError("Geen camera-toegang. Sta je camera toe in de browserinstellingen.");
        setReady(false);
      }
    })();
    return () => { alive = false; stopStream(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !ready || busy) return;
    setBusy(true); setFlash(true);
    setTimeout(() => setFlash(false), 180);
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 1280;
    canvas.height = v.videoHeight || 720;
    canvas.getContext("2d").drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `playtime-${Date.now()}.jpg`, { type: "image/jpeg" });
        await upload(file, FOLDER);
        setSaved((n) => n + 1);
      }
      setBusy(false);
    }, "image/jpeg", 0.92);
  }, [ready, busy, upload]);

  const startRecord = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || recording) return;
    chunksRef.current = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    let rec;
    try { rec = new MediaRecorder(stream, { mimeType: mime }); }
    catch { try { rec = new MediaRecorder(stream); } catch { return; } }
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      if (blob.size) {
        const file = new File([blob], `playtime-${Date.now()}.webm`, { type: "video/webm" });
        setBusy(true);
        await upload(file, FOLDER);
        setBusy(false);
        setSaved((n) => n + 1);
      }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setRecording(false); setSeconds(0);
    };
    rec.start();
    recorderRef.current = rec;
    setRecording(true); setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, [recording, upload]);

  const stopRecord = useCallback(() => {
    try { if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop(); } catch { /* ignore */ }
  }, []);

  // Imperatief — Mattia (via playtime:media-command → MediaStage ref)
  useImperativeHandle(ref, () => ({ capturePhoto: takePhoto, startRecord, stopRecord }), [takePhoto, startRecord, stopRecord]);

  const toggleRecord = recording ? stopRecord : startRecord;
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative h-full w-full bg-black flex flex-col">
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} />
        {flash && <div className="absolute inset-0 bg-white animate-fade-in" />}
        {!ready && !error && <div className="absolute inset-0 flex items-center justify-center text-ivory/60 text-xs">Camera starten…</div>}
        {error && <div className="absolute inset-0 flex items-center justify-center text-center px-6 text-ivory/70 text-xs">{error}</div>}
        {recording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[11px] text-ivory">{mmss(seconds)}</span>
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 bg-black/40 border-t border-white/10">
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 border border-white/15">
          <button onClick={() => setMode("photo")} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] transition ${mode === "photo" ? "bg-white/25 text-ivory" : "text-ivory/65 hover:text-ivory"}`}>
            <Camera className="h-3.5 w-3.5" /> Foto
          </button>
          <button onClick={() => setMode("video")} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] transition ${mode === "video" ? "bg-white/25 text-ivory" : "text-ivory/65 hover:text-ivory"}`}>
            <Video className="h-3.5 w-3.5" /> Film
          </button>
        </div>

        <button
          onClick={mode === "photo" ? takePhoto : toggleRecord}
          disabled={!ready || busy}
          className="h-14 w-14 rounded-full border-2 border-ivory/80 flex items-center justify-center disabled:opacity-40 transition hover:scale-105 active:scale-95"
          aria-label={mode === "photo" ? "Maak foto" : recording ? "Stop opname" : "Start opname"}
        >
          {mode === "photo" ? (
            <span className="h-10 w-10 rounded-full bg-ivory/90" />
          ) : recording ? (
            <span className="h-7 w-7 rounded-md bg-red-500" />
          ) : (
            <span className="h-11 w-11 rounded-full border-2 border-ivory/80" />
          )}
        </button>

        <div className="flex items-center gap-2">
          {saved > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-ivory/70 font-mono">
              <Check className="h-3 w-3" /> {saved}
            </span>
          )}
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-white/15 transition" aria-label="Sluiten" title="Sluiten">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default CameraCapture;