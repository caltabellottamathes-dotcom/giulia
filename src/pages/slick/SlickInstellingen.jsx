import React, { useState } from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const PREFS = [
  { key: "push", label: "Push notificaties", desc: "Herinneringen voor afspraken en deadlines", on: true },
  { key: "weekly", label: "Wekelijkse e-mail", desc: "Overzicht van je week elke zondag", on: true },
  { key: "sound", label: "Geluidssignalen", desc: "Piepje bij voltooide taak", on: false },
  { key: "compact", label: "Compacte weergave", desc: "Minder ruimte tussen elementen", on: false },
  { key: "autosave", label: "Automatisch opslaan", desc: "Notities direct bewaren", on: true },
  { key: "dark", label: "Donker thema", desc: "Donkere glas-stijl als standaard", on: true },
];

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} className={`h-5 w-9 rounded-full transition-colors relative shrink-0 ${on ? "bg-olive" : "bg-marble/25"}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-marble transition-all ${on ? "left-4" : "left-0.5"}`} />
    </button>
  );
}

export default function SlickInstellingen() {
  const [prefs, setPrefs] = useState(Object.fromEntries(PREFS.map((p) => [p.key, p.on])));
  const toggle = (k) => setPrefs((s) => ({ ...s, [k]: !s[k] }));
  return (
    <div>
      <Head title="Instellingen" tag="Account" />
      <div className="space-y-6 max-w-2xl">
        <section>
          <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-3">
            <span className="tabular-nums">(1)</span> Profiel
          </p>
          <div className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4 flex items-center gap-4">
            <span className="h-12 w-12 rounded-2xl bg-marble/20 text-slickstorm text-sm font-bold flex items-center justify-center">GR</span>
            <div>
              <p className="text-slickstorm text-sm font-semibold">Giulia Romano</p>
              <p className="text-marble/60 text-xs">Beheerder</p>
            </div>
            <div className="ml-auto text-right text-marble/60 text-xs space-y-1">
              <p>Naam</p>
              <p>E-mail</p>
            </div>
          </div>
        </section>

        <section>
          <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-3">
            <span className="tabular-nums">(2)</span> Voorkeuren
          </p>
          <div className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md divide-y divide-marble/15">
            {PREFS.map((p) => (
              <div key={p.key} className="flex items-center gap-4 p-4">
                <div className="min-w-0">
                  <p className="text-slickstorm text-sm font-medium">{p.label}</p>
                  <p className="text-marble/60 text-xs">{p.desc}</p>
                </div>
                <div className="ml-auto">
                  <Toggle on={prefs[p.key]} onClick={() => toggle(p.key)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 rounded-xl border border-marble/30 bg-marble/10 text-marble/70 text-sm hover:bg-marble/20 transition">Annuleren</button>
          <button className="px-4 py-2 rounded-xl bg-marble/25 border border-marble/40 text-slickstorm text-sm font-medium hover:bg-marble/30 transition">Opslaan</button>
        </div>
      </div>
    </div>
  );
}