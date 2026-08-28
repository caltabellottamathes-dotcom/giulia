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
 * FinanceHealthCard — vierkante meter. Achter: een grote BounceDot (kleur =
 * aandachtsportefeuille) die harder stuitert. Voor: een normale, statische
 * glaskaart (groeit niet meer) met de Giulia-insight linksboven en een groot
 * ghost-cijfer rechtsonder dat op telt van 00 naar de huidige health %.
 */
export default function FinanceHealthCard() {
  const { data: portfolios } = useEntityList("Portfolio", { realtime: true });
  const [insight, setInsight] = useState("");
  const [display, setDisplay] = useState(0);

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
    then((txt) => { if (active && txt) setInsight(String(txt).trim().slice(0, 140)); }).
    catch(() => {});
    return () => { active = false; };
  }, [portfolios, health, worst]);

  // Ghost-cijfer telt op van 00 naar health%.
  useEffect(() => {
    if (health == null) return;
    let raf;
    const start = performance.now();
    const dur = 1300;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(health * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [health]);

  const pad2 = (n) => String(n).padStart(2, "0");

  return (
    <div className="relative w-full h-full rounded-[20px] overflow-hidden" style={{ background: "rgba(176,188,194,0.92)" }}>
      {/* BounceDot — achter het glas, stuitert harder */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div
          className="bounce-hard rounded-full"
          style={{ width: "58%", aspectRatio: "1 / 1", background: attention, boxShadow: "0 10px 30px -8px rgba(0,0,0,0.4)" }}
        />
      </div>

      {/* Normale glaskaart — statisch, groeit niet */}
      <div
        className="absolute inset-0 z-10 rounded-[20px] overflow-hidden"
        style={{
          background: "rgba(118,118,118,0.55)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow: "0 18px 40px -16px rgba(0,0,0,0.45)"
        }}
      >
        <p className="absolute top-3 left-3 z-30 text-white/75 text-[10px] uppercase tracking-[0.2em] font-light" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
          Financial Health
        </p>
        <p className="absolute top-9 left-3 right-3 text-white/85 text-[11px] font-light leading-snug" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
          {insight || "…"}
        </p>
        <span
          className="absolute font-display font-bold leading-none select-none"
          style={{
            fontSize: "clamp(120px, 22vw, 300px)",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "-0.06em",
            right: "-4%",
            bottom: "-26%"
          }}
        >
          {pad2(display)}
        </span>
      </div>
    </div>
  );
}