import React, { useState } from "react";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { IMAGES } from "@/lib/images";
import { ArrowUp, Plus, Globe, Mic, Search } from "lucide-react";

const suggestions = [
  "Wat staat er vandaag op de agenda?",
  "Samenvatting van Sarah's laatste email",
  "Plan een belmoment met Thomas",
  "Herinner me aan de shoot om 14:00",
];

const quickIcons = [Plus, Globe, Mic, Search];

/**
 * ConciergeWidget — the visual anchor. Image-led with a warm sienna grade,
 * graphic display type, quick-capture + pill suggestions. No AI-star iconography.
 */
export default function ConciergeWidget() {
  const { openModule } = usePanel();
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    openModule("chat");
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

  return (
    <WidgetShell
      size="2x2"
      radius="xl"
      depth={3}
      className="glass-3"
      style={{ animationDelay: "0ms" }}
    >
      {/* Giulia portrait — bold editorial fragment with warm grade */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={IMAGES.giuliaConcierge}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center animate-ambient"
          style={{ filter: "saturate(1.08) contrast(1.06)" }}
        />
        {/* sienna warm grade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(125deg, hsl(var(--sienna) / 0.5) 0%, hsl(var(--sienna) / 0.2) 34%, hsl(var(--ink) / 0.42) 78%, hsl(var(--ink) / 0.62) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/10" />
      </div>

      <div className="relative z-10 p-6 lg:p-7 flex flex-col h-full text-ivory">
        {/* Brand mark — typographic, no star */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center font-display text-xl font-medium text-ivory">
              G
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/60">Giulia</p>
              <p className="text-sm font-medium">Concierge</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-ivory/65">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            Actief
          </div>
        </div>

        {/* Graphic display headline */}
        <div className="mb-5">
          <h2 className="font-display font-light text-[38px] lg:text-[48px] leading-[0.9] tracking-tight">
            {greeting}.
          </h2>
          <p className="text-[13px] leading-relaxed text-ivory/80 mt-3 max-w-md">
            <span className="font-medium text-ivory">2 email drafts</span> en{" "}
            <span className="font-medium text-ivory">1 agendawijziging</span> voorbereid.
          </p>
        </div>

        {/* Quick capture */}
        <form onSubmit={handleSubmit} className="relative mb-4">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Vraag Giulia anything..."
            className="w-full glass-1 rounded-2xl pl-5 pr-12 py-3.5 text-sm text-ivory placeholder:text-ivory/45 focus:outline-none focus:ring-1 focus:ring-ivory/30 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-ivory text-ink flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => openModule("chat")}
              className="glass-1 rounded-full px-3.5 py-2 text-[12px] text-ivory/85 hover:text-ivory hover:scale-[1.03] transition-all max-w-full truncate"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Quick action row */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-ivory/15">
          <div className="flex items-center gap-2">
            {quickIcons.map((Icon, i) => (
              <button
                key={i}
                onClick={() => openModule(i === 2 ? "voice" : "chat")}
                className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-ivory/75 hover:text-ivory hover:scale-105 transition-all"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/45">
            Altijd voor je klaar
          </span>
        </div>
      </div>
    </WidgetShell>
  );
}