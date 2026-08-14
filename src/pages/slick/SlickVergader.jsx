import React from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync

const CHIPS = ["Wekelijkse afstemming Giulia", "Concept Brons review", "Briefing wervingscampagne"];
const AGENDA = ["Voortgang Marktanalyse Q3", "Briefing wervingscampagne", "Planning komende week"];
const ACTIES = ["Rapport uiterlijk vrijdag klaar — Marc", "Briefing sturen naar HR — Sara", "Identiteit planning delen — Giulia"];
const DEELNEMERS = ["Giulia Romano", "Marc Brons", "Sara Visser"];

export default function SlickVergader() {
  return (
    <div>
      <Head title="Vergader Notities" tag="Vergaderingen" />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {CHIPS.map((c, i) => (
          <button
            key={c}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
              i === 0 ? "border-marble/50 bg-marble/25 text-slickstorm" : "border-marble/30 bg-marble/10 text-marble/70 hover:bg-marble/20"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-5 max-w-2xl">
        <h2 className="text-slickstorm text-lg font-semibold">Wekelijkse afstemming Giulia</h2>
        <p className="text-marble/60 text-xs mt-0.5">2026-08-13 · 16:00 · Studio Giulia</p>

        <Block label="Deelnemers">
          <div className="flex flex-wrap gap-2">
            {DEELNEMERS.map((d) => (
              <span key={d} className="text-[11px] rounded-full border border-marble/25 bg-marble/5 text-marble/80 px-2.5 py-0.5">{d}</span>
            ))}
          </div>
        </Block>

        <Block label="Agenda">
          <ul className="space-y-1">
            {AGENDA.map((a, i) => (
              <li key={a} className="text-slickstorm/80 text-sm flex gap-2">
                <span className="text-marble/50 tabular-nums">{i + 1}.</span> {a}
              </li>
            ))}
          </ul>
        </Block>

        <Block label="Actiepunten">
          <ul className="space-y-1">
            {ACTIES.map((a) => (
              <li key={a} className="text-slickstorm/80 text-sm flex gap-2">
                <span className="text-clay">•</span> {a}
              </li>
            ))}
          </ul>
        </Block>

        <div className="mt-5 pt-4 border-t border-marble/15">
          <p className="text-marble/70 text-xs font-medium flex items-center gap-2 mb-2">
            <span className="tabular-nums">(1)</span> Notulen
          </p>
          <p className="text-slickstorm/80 text-sm leading-relaxed">
            Giulia is tevreden met conceptrichting. Wervingscampagne start na Q3 rapport. Volgende week focus op
            identiteit.
          </p>
        </div>
      </div>
    </div>
  );
}

function Block({ label, children }) {
  return (
    <div className="mt-5">
      <p className="text-marble/70 text-xs font-medium mb-2">{label}</p>
      {children}
    </div>
  );
}