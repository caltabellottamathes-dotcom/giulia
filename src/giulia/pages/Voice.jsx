import React, { useMemo, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { useNavigate } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/lib/images";
import PageHero from "@/system/components/glass/PageHero";
import { ELEVEN_AGENT_ID, NAV_PAGES, NAV_PANELS } from "@/lib/voiceNavigation";
import { Mic, Phone, PhoneOff, Volume2 } from "lucide-react";

/**
 * Voice — een echt stemgesprek met de ElevenLabs voice agent (inline).
 * De agent kan proactief door het systeem navigeren via client-tools:
 *  - navigate_to_page   → router-navigatie
 *  - scroll_to_section  → scroll naar een element-id
 *  - open_panel         → open een module-paneel
 *  - highlight_element   → tijdelijke markering van een element
 */
export default function Voice() {
  const navigate = useNavigate();
  const { openModule } = usePanel();
  const endRef = useRef(null);

  const clientTools = useMemo(
    () => ({
      navigate_to_page: async ({ page }) => {
        if (!page || !NAV_PAGES[page]) {
          return { success: false, reason: "unknown_page", available: Object.keys(NAV_PAGES) };
        }
        navigate(page);
        return { success: true, page };
      },
      scroll_to_section: async ({ sectionId }) => {
        const el = document.getElementById(sectionId);
        if (!el) return { success: false, reason: "unknown_section" };
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return { success: true, sectionId };
      },
      open_panel: async ({ panelId }) => {
        if (!panelId || !NAV_PANELS[panelId]) {
          return { success: false, reason: "unknown_panel", available: Object.keys(NAV_PANELS) };
        }
        openModule(panelId);
        return { success: true, panelId };
      },
      highlight_element: async ({ elementId, durationMs = 2500 }) => {
        const el = document.getElementById(elementId);
        if (!el) return { success: false, reason: "unknown_element" };
        el.classList.add("voice-highlight");
        setTimeout(() => el.classList.remove("voice-highlight"), durationMs);
        return { success: true, elementId };
      },
    }),
    [navigate, openModule]
  );

  const { startSession, endSession, status, isSpeaking, messages } = useConversation({
    agentId: ELEVEN_AGENT_ID,
  });
  const connected = status === "connected";
  const connecting = status === "connecting";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggle = async () => {
    if (connected) {
      try { await endSession(); } catch {}
    } else {
      try { await startSession({ clientTools }); } catch {}
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col animate-fade-up">
      <PageHero
        page="voice"
        icon={Mic}
        eyebrow="GIULIA · VOICE"
        title="Bellen met Giulia"
        subtitle="Echt gesprek met de ElevenLabs voice agent — inclusief proactieve navigatie door je systeem"
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Voice stage */}
        <div className="relative overflow-hidden rounded-[24px] min-h-[360px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGES.giuliaConcierge})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-charcoal/40" />

          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
              {connected ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-olive/20 animate-ping" />
                  <div className="relative h-28 w-28 rounded-full bg-olive/20 backdrop-blur-xl border border-white/25 flex items-center justify-center">
                    <span className={cn("h-3 w-3 rounded-full bg-white/80", isSpeaking ? "animate-pulse-soft" : "")} />
                  </div>
                </div>
              ) : (
                <div className="h-28 w-28 rounded-full bg-olive/15 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <Mic className="h-10 w-10 text-white/70" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-display font-semibold text-white mb-1">
              {connected ? (isSpeaking ? "Giulia spreekt" : "Giulia luistert") : "Bel Giulia"}
            </h2>
            <p className="text-sm text-white/60 mb-6">
              {connecting
                ? "Verbinden…"
                : connected
                ? "Live gesprek — spreek vrijuit, Giulia kan voor je navigeren"
                : "Start een gesprek; Giulia opent en markeert schermen voor je"}
            </p>

            <button
              onClick={toggle}
              className={cn(
                "h-16 w-16 rounded-full backdrop-blur-xl border border-white/25 flex items-center justify-center hover:scale-105 transition-transform",
                connected ? "bg-red-500/80" : "bg-olive/80"
              )}
            >
              {connected ? <PhoneOff className="h-6 w-6 text-white" /> : <Phone className="h-6 w-6 text-white" />}
            </button>

            {connected && (
              <div className="mt-6 flex items-center gap-1 h-8">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-white/40 animate-pulse-soft"
                    style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live transcript */}
        <div className="glass-card rounded-[24px] p-6 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="h-4 w-4 text-olive" />
            <h2 className="text-sm font-display font-semibold">Gesprek</h2>
          </div>

          {(!messages || messages.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              {connected ? "Zeg iets om te beginnen…" : "Start een gesprek om Giulia's antwoorden live te zien"}
            </p>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {messages.map((m, i) => {
                const text = String(m.message || m.content || m.text || "");
                const isUser = m.role === "user";
                return (
                  <div key={i} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                        isUser ? "bg-charcoal text-ivory rounded-br-md" : "glass-1 rounded-bl-md"
                      )}
                    >
                      {text}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}