import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { safeReturnTo } from "@/lib/authReturnTo";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("mail@salvatorecaltabellotta.com");
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
      setError(err.message || "Onjuist e-mail of wachtwoord");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0">
        <img src={IMAGES.portraitBootHands} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/15 to-background/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20" />

      <div className="relative flex items-center justify-center px-6" style={{ minHeight: "100vh" }}>
        <div className="glass-3 float-shadow rounded-[28px] w-full max-w-[420px] p-9 lg:p-10 relative animate-scale-in">
          <span className="text-sm font-semibold tracking-[0.28em] uppercase text-foreground mb-6 block">Giulia</span>
          <h1 className="text-3xl font-heading font-bold tracking-tight leading-none mb-1">Welkom terug.</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">Log in om door te gaan naar je dashboard.</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full glass-1 rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-olive/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5 block">Wachtwoord</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Wachtwoord…"
                  className="w-full glass-1 rounded-xl pl-11 pr-11 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-olive/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-charcoal text-ivory text-sm font-medium hover:bg-charcoal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Inloggen…</>
              ) : (
                <>Log in <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}