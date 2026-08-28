import React, { useMemo, useEffect, useState } from "react";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";

const NAME_COLOR = {
  wonen: "#d8dab3",
  gezondheid: "#301728",
  communicatie: "#595c64",
  "dagelijks leven": "#abab69",
  mobiliteit: "#8b8471",
  voorzorg: "#d0d9dd"
};
const colorFor = (name) => {
  const k = String(name || "").toLowerCase();
  for (const key of Object.keys(NAME_COLOR)) if (k.includes(key)) return NAME_COLOR[key];
  return "#9c9c9c";
};
const fmt = (n) => `€${Math.round(n).toLocaleString("en-US")}`;

/**
 * FinanceHealthCard — vierkante meter met glasachtige blauwe shell. Grote
 * BOUNCE-dot (kleur = aandachtsportefeuille); glazen kaart flush met 4 ronde
 * hoeken + schaduw, hoogte = health % (de ghost number, max 100); bovenaan een
 * korte Giulia-insight over wat aandacht nodig heeft; ghost-number half
 * afgekopt rechtsonder.
 */
export default function FinanceHealthCard() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const [insight, setInsight] = useState("");

  const { health, attention, worst } = useMemo(() => {
    const pots = (portfolios || []).filter((p) => p.active !== false && !p.archived);
    if (!pots.length) return { health: 0, attention: "#0a0a0a", worst: null };
    let sum = 0;
    let worst = null;
    let worstRatio = 2;
    for (const p of pots) {
      const target = p.target_balance || p.desired_buffer || p.current_balance || 0;
      const fill = target > 0 ? Math.min(100, (p.current_balance || 0) / target * 100) : 100;
      sum += fill;
      const ratio = target > 0 ? (p.current_balance || 0) / target : 1;
      if (ratio < worstRatio && ratio < 1) {
        worstRatio = ratio;
        worst = { name: p.name, fill: Math.round(fill), remaining: Math.max(0, target - (p.current_balance || 0)), color: p.color || colorFor(p.name) };
      }
    }
    return {
      health: Math.round(sum / pots.length),
      attention: worst ? worst.color : "#0a0a0a",
      worst
    };
  }, [portfolios]);

  // Giulia genereert een korte insight over wat aandacht nodig heeft.
  useEffect(() => {
    if (!portfolios || portfolios.length === 0) return;
    let active = true;
    const fallback = worst ? `${worst.name} staat op ${worst.fill}% — nog ${fmt(worst.remaining)} tot doel.` : "Alles op peil.";
    setInsight(fallback);
    base44.integrations.Core.InvokeLLM({
      prompt: `Jij bent Giulia, een persoonlijk AI-assistent. De financiële gezondheidsscore is ${health}%. Het meest achterlopende potje is "${worst?.name || "—"}" met nog ${fmt(worst?.remaining || 0)} tot doel. Geef één korte, vriendelijke, concrete zin (max 14 woorden, Nederlands, 2e persoon) over wat nu het meeste aandacht nodig heeft om dit getal te verbeteren. Alleen de zin, geen voorvoegsel.`
    }).
    then((txt) => {if (active && txt) setInsight(String(txt).trim().slice(0, 140));}).
    catch(() => {});
    return () => {active = false;};
  }, [portfolios, health, worst]);

  return (
    <div
      className="relative w-full h-full rounded-[20px] overflow-hidden"
      style={{
        background: "rgba(177,191,199,0.45)",
        backdropFilter: "blur(12px) saturate(1.3)",
        WebkitBackdropFilter: "blur(12px) saturate(1.3)",
        border: "1px solid rgba(255,255,255,0.25)"
      }}>
      
      {/* Header linksboven (op blauw glas, boven het glas-paneel) */}
      <p className="absolute top-3 left-3 z-30 text-foreground/70 text-[10px] uppercase tracking-[0.2em] font-light">
        Financial Health
      </p>

      {/* Grote BOUNCE-dot in het midden — kleur = aandachtsportefeuille */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div
          className="ontwerp-dot-bounce rounded-full"
          style={{ width: "58%", aspectRatio: "1 / 1", background: attention, boxShadow: "0 10px 30px -8px rgba(0,0,0,0.4)" }} />
        
      </div>

      {/* Glazen kaart — flush, 4 ronde hoeken, schaduw op blauw, hoogte = health % */}
      <div
        className="absolute z-10 overflow-hidden opacity-100"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          top: `${100 - health}%`,
          borderRadius: 16,
          background: "rgba(120,122,128,0.30)",
          backdropFilter: "blur(112px) saturate(1.4)",
          WebkitBackdropFilter: "blur(112px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 -16px 34px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
          transition: "top 0.6s cubic-bezier(0.16,1,0.3,1)"
        }}>
        
        {/* Giulia insight linksboven op het glas */}
        <p className="absolute top-3 left-3 right-16 text-white/90 text-[11px] font-light leading-snug" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}>
          {insight || "…"}
        </p>

        {/* Grote asymmetrische, half afgekopte ghost-number rechtsonder */}
        <span
          className="absolute font-display font-bold leading-none select-none"
          style={{
            fontSize: "clamp(120px, 22vw, 300px)",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "-0.06em",
            right: "-4%",
            bottom: "-26%"
          }}>
          
          {health}
        </span>
      </div>
    </div>);

}