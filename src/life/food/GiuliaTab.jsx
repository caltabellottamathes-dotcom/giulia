import React, { useState } from "react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntity";
import { fmtEuro } from "@/lib/foodUtils";
import FoodProfileCard from "./FoodProfileCard";
import { Loader2, Sparkles, Check, ArrowRight } from "lucide-react";

/** TAB 5 — GIULIA. Hier stelt Giulia een nieuwe eetweek samen.
 *  1) Food Profile (bewerkbaar) → 2) Plan nieuwe week → 3) resultaat → 4) Accept. */
export default function GiuliaTab({ reload, goToTab }) {
  const { data: profiles, reload: reloadProfiles } = useEntityList("FoodProfile", { realtime: true });
  const profile = profiles[0];
  const [planning, setPlanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const planWeek = async () => {
    setPlanning(true);
    setError("");
    setResult(null);
    try {
      const res = await base44.functions.invoke("planFoodWeek", {});
      setResult(res);
      reload();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setPlanning(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. FOOD PROFILE */}
      <FoodProfileCard profile={profile} editable onSaved={reloadProfiles} />

      {/* 2. GIULIA PREPARES */}
      <GlassPanel level={2} className="p-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold mb-1">2 · Giulia prepares</p>
        <p className="text-sm text-muted-foreground mb-4">Giulia combineert je profiel, eerdere weken, beoordelingen, wat er in huis is en actuele producten/prijzen tot een weekvoorstel.</p>
        <button onClick={planWeek} disabled={planning} className="rounded-full px-6 py-3 text-sm font-bold bg-charcoal text-ivory inline-flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-transform">
          {planning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {planning ? "Giulia plant…" : "Plan nieuwe week"}
        </button>
        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      </GlassPanel>

      {/* 3. RESULTAAT + BIJSTUREN */}
      {result && (
        <GlassPanel level={2} className="p-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-semibold">3 · Jij kunt bijsturen</p>
          <h3 className="text-2xl font-display font-semibold mt-1">Je week is klaar</h3>
          <div className="flex flex-wrap gap-6 mt-4">
            <Stat label="Budget" value={`${fmtEuro(result.total_cost)} / ${fmtEuro(result.budget)}`} />
            <Stat label="Maaltijden" value={result.meals_count} />
            <Stat label="Quick" value={result.quick_meals} accent="hsl(var(--olive))" />
            <Stat label="Aanbiedingen" value={result.promotions} />
          </div>
          <p className="text-sm text-muted-foreground mt-4">Pas individuele gerechten aan in de <b>Planning</b>-tab — verplaatsen, verwijderen of een ander recept bekijken.</p>
          <div className="flex flex-wrap gap-2 mt-5">
            <button onClick={() => goToTab && goToTab("planning")} className="rounded-full px-5 py-2.5 text-sm font-bold glass-button text-foreground inline-flex items-center gap-1.5">Naar planning <ArrowRight className="h-4 w-4" /></button>
            <button onClick={() => goToTab && goToTab("volgende")} className="rounded-full px-5 py-2.5 text-sm font-bold bg-charcoal text-ivory inline-flex items-center gap-1.5"><Check className="h-4 w-4" /> Accept week</button>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <p className="text-xl font-display font-semibold tabular-nums" style={accent ? { color: accent } : undefined}>{value}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{label}</p>
    </div>
  );
}