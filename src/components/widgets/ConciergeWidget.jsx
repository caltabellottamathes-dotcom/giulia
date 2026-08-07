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
 * (portrait as backdrop with a dark overlay), not glass. Clear, prominent
 * buttons.
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
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />

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
            className="w-full rounded-2xl pl-5 pr-14 py-4 text-sm bg-ivory/12 border border-ivory/25 text-ivory placeholder:text-ivory/45 focus:outline-none focus:ring-2 focus:ring-olive/60 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-xl bg-olive text-ivory flex items-center justify-center hover:bg-olive/90 hover:scale-105 transition-all shadow-lg shadow-olive/30"
            aria-label="Verstuur"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => openModule("chat")}
              className="rounded-full px-4 py-2 text-[12px] font-medium bg-ivory/15 border border-ivory/30 text-ivory hover:bg-ivory/25 hover:border-ivory/50 transition-all max-w-full truncate"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Call button — clear, solid, prominent */}
        <button
          onClick={() => openModule("voice")}
          className="mt-auto w-full rounded-2xl py-4 flex items-center justify-center gap-3 bg-olive text-ivory hover:bg-olive/90 transition-all font-semibold text-[15px] shadow-lg shadow-olive/40"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ivory/50 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ivory" />
          </span>
          <Phone className="h-5 w-5" strokeWidth={2.5} />
          Bel Giulia meteen
        </button>
      </div>
    </div>
  );
}