import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { safeReturnTo, markInternalNavigation } from "@/lib/authReturnTo";
import { useAuth } from "@/lib/AuthContext";
import { IMAGES } from "@/lib/images";
import { Loader2 } from "lucide-react";

// Vast, gedeeld toegangsaccount — de ingevoerde code is het wachtwoord van dit account.
const ACCESS_EMAIL = "caltabellotta.mathes@gmail.com";
const LOGIN_VIDEO_DESKTOP = "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/1c9e118d0_GIULIA_LOGIN_DESKTOP.mp4";
const LOGIN_VIDEO_MOBILE = "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/413b78112_New_LOGIN_Mobiel_Final_.mp4";

export default function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  const { isAuthenticated, authChecked } = useAuth();

  const videoRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);

  useEffect(() => {
    if (authChecked && isAuthenticated) window.location.href = returnTo;
  }, [authChecked, isAuthenticated, returnTo]);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Gemute autoplay — betrouwbaar in elke browser (unmuted autoplay wordt
  // geblokkeerd). Video is decoratieve achtergrond, geen geluid nodig.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.play().catch(() => {});
  }, [isDesktop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(ACCESS_EMAIL, pin);
      markInternalNavigation();
      window.location.href = returnTo;
    } catch (err) {
      setError("Onjuiste code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-charcoal">
      {/* Backdrop — Giulia opening video, full color. Eén video per viewport. */}
      <div className="absolute inset-0">
        <video
          key={isDesktop ? "desktop" : "mobile"}
          ref={videoRef}
          src={isDesktop ? LOGIN_VIDEO_DESKTOP : LOGIN_VIDEO_MOBILE}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Big GIULIA wordmark composition — right side, glass-style over the video */}
      <div className="hidden lg:flex absolute inset-y-0 right-0 w-[56%] flex-col justify-between p-10 pointer-events-none select-none z-[5]">
        <div className="flex items-center gap-2 justify-end">
          <span className="h-2.5 w-2.5 rounded-sm bg-ivory" />
          <span className="font-display font-semibold tracking-[0.28em] text-[13px] uppercase text-ivory">Giulia</span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ivory/70 mb-3 font-semibold [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
            {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.82] text-ivory text-[clamp(6rem,17vw,15rem)] [text-shadow:0_2px_40px_rgba(0,0,0,0.5)]">
            GIULIA
          </h1>
          <p className="mt-4 text-ivory/80 text-sm tracking-wide max-w-sm ml-auto text-balance [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
            Je persoonlijke besturingssysteem — agenda, communicatie, projecten en documenten in één rustige werkomgeving.
          </p>
        </div>
        <div className="flex items-center gap-1.5 justify-end text-[11px] text-ivory/70 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-ivory/80 animate-pulse-soft" />
          Giulia staat klaar
        </div>
      </div>

      {/* Translucent glass card — like the app's glass panels, over the full-color video */}
      <div className="relative z-10 min-h-screen flex items-center px-6 sm:px-10 lg:px-16">
        <div className="w-full max-w-[440px] glass-3 rounded-[28px] p-8 sm:p-10 text-ivory animate-scale-in">
          <div className="flex items-center gap-2 mb-8">
            <span className="h-2.5 w-2.5 rounded-sm bg-ivory" />
            <span className="font-display font-semibold tracking-[0.24em] text-[12px] uppercase text-ivory/90">Giulia</span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.28em] text-ivory/65 font-semibold mb-3">Toegang</p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-[-0.02em] leading-tight text-ivory mb-2">
            Voer je code in
          </h2>
          <p className="text-sm text-ivory/65 mb-8">Eén code opent je hele werkomgeving.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-ivory/10 border border-ivory/15 text-ivory text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              autoFocus
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full h-16 text-center text-3xl tracking-[0.5em] font-display bg-ivory/5 border border-ivory/15 rounded-2xl px-4 text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-olive/50 focus:bg-ivory/10 transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full py-3.5 rounded-full bg-olive text-ivory font-semibold text-sm tracking-wide inline-flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-olive/90 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Bezig…
                </>
              ) : (
                "Openen"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-ivory/50 tracking-wide">
            Giulia OS · besloten omgeving
          </p>
        </div>
      </div>
    </div>
  );
}