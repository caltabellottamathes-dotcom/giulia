import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { Sparkles, ArrowUp, Plus, Globe, Mic, Search } from "lucide-react";

const suggestions = [
  "Wat staat er vandaag op de agenda?",
  "Samenvatting van Sarah's laatste email",
  "Plan een belmoment met Thomas",
  "Herinner me aan de shoot om 14:00",
];

const quickIcons = [Plus, Globe, Mic, Search];

/**
 * ConciergeWidget — the visual anchor. Larger, more depth,
 * Giulia portrait as a background fragment, quick-capture input +
 * pill-button suggestions. Opens Chat module on submit.
 */
export default function ConciergeWidget() {
  const { openModule } = usePanel();
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    openModule("chat");
  };

  return (
    <WidgetShell
      size="2x2"
      radius="xl"
      className="glass-3 float-shadow"
      style={{ animationDelay: "0ms" }}
    >
      {/* Giulia portrait as background fragment — visible through glass */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={IMAGES.giuliaConcierge}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0.42, filter: "saturate(0.85) contrast(1.02)" }}
        />
        {/* Warm wash so text stays legible */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F2F2F0]/35 via-[#F2F2F0]/15 to-[#2D2D23]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F2F2F0]/40 via-transparent to-transparent" />
      </div>

      <div className="relative p-6 lg:p-8 flex flex-col h-full">
        {/* Brand mark */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#2D2D23] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[#F2F2F0]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#2D2D23]/55">
                Giulia
              </p>
              <p className="text-sm font-medium text-[#2D2D23]">Concierge</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#2D2D23]/55">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600/80 animate-pulse-soft" />
            Actief
          </div>
        </div>

        {/* Recent interaction summary */}
        <p className="text-[13px] leading-relaxed text-[#2D2D23]/75 mb-5 max-w-md">
          Ik heb <span className="font-medium text-[#2D2D23]">2 email drafts</span> en{" "}
          <span className="font-medium text-[#2D2D23]">1 agendawijziging</span> voorbereid.
          Vraag me anything, of kies een suggestie.
        </p>

        {/* Quick capture input */}
        <form onSubmit={handleSubmit} className="relative mb-4">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Vraag Giulia anything..."
            className="w-full glass-1 rounded-2xl pl-5 pr-12 py-3.5 text-sm text-[#2D2D23] placeholder:text-[#2D2D23]/40 focus:outline-none focus:ring-1 focus:ring-[#2D2D23]/20 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-[#2D2D23] text-[#F2F2F0] flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>

        {/* Pill suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => openModule("chat")}
              className="glass-1 rounded-full px-3.5 py-2 text-[12px] text-[#2D2D23]/80 hover:text-[#2D2D23] hover:scale-[1.02] transition-all max-w-full truncate"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Quick action icons — like the reference */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#868564]/20">
          <div className="flex items-center gap-2">
            {quickIcons.map((Icon, i) => (
              <button
                key={i}
                onClick={() => openModule(i === 2 ? "voice" : "chat")}
                className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-[#2D2D23]/70 hover:text-[#2D2D23] hover:scale-105 transition-all"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#2D2D23]/40">
            Altijd voor je klaar
          </span>
        </div>
      </div>
    </WidgetShell>
  );
}