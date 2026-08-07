import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassInput from "@/components/glass/GlassInput";
import GlassButton from "@/components/glass/GlassButton";
import GlassPanel from "@/components/glass/GlassPanel";
import GoogleIcon from "@/components/GoogleIcon";
import { IMAGES } from "@/lib/images";
import { safeReturnTo } from "@/lib/authReturnTo";
import {
  Mail, Lock, Loader2, Shield, Search, Edit3, User,
  LayoutGrid, Sparkles,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Post-login destination (e.g. the MCP OAuth consent page sends users here
  // with returnTo so the grant flow can resume). Same-origin paths only.
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", returnTo);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left — full-bleed editorial photography */}
      <div className="hidden lg:block w-[38%] relative shrink-0">
        <img
          src={IMAGES.portraitBootHands}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/70" />
      </div>

      {/* Center — floating glass brand panel */}
      <div className="hidden lg:flex w-[300px] shrink-0 items-center px-6">
        <GlassPanel level={3} className="p-8 w-full text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-olive" />
            <span className="text-xs tracking-[0.25em] uppercase">Giulia</span>
          </div>
          <h2 className="text-xl font-heading font-light leading-snug">
            Uw Persoonlijke Assistent
          </h2>
          <p className="text-sm text-muted-foreground mt-3">
            Eenvoudig, slim en altijd voor u klaar.
          </p>
          <div className="flex items-center justify-center gap-3 mt-10">
            <span className="text-xs font-medium">01</span>
            <span className="text-xs text-muted-foreground/60">02</span>
            <span className="text-xs text-muted-foreground/60">03</span>
          </div>
          <div className="h-px bg-border/60 mt-2" />
        </GlassPanel>
      </div>

      {/* Right — functional form column */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Mobile background */}
        <div className="lg:hidden absolute inset-0 opacity-20 pointer-events-none">
          <img src={IMAGES.portraitBootHands} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative flex flex-col flex-1 px-6 sm:px-10 lg:px-14 py-6">
          {/* Top navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center text-foreground"
              aria-label="Menu"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              <button type="button" className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center text-foreground" aria-label="Zoeken">
                <Search className="h-4 w-4" />
              </button>
              <button type="button" className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center text-foreground" aria-label="Bewerken">
                <Edit3 className="h-4 w-4" />
              </button>
              <button type="button" className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center text-foreground" aria-label="Profiel">
                <User className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 flex items-center">
            <div className="w-full max-w-sm">
              <h1 className="text-2xl font-heading font-light tracking-tight">
                Inloggen bij Giulia
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 mb-8">
                Welkom terug. Log in om door te gaan.
              </p>

              <button
                type="button"
                onClick={handleGoogle}
                className="glass-button w-full h-11 rounded-xl text-sm font-medium mb-5 flex items-center justify-center gap-2"
              >
                <GoogleIcon className="w-4 h-4" />
                Doorgaan met Google
              </button>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">of</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <GlassInput
                  label="E-mail of Gebruikersnaam"
                  icon={Mail}
                  type="email"
                  placeholder="Voer uw e-mail..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <GlassInput
                  label="Wachtwoord"
                  icon={Lock}
                  type="password"
                  placeholder="Voer uw wachtwoord..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <GlassButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Inloggen...
                    </>
                  ) : (
                    "Log In"
                  )}
                </GlassButton>
              </form>

              <div className="flex items-center justify-between mt-5 text-xs">
                <Link
                  to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Account aanmaken
                </Link>
                <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground transition-colors">
                  Wachtwoord vergeten?
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-start gap-2.5 max-w-xs">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">Uw gegevens zijn beveiligd</p>
                <p className="text-[11px] text-muted-foreground">
                  Giulia beschermt uw privacy.{" "}
                  <span className="underline cursor-pointer">Meer informatie ›</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium">01</span>
              <span className="text-xs text-muted-foreground/60">02</span>
              <span className="text-xs text-muted-foreground/60">03</span>
              <div className="w-12 h-px bg-border/60 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}