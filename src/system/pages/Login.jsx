import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { safeReturnTo, markInternalNavigation } from "@/lib/authReturnTo";
import { useAuth } from "@/lib/AuthContext";
import { Loader2 } from "lucide-react";

// Vast, gedeeld toegangsaccount — de ingevoerde code is het wachtwoord van dit account.
const ACCESS_EMAIL = "caltabellotta.mathes@gmail.com";
const LOGIN_VIDEO = "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/da37fce04_1_goed_mob.mp4";

export default function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  const { isAuthenticated, authChecked } = useAuth();

  const videoRef = useRef(null);

  useEffect(() => {
    if (authChecked && isAuthenticated) window.location.href = returnTo;
  }, [authChecked, isAuthenticated, returnTo]);

  // Muted autoplay — betrouwbaar, geen retry nodig.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.play().catch(() => {});
  }, []);

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

  const today = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Topbar — branding + datum */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-10 lg:px-16 py-6">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-charcoal" />
          <span className="font-display font-semibold tracking-[0.24em] text-[12px] uppercase text-foreground/80">Giulia</span>
        </div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/55 font-semibold hidden sm:block">{today}</p>
      </div>

      {/* Compositie — dashboard-stijl: login links, video-kaart rechts */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-stretch">
        {/* Links — login glasskaart (groter) */}
        <div className="flex-1 lg:w-[48%] flex items-center px-6 sm:px-10 lg:pl-16 lg:pr-8 pt-24 pb-8 lg:py-0">
          <div className="w-full max-w-[600px] animate-scale-in">
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/55 font-semibold mb-3">Giulia OS · Toegang</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[0.95] text-foreground mb-3">
              Voer je code in
            </h1>
            <p className="text-base text-foreground/65 mb-8 max-w-md">
              Eén code opent je hele werkomgeving — agenda, projecten, communicatie en je leven.
            </p>

            <div className="rounded-[28px] bg-white/70 backdrop-blur-xl border border-foreground/10 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] p-8 sm:p-10">
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-urgent/10 border border-urgent/20 text-foreground text-sm text-center font-medium">
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
                  className="w-full h-16 text-center text-3xl tracking-[0.5em] font-display bg-foreground/5 border border-foreground/15 rounded-2xl px-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-olive/50 focus:bg-foreground/[0.07] transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !pin}
                  className="w-full py-3.5 rounded-full bg-foreground text-ivory font-semibold text-sm tracking-wide inline-flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-foreground/90 transition-colors"
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
              <p className="mt-6 text-center text-[11px] text-foreground/45 tracking-wide">Giulia OS · besloten omgeving</p>
            </div>
          </div>
        </div>

        {/* Rechts — video-kaart, schuift van rechts in */}
        <div className="lg:w-[52%] relative flex items-center justify-center px-6 sm:px-10 lg:pr-16 lg:pl-8 pb-10 lg:py-0">
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-[38vh] lg:h-[82vh] rounded-[32px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)]"
          >
            <video
              ref={videoRef}
              src={LOGIN_VIDEO}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/30" />
            <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-10">
              <div className="flex items-center gap-2 justify-end">
                <span className="h-2.5 w-2.5 rounded-sm bg-ivory" />
                <span className="font-display font-semibold tracking-[0.24em] text-[12px] uppercase text-ivory">Giulia</span>
              </div>
              <div className="text-right">
                <h2 className="font-display font-semibold tracking-[-0.03em] leading-[0.82] text-ivory text-[clamp(3rem,8vw,7rem)] [text-shadow:0_2px_40px_rgba(0,0,0,0.5)]">
                  GIULIA
                </h2>
                <p className="mt-3 text-ivory/80 text-sm tracking-wide max-w-xs ml-auto text-balance [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
                  Je persoonlijke besturingssysteem.
                </p>
              </div>
              <div className="flex items-center gap-1.5 justify-end text-[11px] text-ivory/70 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-ivory/80 animate-pulse-soft" />
                Giulia staat klaar
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}