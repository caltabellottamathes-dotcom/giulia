import React, { useState, useRef, useEffect } from "react";
import { X, Play } from "lucide-react";

const INTRO_VIDEO =
  "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/82b6ea8ba_Create_an_introduction_video_f.mp4";
const SEEN_KEY = "giulia_intro_seen";

/**
 * GiuliaIntroOverlay — Giulia's intro video, unmuted, playing once per
 * session. Lives on its own as a small floating vertical card — no longer
 * embedded inside the "je dag" widget.
 */
export default function GiuliaIntroOverlay() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(SEEN_KEY));
  const [needsTap, setNeedsTap] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => setNeedsTap(true));
  }, [visible]);

  const close = () => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setVisible(false);
  };

  const tapToPlay = () => {
    setNeedsTap(false);
    videoRef.current?.play().catch(() => {});
  };

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 lg:top-24 lg:right-8 z-40 w-[160px] lg:w-[200px] aspect-[9/16] rounded-[24px] overflow-hidden refraction-panel animate-scale-in">
      <button
        onClick={close}
        className="absolute top-2 left-2 z-10 h-7 w-7 rounded-lg bg-charcoal/50 flex items-center justify-center text-ivory/90 hover:text-ivory transition-colors"
        aria-label="Sluiten"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <video ref={videoRef} src={INTRO_VIDEO} playsInline onEnded={close} className="h-full w-full object-cover" />
      {needsTap && (
        <button onClick={tapToPlay} className="absolute inset-0 flex items-center justify-center bg-charcoal/40" aria-label="Afspelen">
          <span className="h-12 w-12 rounded-full bg-ivory/90 flex items-center justify-center">
            <Play className="h-5 w-5 text-charcoal" />
          </span>
        </button>
      )}
    </div>
  );
}