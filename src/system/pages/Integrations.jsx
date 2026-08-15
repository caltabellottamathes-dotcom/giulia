import React from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/system/components/glass/GlassPanel";
import GlassButton from "@/system/components/glass/GlassButton";
import StatusBadge from "@/system/components/glass/StatusBadge";
import PageHero from "@/system/components/glass/PageHero";
import {
  Mail, MessageCircle, Calendar, HardDrive, Mic,
  Brain, Cloud, Box, Database, Sparkles, Plug,
} from "lucide-react";

const integrationGroups = [
  {
    label: "Communication",
    items: [
      { name: "Email", icon: Mail, connected: true, status: "Gesynchroniseerd", lastSync: "2 min geleden" },
      { name: "WhatsApp", icon: MessageCircle, connected: true, status: "Gesynchroniseerd", lastSync: "5 min geleden" },
      { name: "Voice", icon: Mic, connected: false, status: "Niet verbonden" },
    ],
  },
  {
    label: "Calendar",
    items: [
      { name: "Google Calendar", icon: Calendar, connected: true, status: "Gesynchroniseerd", lastSync: "1 min geleden" },
      { name: "Outlook", icon: Calendar, connected: false, status: "Niet verbonden" },
    ],
  },
  {
    label: "Files",
    items: [
      { name: "Google Drive", icon: Cloud, connected: false, status: "Niet verbonden" },
      { name: "Dropbox", icon: Box, connected: false, status: "Niet verbonden" },
      { name: "OneDrive", icon: HardDrive, connected: false, status: "Niet verbonden" },
    ],
  },
  {
    label: "AI",
    items: [
      { name: "LLM Provider", icon: Brain, connected: true, status: "Actief", lastSync: "Live" },
      { name: "Voice Provider", icon: Mic, connected: true, status: "Actief", lastSync: "Live" },
      { name: "Speech-to-Text", icon: Database, connected: true, status: "Actief", lastSync: "Live" },
      { name: "Text-to-Speech", icon: Sparkles, connected: true, status: "Actief", lastSync: "Live" },
    ],
  },
];

export default function Integrations() {
  return (
    <div className="space-y-6 animate-fade-up">
      <PageHero
        page="integrations"
        icon={Plug}
        eyebrow="Systeem"
        title="Integrations"
        subtitle="Verbonden services en synchronisatie"
      />

      {integrationGroups.map((group) => (
        <div key={group.label} className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{group.label}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map((item) => (
              <GlassPanel key={item.name} level={2} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl glass-1 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <StatusBadge variant={item.connected ? "completed" : "muted"}>
                    {item.connected ? "Verbonden" : "Niet verbonden"}
                  </StatusBadge>
                </div>
                <p className="text-sm font-heading font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.status}</p>
                {item.lastSync && (
                  <p className="text-[10px] text-muted-foreground mt-2">Laatste sync: {item.lastSync}</p>
                )}
                <div className="mt-4 pt-4 border-t border-border/40">
                  {item.connected ? (
                    <div className="flex gap-2">
                      <GlassButton variant="outline" size="sm" className="flex-1">Instellingen</GlassButton>
                      <GlassButton variant="ghost" size="sm">Verbinding verbreken</GlassButton>
                    </div>
                  ) : (
                    <GlassButton variant="primary" size="sm" className="w-full">
                      <Plug className="h-3.5 w-3.5" /> Verbinden
                    </GlassButton>
                  )}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}