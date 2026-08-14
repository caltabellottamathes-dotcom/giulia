import React, { useState } from "react";
import { Head } from "@/components/slick/slickParts";
// staging-sync
import { Plus } from "lucide-react";

const SEED = [
  "Glas-morphism agenda widget met live klok overlay",
  "Kleurgecodeerde projecten voor snelle herkenning",
  "Stilte-modus: verberg alles behalve de huidige taak",
  "Dagelijkse briefing als ochtendritueel",
  "Inspiratiebord als digitaal moodboard",
  "Tijdsregistratie gekoppeld aan facturatie",
  "Doelen koppelen aan wekelijkse gewoontes",
];

export default function SlickInspiratie() {
  const [items, setItems] = useState(SEED);
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    setItems([draft.trim(), ...items]);
    setDraft("");
  };
  return (
    <div>
      <Head title="Inspiratie Bord" tag="Creatief" />
      <div className="flex gap-2 mb-5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Nieuwe inspiratie…"
          className="flex-1 rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md px-3 py-2 text-slickstorm text-sm outline-none focus:border-marble/50 placeholder:text-marble/40"
        />
        <button onClick={add} className="px-4 py-2 rounded-xl border border-marble/40 bg-marble/25 text-slickstorm text-sm font-medium hover:bg-marble/30 transition flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Toevoegen
        </button>
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 [column-fill:_balance]">
        {items.map((it, i) => (
          <div
            key={i}
            className="mb-3 break-inside-avoid rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md p-4"
          >
            <p className="text-slickstorm/90 text-sm leading-relaxed">{it}</p>
          </div>
        ))}
      </div>
    </div>
  );
}