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
 * ConciergeWidget — Giulia, the visual anchor. A real glass card (frosted,
 * translucent over the editorial photo) with the portrait as an opaque inset
 * and a lighter olive accent. Direct capture + call.
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
      className="relative rounded-[28px] overflow-hidden min-h-[340px] h-full glass-card float-shadow animate-fade-up flex flex-col sm:flex-row z-10"
    >
      {/* Content — frosted glass over the photo */}
      <div className="relative flex-1 p-6 lg:p-7 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/55 font-semibold">
            Giulia · Assistent
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-foreground/55">
            <span className="h-1.5 w-1.5 rounded-full bg-olive/70 animate-pulse-soft" />
            Actief
          </div>
        </div>

        <h2 className="font-display text-[22px] sm:text-[26px] leading-[1.05] tracking-[-0.02em] font-semibold text-foreground mb-3 text-balance">
          Je dag staat klaar.
        </h2>
        <p className="text-[13px] leading-relaxed text-foreground/65 mb-5 max-w-md">
          Vraag me anything, of bel me meteen. Ik beheer je agenda, taken en mail — altijd met jouw goedkeuring.
        </p>

        <form onSubmit={handleSubmit} className="relative mb-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Vraag Giulia anything..."
            className="w-full rounded-2xl pl-5 pr-12 py-3.5 text-sm glass-1 border border-foreground/10 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-olive/40 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-charcoal text-ivory flex items-center justify-center hover:scale-105 transition-transform"
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
              className="rounded-full px-3.5 py-2 text-[12px] glass-1 border border-foreground/10 text-foreground/75 hover:text-foreground hover:scale-[1.02] transition-all max-w-full truncate"
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => openModule("voice")}
          className="mt-auto w-full rounded-2xl py-3.5 flex items-center justify-center gap-2.5 bg-olive/15 border border-olive/30 text-olive hover:bg-olive/20 transition-all font-semibold text-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-olive/50 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-olive" />
          </span>
          <Phone className="h-4 w-4" />
          Bel Giulia meteen
        </button>
      </div>

      {/* Portrait — opaque inset, blends into the glass */}
      <div className="relative sm:w-[42%] min-h-[180px] sm:min-h-0 overflow-hidden">
        <img
          src={IMAGES.giuliaConcierge}
          alt="Giulia"
          className="absolute inset-0 w-full h-full object-cover object-center"
          draggable={false}
        />
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[hsl(52_18%_85%/0.55)] to-transparent hidden sm:block pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[hsl(52_18%_85%/0.55)] to-transparent sm:hidden pointer-events-none" />
      </div>
    </div>
  );
}