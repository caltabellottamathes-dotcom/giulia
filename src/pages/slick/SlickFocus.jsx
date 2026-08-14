import React, { useState, useEffect } from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

export default function SlickFocus() {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div>
      <Head title="Focus Modus" tag="Concentratie" />
      <div className="flex flex-col items-center justify-center py-10">
        <p className="text-marble/60 text-xs uppercase tracking-wider mb-2">Huidige taak</p>
        <h2 className="text-slickstorm text-xl font-semibold text-center">Identiteit-richting uitwerken</h2>
        <p className="text-marble/60 text-xs mt-1">Identiteit · 90 min gepland</p>

        <div className="my-10 h-44 w-44 rounded-full border border-marble/30 bg-marble/10 backdrop-blur-md flex items-center justify-center">
          <span className="text-slickstorm text-4xl font-bold tabular-nums">
            {mm}:{ss}
          </span>
        </div>

        <button
          onClick={() => setRunning((r) => !r)}
          className="px-8 py-3 rounded-2xl border border-marble/40 bg-marble/25 text-slickstorm text-sm font-medium hover:bg-marble/30 transition active:scale-95"
        >
          {running ? "Pauzeer" : "Start"}
        </button>
      </div>
    </div>
  );
}