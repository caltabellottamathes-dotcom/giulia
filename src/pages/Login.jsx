import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GoogleIcon from "@/components/GoogleIcon";
import { IMAGES } from "@/lib/images";
import { safeReturnTo } from "@/lib/authReturnTo";
import {
  Mail, Lock, Loader2, Search, Edit3, User, Eye, EyeOff,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const topIcons = [Search, Edit3, User];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Full-bleed editorial photography */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.portraitBootHands}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      {/* Asymmetric fade — photo visible left/center, off-white right */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/15 to-background/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20" />

      {/* Top navigation — logo left, glass icon cluster right */}
      <div className="relative flex items-center justify-between px-6 sm:px-10 lg:px-14 py-7">
        <span className="text-sm font-semibold tracking-[0.28em] uppercase text-foreground">
          Giulia
        </span>
        <div className="flex gap-2.5">
          {topIcons.map((Icon, i) => (
            <button
              key={i}
              type="button"
              className="h-10 w-10 rounded-full glass-2 flex items-center justify-center text-foreground hover:scale-105 transition-transform duration-300"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Center floating glass panel — the hero element */}
      <div
        className="relative flex items-center justify-center px-6"
        style={{ minHeight: "calc(100vh - 96px)" }}
      >
        <div className="glass-3 float-shadow rounded-[28px] w-full max-w-[460px] p-9 lg:p-11 relative animate-scale-in">
          {/* Brand — strong editorial typography */}
          <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight leading-none mb-1">
            Giulia:
          </h1>
          <h2 className="text-xl lg:text-2xl font-heading font-light tracking-tight mb-3">
            Uw Persoonlijke Assistent
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-7 max-w-sm">
            Eenvoudig, slim en altijd voor u klaar. Log in om door te gaan.
          </p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            className="glass-1 w-full h-11 rounded-xl text-sm font-medium mb-4 flex items-center justify-center gap-2 hover:bg-foreground/[0.03] transition-colors"
          >
            <GoogleIcon className="w-4 h-4" />
            Doorgaan met Google
          </button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center">
              <span className="glass-4 px-3 py-0.5 text-[11px] text-muted-foreground rounded-full">
                of
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5 block">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Voer uw e-mail..."
                  required
                  autoFocus
                  className="w-full glass-1 rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-olive/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5 block">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Voer uw wachtwoord..."
                  required
                  className="w-full glass-1 rounded-xl pl-11 pr-11 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-olive/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-charcoal text-ivory text-sm font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Inloggen...
                </>
              ) : (
                <>
                  Log In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between mt-5 text-xs">
            <Link
              to={
                "/register" +
                (returnTo !== "/"
                  ? "?returnTo=" + encodeURIComponent(returnTo)
                  : "")
              }
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Account aanmaken
            </Link>
            <Link
              to="/forgot-password"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Wachtwoord vergeten?
            </Link>
          </div>

          {/* Pagination inside panel — bottom right */}
          <div className="flex items-center gap-2 mt-8 justify-end">
            <span className="text-xs font-medium">01</span>
            <span className="text-xs text-muted-foreground/50">02</span>
            <span className="text-xs text-muted-foreground/50">03</span>
            <div className="w-10 h-px bg-border/60 ml-1" />
          </div>
        </div>
      </div>

      {/* Bottom right pagination with progress line */}
      <div className="absolute bottom-6 right-6 sm:right-10 lg:right-14 flex items-center gap-2">
        <span className="text-xs font-medium">01</span>
        <span className="text-xs text-muted-foreground/50">02</span>
        <span className="text-xs text-muted-foreground/50">03</span>
        <div className="w-12 h-px bg-foreground/30 ml-1" />
      </div>
    </div>
  );
}