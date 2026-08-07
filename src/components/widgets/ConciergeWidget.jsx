import React, { useState } from "react";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { ArrowUp, Phone } from "lucide-react";

const suggestions = [
  "Wat staat er vandaag op de agenda?",
  "Samenvatting van mijn laatste emails",
  "Plan een belmoment met Thomas",
  "Herinner me aan de shoot om 14:00",
];

/**
 * ConciergeWidget — Giulia, the visual anchor. A SOLID editorial card
 * (portrait as backdrop with a dark overlay), not glass — the original
 * treatment from before the assistant was meant to be glass.
 */
export default function ConciergeWidget() {
  const { openModule } = usePanel();
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    openModule("chat");
  };

  return (
    <div
      style={{ animationDelay: "0ms" }}
      className="relative rounded-[28px] overflow-hidden min-h-[340px] h-full float-shadow animate-fade-up flex z-10"
    >
      {/* Portrait backdrop — solid editorial, not glass */}
      <img
        src={IMAGES.giuliaConcierge}
        alt="Giulia"
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/93 via-charcoal/74 to-charcoal/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative p-6 lg:p-7 flex flex-col w-full text-ivory">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">
            Giulia · Assistent
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-ivory/65">
            <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft" />
            Actief
          </div>
        </div>

        <h2 className="font-display text-[22px] sm:text-[26px] leading-[1.05] tracking-[-0.02em] font-semibold text-ivory mb-3 text-balance">
          Je dag staat klaar.
        </h2>
        <p className="text-[13px] leading-relaxed text-ivory/70 mb-5 max-w-md">
          Vraag me anything, of bel me meteen. Ik beheer je agenda, taken en mail — altijd met jouw goedkeuring.
        </p>

        <form onSubmit={handleSubmit} className="relative mb-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Vraag Giulia anything..."
            className="w-full rounded-2xl pl-5 pr-12 py-3.5 text-sm bg-ivory/10 border border-ivory/20 text-ivory placeholder:text-ivory/45 focus:outline-none focus:ring-1 focus:ring-olive/50 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-ivory text-charcoal flex items-center justify-center hover:scale-105 transition-transform"
            aria-label="Verstuur"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => openModule("chat")}
              className="rounded-full px-3.5 py-2 text-[12px] bg-ivory/10 border border-ivory/15 text-ivory/80 hover:bg-ivory/15 hover:text-ivory transition-all max-w-full truncate"
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => openModule("voice")}
          className="mt-auto w-full rounded-2xl py-3.5 flex items-center justify-center gap-2.5 bg-olive/25 border border-olive/50 text-ivory hover:bg-olive/35 transition-all font-semibold text-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-olive/60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-olive" />
          </span>
          <Phone className="h-4 w-4" />
          Bel Giulia meteen
        </button>
      </div>
    </div>
  );
}