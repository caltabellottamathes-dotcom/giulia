import React, { useState } from "react";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { ArrowUp, Phone } from "lucide-react";

const suggestions = [
  "Wat staat er vandaag op de agenda?",
  "Samenvatting van Sarah's laatste email",
  "Plan een belmoment met Thomas",
  "Herinner me aan de shoot om 14:00",
];

/**
 * GiuliaWidget — the visual anchor (formerly "concierge").
 * Solid Metal panel + the Giulia portrait as an opaque, integrated element.
 * Transparent sage-green accent drawn from the portrait. Direct call button.
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
      className="relative rounded-[32px] overflow-hidden min-h-[372px] h-full float-shadow animate-fade-up flex flex-col md:flex-row z-10"
    >
      {/* ── Content panel — solid Metal charcoal ── */}
      <div className="relative flex-1 md:flex-[1.15] bg-[#2D2D23] text-[#F2F2F0] p-6 lg:p-8 flex flex-col">
        {/* Wordmark + status */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#F2F2F0]/55 font-semibold">
            Giulia · Assistent
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#F2F2F0]/55">
            <span className="h-1.5 w-1.5 rounded-full bg-sage/60 animate-pulse-soft" />
            Actief
          </div>
        </div>

        {/* Title */}
        <h2 className="font-display text-[28px] lg:text-[34px] leading-[1.02] tracking-[-0.02em] font-semibold text-[#F2F2F0] mb-4 text-balance">
          Je dag staat klaar.
        </h2>
        <p className="text-[13px] leading-relaxed text-[#F2F2F0]/70 mb-5 max-w-md">
          Ik heb <span className="text-[#F2F2F0] font-medium">2 email drafts</span> en{" "}
          <span className="text-[#F2F2F0] font-medium">1 agendawijziging</span> voorbereid.
          Vraag me anything, of bel me meteen.
        </p>

        {/* Quick capture input */}
        <form onSubmit={handleSubmit} className="relative mb-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Vraag Giulia anything..."
            className="w-full rounded-2xl pl-5 pr-12 py-3.5 text-sm bg-[#F2F2F0]/8 border border-[#F2F2F0]/15 text-[#F2F2F0] placeholder:text-[#F2F2F0]/40 focus:outline-none focus:ring-1 focus:ring-[#F2F2F0]/30 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-[#F2F2F0] text-[#2D2D23] flex items-center justify-center hover:scale-105 transition-transform"
            aria-label="Verstuur"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>

        {/* Pill suggestions */}
        <div className="flex flex-wrap gap-2 mb-5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => openModule("chat")}
              className="rounded-full px-3.5 py-2 text-[12px] bg-[#F2F2F0]/8 border border-[#F2F2F0]/12 text-[#F2F2F0]/80 hover:bg-[#F2F2F0]/15 hover:text-[#F2F2F0] hover:scale-[1.02] transition-all max-w-full truncate"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Call Giulia — immediately, from the dashboard */}
        <button
          onClick={() => openModule("voice")}
          className="mt-auto w-full rounded-2xl py-3.5 flex items-center justify-center gap-2.5 bg-sage/15 border border-sage/35 text-sage hover:bg-sage/25 transition-all font-medium text-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-sage/60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
          </span>
          <Phone className="h-4 w-4" />
          Bel Giulia meteen
        </button>
      </div>

      {/* ── Portrait — fully opaque, integrated design element ── */}
      <div className="relative md:flex-[0.85] min-h-[170px] md:min-h-0 overflow-hidden">
        <img
          src={IMAGES.giuliaConcierge}
          alt="Giulia"
          className="absolute inset-0 w-full h-full object-cover object-center"
          draggable={false}
        />
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#2D2D23] to-transparent hidden md:block pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#2D2D23] to-transparent md:hidden pointer-events-none" />
      </div>
    </div>
  );
}