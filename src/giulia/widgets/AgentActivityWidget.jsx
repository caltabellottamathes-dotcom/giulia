import React, { useState, useRef, useEffect } from "react";
import WidgetShell from "../../system/widgets/WidgetShell";
import BrandPhoto from "../../system/widgets/BrandPhoto";
import Ring from "../../system/widgets/Ring";
import CountUp from "../../system/widgets/CountUp";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { Play, RotateCw, Check } from "lucide-react";

const DURATION = 3200; // ms to reach 100%

/**
 * AgentActivityWidget — "Giulia · Agenten". A photo floats over the top of the
 * glass; a big "Run" button starts the cycle and a Ring fills 0→100%. At 100%
 * all agents are active and have done their thing. Tap → agents paneel.
 */
export default function AgentActivityWidget() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const run = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    // opstart-procedure: de enkele leider (giuliaLeader) initieert alle agents intern
    base44.functions.invoke("startGiulia", {}).catch(() => {});
    const start = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - start) / DURATION) * 100));
      setProgress(p);
      if (p >= 100) { clearInterval(timer.current); timer.current = null; setRunning(false); }
    }, 50);
  };

  const reset = (e) => { e.stopPropagation(); setProgress(0); };
  const done = progress >= 100 && !running;

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => navigate("/agents")} className="min-h-[340px]">
      <div className="flex flex-col h-full">
        <BrandPhoto
          src={IMAGES.feetChair}
          className="h-28 -mb-8 rounded-b-[24px] z-10 shadow-[0_14px_28px_-12px_rgba(0,0,0,0.3)]"
          overlay="bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent"
        >
          <div className="absolute inset-0 p-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-semibold text-ivory/80">Who's Working?</p>
              <p className="text-lg font-display font-semibold text-ivory mt-0.5" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{done ? "Klaar" : running ? "Activeren…" : "Klaar om te starten"}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-display font-bold text-ivory tabular-nums leading-none">{progress}%</span>
              <p className="text-[10px] uppercase tracking-wider text-ivory/60 mt-1">actief</p>
            </div>
          </div>
        </BrandPhoto>

        <div className="flex-1 p-5 pt-10 flex flex-col items-center justify-center text-current min-h-0" onClick={(e) => e.stopPropagation()}>
          <Ring value={progress} max={100} size={150} stroke={14}>
            <div className="text-center">
              {done
                ? <Check className="h-7 w-7 mx-auto" style={{ color: "var(--tile-accent)" }} />
                : <CountUp value={progress} className="text-3xl font-display font-semibold tabular-nums leading-none" />}
              <p className="text-[9px] uppercase tracking-wider opacity-50 mt-1">{done ? "alle actief" : "agenten"}</p>
            </div>
          </Ring>

          {done ? (
            <button onClick={reset} className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition hover:-translate-y-0.5 active:scale-95 border border-current/20">
              <RotateCw className="h-3.5 w-3.5" /> Opnieuw
            </button>
          ) : (
            <button
              onClick={run}
              disabled={running}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
              style={{ background: "var(--tile-accent)", color: "var(--tile-on-accent)" }}
            >
              <Play className="h-3.5 w-3.5" /> {running ? "Laden…" : "Run"}
            </button>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}