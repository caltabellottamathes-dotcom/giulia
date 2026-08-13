import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { safeReturnTo, markInternalNavigation } from "@/lib/authReturnTo";
import { useAuth } from "@/lib/AuthContext";
import { IMAGES } from "@/lib/images";
import { Loader2 } from "lucide-react";

// Vast, gedeeld toegangsaccount — de ingevoerde code is het wachtwoord van dit account.
const ACCESS_EMAIL = "caltabellotta.mathes@gmail.com";
const LOGIN_VIDEO = "https://media.base44.com/videos/public/6a7608690d4ea2c9edc3d59b/12d2b2932_Make_an_intro_video_for_the_lo.mp4";

export default function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  const { isAuthenticated, authChecked } = useAuth();

  useEffect(() => {
    if (authChecked && isAuthenticated) window.location.href = returnTo;
  }, [authChecked, isAuthenticated, returnTo]);

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
      {/* Backdrop — Giulia opening video, bright and fresh */}
      <div className="absolute inset-0">
        <video
          src={LOGIN_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
        {/* Soft warm wash — keeps the video fresh and airy, no dark overlay */}
        <div className="absolute inset-0 bg-ivory/25" />
      </div>

      {/* Big GIULIA wordmark composition — right side, fresh over the video */}
      <div className="hidden lg:flex absolute inset-y-0 right-0 w-[56%] flex-col justify-between p-10 pointer-events-none select-none z-[5]">
        <div className="flex items-center gap-2 justify-end">
          <span className="h-2.5 w-2.5 rounded-sm bg-charcoal" />
          <span className="font-display font-semibold tracking-[0.28em] text-[13px] uppercase text-charcoal/80">Giulia</span>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.3em] text-charcoal/60 mb-3 font-semibold">
            {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display font-semibold tracking-[-0.03em] leading-[0.82] text-charcoal text-[clamp(6rem,17vw,15rem)] [text-shadow:0_2px_40px_rgba(255,255,255,0.7)]">
            GIULIA
          </h1>
          <p className="mt-4 text-charcoal/70 text-sm tracking-wide max-w-sm ml-auto text-balance [text-shadow:0_1px_12px_rgba(255,255,255,0.6)]">
            Je persoonlijke besturingssysteem — agenda, communicatie, projecten en documenten in één rustige werkomgeving.
          </p>
        </div>
        <div className="flex items-center gap-1.5 justify-end text-[11px] text-charcoal/60 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft" />
          Giulia staat klaar
        </div>
      </div>

      {/* Light glass card — floating over the left of the backdrop, fresh */}
      <div className="relative z-10 min-h-screen flex items-center px-6 sm:px-10 lg:px-16">
        <div className="w-full max-w-[440px] rounded-[28px] p-8 sm:p-10 text-charcoal animate-scale-in bg-ivory/70 backdrop-blur-2xl border border-white/60 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.22),inset_0_1px_0_0_rgba(255,255,255,0.6)]">
          <div className="flex items-center gap-2 mb-8">
            <span className="h-2.5 w-2.5 rounded-sm bg-charcoal" />
            <span className="font-display font-semibold tracking-[0.24em] text-[12px] uppercase text-charcoal/80">Giulia</span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.28em] text-charcoal/55 font-semibold mb-3">Toegang</p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold tracking-[-0.02em] leading-tight text-charcoal mb-2">
            Voer je code in
          </h2>
          <p className="text-sm text-charcoal/60 mb-8">Eén code opent je hele werkomgeving.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-charcoal/8 border border-charcoal/12 text-charcoal text-sm text-center font-medium">
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
              className="w-full h-16 text-center text-3xl tracking-[0.5em] font-display bg-white/50 border border-charcoal/15 rounded-2xl px-4 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-olive/50 focus:bg-white/70 transition-colors"
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

          <p className="mt-8 text-center text-[11px] text-charcoal/45 tracking-wide">
            Giulia OS · besloten omgeving
          </p>
        </div>
      </div>
    </div>
  );
}