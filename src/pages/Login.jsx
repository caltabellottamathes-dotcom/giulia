import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { safeReturnTo, markInternalNavigation } from "@/lib/authReturnTo";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, KeyRound } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

// Vast, gedeeld toegangsaccount — de ingevoerde code is het wachtwoord van dit account.
const ACCESS_EMAIL = "caltabellotta.mathes@gmail.com";

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
    <AuthLayout icon={KeyRound} title="Toegangscode" subtitle="Voer de code in om Giulia te openen">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          autoFocus
          placeholder="••••••"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="h-14 text-center text-2xl tracking-[0.4em]"
          required
        />
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || !pin}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Bezig…
            </>
          ) : (
            "Openen"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}