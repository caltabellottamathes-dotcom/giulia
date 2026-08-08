import React, { useState } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import {
  Settings as SettingsIcon, Palette, Bell, Brain, Lock, Mic,
  Database, Zap, Plug,
} from "lucide-react";
import PushToggle from "@/components/push/PushToggle";

const sections = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI behavior", icon: Brain },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "memory", label: "Memory", icon: Database },
  { id: "automation", label: "Automation", icon: Zap },
  { id: "integrations", label: "Integrations", icon: Plug },
];

export default function Settings() {
  const [active, setActive] = useState("general");

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-heading font-light tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configureer jouw Giulia ervaring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all",
                active === s.id
                  ? "glass-1 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
              )}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <GlassPanel level={2} className="p-6 lg:p-8">
            {active === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">General</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Taal</label>
                    <select className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                      <option>Nederlands</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tijdzone</label>
                    <select className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                      <option>UTC</option>
                      <option>Europe/Amsterdam</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {active === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">Appearance</h2>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Thema</label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {["Light", "Smoked", "Dark"].map((theme, i) => (
                      <button
                        key={theme}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-sm",
                          i === 0 ? "border-olive bg-olive/5" : "border-border/60 glass-1 hover:border-foreground/20"
                        )}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Glass intensiteit</label>
                  <input type="range" min="0" max="100" defaultValue="60" className="w-full mt-2" />
                </div>
              </div>
            )}

            {active === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">Notifications</h2>
                <div className="glass-1 rounded-xl p-4">
                  <p className="text-sm font-medium mb-1">Pushmeldingen</p>
                  <p className="text-xs text-muted-foreground mb-3">Ontvang meldingen op dit apparaat wanneer Giulia iets te melden heeft.</p>
                  <PushToggle />
                </div>
                <div className="space-y-3">
                  {["Email notificaties", "WhatsApp notificaties", "Agenda herinneringen", "Giulia suggesties", "Goedkeuring verzoeken"].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 glass-1 rounded-xl">
                      <span className="text-sm">{item}</span>
                      <button className="h-6 w-11 rounded-full bg-olive/30 relative transition-colors">
                        <span className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-white shadow" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === "ai" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">AI behavior</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Proactiviteit niveau</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {["Subtiel", "Gebalanceerd", "Actief"].map((level, i) => (
                        <button key={level} className={cn("p-3 rounded-xl text-sm transition-all", i === 1 ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="glass-1 rounded-xl p-4">
                    <p className="text-sm font-medium mb-2">Automatisch goedkeuren</p>
                    <p className="text-xs text-muted-foreground mb-3">Giulia mag deze acties zonder goedkeuring uitvoeren:</p>
                    <div className="space-y-2">
                      {["Informatie structureren", "Interne taak voorstellen", "Samenvatting maken", "Kennis organiseren"].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" /> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">Privacy</h2>
                <div className="glass-1 rounded-xl p-4 space-y-3">
                  <p className="text-sm">Uw gegevens zijn beveiligd</p>
                  <p className="text-xs text-muted-foreground">Giulia beschermt uw privacy. Alle data blijft lokaal en versleuteld.</p>
                </div>
              </div>
            )}

            {active === "voice" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">Voice</h2>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stem</label>
                  <select className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    <option>River — kalm, neutraal</option>
                    <option>Honey — warm, zacht</option>
                    <option>Sunny — helder, opgewekt</option>
                  </select>
                </div>
              </div>
            )}

            {["memory", "automation", "integrations"].includes(active) && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium capitalize">{active}</h2>
                <p className="text-sm text-muted-foreground">Configuratie opties voor {active} — binnenkort beschikbaar.</p>
              </div>
            )}

            <div className="pt-6 border-t border-border/40 mt-6">
              <GlassButton variant="primary" size="md">Wijzigingen opslaan</GlassButton>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}