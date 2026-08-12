import React, { useState, useRef, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { X, Play, Loader2, Check, Sparkles } from "lucide-react";

const INTRO_VIDEO =
  "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/82b6ea8ba_Create_an_introduction_video_f.mp4";
const SEEN_KEY = "giulia_boot_seen";

/** Wake-reeks — de enkele leider (giuliaLeader) wekt het hele OS. Geen superagents. */
const WAKE = [
  { label: "Bronnen synchroniseren" },
  { label: "Giulia wekt het OS" },
  { label: "Taken & agenda" },
  { label: "Communicatie & mail" },
  { label: "Projecten & ideeën" },
  { label: "Proactief worden" },
];

/**
 * GiuliaIntroOverlay — fullscreen boot bij openen na inloggen (1× per
 * sessie). Speelt Giulia's intro-video full-screen EN vuurt "de bang":
 * startGiulia — sync + de enkele leider (giuliaLeader) die EEN keer met
 * Gemini alle domeinen inleest en proactief maakt. Geen autonome
 * superagents. Hun werk streamt live binnen via een Activity-feed,
 * zichtbaar door heel het OS.
 */
export default function GiuliaIntroOverlay() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(SEEN_KEY));
  const [needsTap, setNeedsTap] = useState(false);
  const [cycle, setCycle] = useState("running"); // running | done | error
  const [feed, setFeed] = useState([]);
  const videoRef = useRef(null);

  const close = useCallback(() => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setVisible(false);
  }, []);

  // De bang + live Activity-feed zodra de overlay opent.
  useEffect(() => {
    if (!visible) return;
    let unsub = null;
    (async () => {
      try {
        const recent = await base44.entities.Activity.list("-created_date", 6).catch(() => []);
        setFeed(recent || []);
      } catch { /* ignore */ }
      try {
        unsub = base44.entities.Activity?.subscribe?.((event) => {
          if (!event) return;
          base44.entities.Activity.list("-created_date", 6).then(setFeed).catch(() => {});
        });
      } catch { /* ignore */ }
      // De bang: startGiulia — sync + de leider wekt alle domeinen intern.
      try {
        await base44.functions.invoke("startGiulia", {});
        setCycle("done");
      } catch (e) {
        setCycle("error");
      }
    })();
    return () => { try { unsub && unsub(); } catch { /* ignore */ } };
  }, [visible]);

  // Video autoplay (unmuted — browser kan een tap eisen).
  useEffect(() => {
    if (!visible) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => setNeedsTap(true));
  }, [visible]);

  const tapToPlay = () => {
    setNeedsTap(false);
    videoRef.current?.play().catch(() => {});
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-charcoal animate-fade-in overflow-hidden">
      {/* Fullscreen video — de bang */}
      <video
        ref={videoRef}
        src={INTRO_VIDEO}
        playsInline
        autoPlay
        onEnded={close}
        className="absolute inset-0 h-full w-full object-contain"
      />

      {/* Overslaan */}
      <button
        onClick={close}
        className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-ivory/10 backdrop-blur-md px-3.5 py-2 text-[12px] font-medium text-ivory/90 hover:bg-ivory/20 transition"
        aria-label="Overslaan"
      >
        <X className="h-3.5 w-3.5" /> Overslaan
      </button>

      {/* Tap om af te spelen (autoplay-block) */}
      {needsTap && (
        <button onClick={tapToPlay} className="absolute inset-0 z-10 flex items-center justify-center bg-charcoal/40" aria-label="Afspelen">
          <span className="h-14 w-14 rounded-full bg-ivory/90 flex items-center justify-center">
            <Play className="h-6 w-6 text-charcoal" />
          </span>
        </button>
      )}

      {/* Giulia wekt het OS — live reeks onderaan */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 lg:p-8 bg-gradient-to-t from-charcoal via-charcoal/85 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-olive opacity-60 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-olive" />
            </span>
            <h2 className="text-ivory font-display font-semibold tracking-tight text-lg">
              {cycle === "done" ? "Giulia is wakker" : "Giulia wekt het OS"}
            </h2>
            <span className="ml-auto text-[11px] uppercase tracking-wider text-ivory/55 font-medium">
              {cycle === "done" ? "voltooid" : cycle === "error" ? "deels" : "actief"}
            </span>
          </div>

          {/* Wake-reeks */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {WAKE.map((a, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-ivory/5 border border-ivory/10 px-2.5 py-2">
                {cycle === "done" ? (
                  <Check className="h-3.5 w-3.5 text-olive shrink-0" />
                ) : (
                  <Loader2 className="h-3.5 w-3.5 text-ivory/70 shrink-0 animate-spin" />
                )}
                <span className="text-[11px] text-ivory/80 leading-tight truncate">{a.label}</span>
              </div>
            ))}
          </div>

          {/* Live Activity-feed */}
          {feed.length > 0 && (
            <div className="rounded-2xl bg-ivory/5 border border-ivory/10 p-3 max-h-32 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3 w-3 text-olive" />
                <p className="text-[10px] uppercase tracking-wider text-olive font-semibold">Live door het OS</p>
              </div>
              <div className="space-y-1.5">
                {feed.slice(0, 4).map((f) => (
                  <p key={f.id} className="text-[12px] text-ivory/75 leading-snug truncate">
                    <span className="text-ivory/45 mr-1.5">{(f.source || "giulia") + " ·"}</span>
                    {f.description}
                  </p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={close}
            className="mt-4 w-full h-11 rounded-2xl bg-ivory text-charcoal font-semibold text-sm hover:bg-ivory/90 transition"
          >
            {cycle === "done" ? "Open mijn dashboard" : "Naar dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}