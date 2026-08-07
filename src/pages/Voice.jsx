import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import {
  Mic, Phone, PhoneOff, Sparkles, Calendar, Mail,
  CheckSquare, FileText, Bell,
} from "lucide-react";

export default function Voice() {
  const [callActive, setCallActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (callActive) {
      const timer = setInterval(() => setDuration((d) => d + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [callActive]);

  useEffect(() => {
    if (callActive && duration === 3) {
      setActions((prev) => [...prev, { icon: Calendar, text: "Agenda bijgewerkt — afspraak toegevoegd", time: "0:03" }]);
    }
    if (callActive && duration === 7) {
      setActions((prev) => [...prev, { icon: Mail, text: "Email opgesteld aan Sarah", time: "0:07" }]);
    }
    if (callActive && duration === 12) {
      setActions((prev) => [...prev, { icon: CheckSquare, text: "Taak aangemaakt — review concept", time: "0:12" }]);
    }
    if (callActive && duration === 18) {
      setActions((prev) => [...prev, { icon: Bell, text: "Herinnering ingesteld voor morgen", time: "0:18" }]);
    }
  }, [callActive, duration]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-up">
      <div className="mb-4">
        <h1 className="text-2xl font-heading font-light tracking-tight">Voice met Giulia</h1>
        <p className="text-sm text-muted-foreground mt-1">De stem van je assistent</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Voice interface */}
        <div className="relative overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0 editorial-bg"
            style={{ backgroundImage: `url(${IMAGES.portraitBootFace})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-charcoal/40" />

          <div className="relative h-full flex flex-col items-center justify-center p-8">
            {/* Animated orb */}
            <div className="relative mb-8">
              {callActive ? (
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-olive/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-olive/10 animate-pulse-soft" style={{ transform: "scale(1.3)" }} />
                  <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-olive/40 to-blue-grey/30 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-white/80" />
                  </div>
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-olive/30 to-blue-grey/20 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <Mic className="h-10 w-10 text-white/60" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-heading font-light text-white mb-2">
              {callActive ? "Giulia luistert" : "Bel Giulia"}
            </h2>
            <p className="text-sm text-white/60 mb-8">
              {callActive ? formatTime(duration) : "Intelligente begeleiding, stemgestuurd"}
            </p>

            {/* Call controls */}
            <div className="flex items-center gap-4">
              {!callActive ? (
                <button
                  onClick={() => { setCallActive(true); setDuration(0); setActions([]); }}
                  className="h-16 w-16 rounded-full bg-emerald-600/80 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Phone className="h-6 w-6 text-white" />
                </button>
              ) : (
                <button
                  onClick={() => setCallActive(false)}
                  className="h-16 w-16 rounded-full bg-red-500/80 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <PhoneOff className="h-6 w-6 text-white" />
                </button>
              )}
            </div>

            {/* Waveform visualization */}
            {callActive && (
              <div className="mt-8 flex items-center gap-1 h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-white/40 animate-pulse-soft"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live actions panel */}
        <GlassPanel level={3} className="p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-olive" />
            <h2 className="text-sm font-heading font-medium">Profiel: Focus en Geschiedenis</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            Della: Focus en Geschiedenis. Begrip van gebruikersbehoefte, historische context, en fijne inzichten.
          </p>

          <div className="flex gap-2 mb-6">
            <GlassButton variant="outline" size="pill">Contact Analyse</GlassButton>
            <GlassButton variant="outline" size="pill">Geschiedenis Overzicht</GlassButton>
          </div>

          <div className="border-t border-border/40 pt-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Context updates</h3>
            {actions.length === 0 && !callActive && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Start een gesprek om Giulia's acties live te zien
              </p>
            )}
            {actions.length === 0 && callActive && (
              <p className="text-sm text-muted-foreground text-center py-8 animate-pulse-soft">
                Giulia luistert...
              </p>
            )}
            <div className="space-y-3">
              {actions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 animate-fade-up">
                  <div className="h-8 w-8 rounded-lg glass-1 flex items-center justify-center shrink-0">
                    <action.icon className="h-4 w-4 text-olive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{action.text}</p>
                    <p className="text-[10px] text-muted-foreground">{action.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}