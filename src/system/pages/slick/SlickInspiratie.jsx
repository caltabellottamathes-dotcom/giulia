import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { PageShell, GlassButton } from "@/system/components/slick/glass";
import { IDEAS } from "@/lib/slick/ideas";

const TONES = [
  "bg-urgent/15 border-urgent/40 text-storm",
  "bg-sky/15 border-sky/40 text-storm",
  "bg-sand/15 border-sand/40 text-storm",
  "bg-marble/15 border-marble/40 text-storm",
  "bg-clay/15 border-clay/40 text-storm",
];

export default function InspiratieBord() {
  const [ideas, setIdeas] = useState(IDEAS);
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setIdeas((prev) => [{ id: Date.now(), text: text.trim(), tone: Math.floor(Math.random() * TONES.length) }, ...prev]);
    setText("");
  };
  const remove = (id) => setIdeas((prev) => prev.filter((x) => x.id !== id));

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Creatief</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Inspiratie Bord</h1>
        </div>
        <Link to="/slick"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Voeg een idee of gedachte toe..."
          className="flex-1 rounded-xl border border-marble/30 bg-marble/10 px-4 py-2.5 text-storm text-sm placeholder:text-marble/40 outline-none focus:border-urgent/40"
        />
        <button onClick={add} className="px-5 py-2.5 rounded-xl bg-urgent text-metal text-sm font-semibold flex items-center gap-1.5 hover:brightness-105 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Toevoegen
        </button>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        {ideas.map((it) => (
          <div key={it.id} className={`mb-4 break-inside-avoid rounded-2xl border p-4 ${TONES[it.tone]} relative group`}>
            <button onClick={() => remove(it.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-marble/60 hover:text-storm">
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-sm leading-relaxed pr-4">{it.text}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}