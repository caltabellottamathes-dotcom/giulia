import React from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import GlassButton from "@/components/glass/GlassButton";
import { IMAGES } from "@/lib/images";
import { Mail, Phone, Building2, Calendar, Sparkles, Edit3 } from "lucide-react";

export default function Profile() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-heading font-light tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Jouw account en voorkeuren</p>
      </div>

      {/* Profile header */}
      <GlassPanel level={3} className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-border/60 shrink-0">
            <img src={IMAGES.portraitThinking} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-heading font-medium">Giulia gebruiker</h2>
            <p className="text-sm text-muted-foreground mt-1">giulia@os.app</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Giulia OS</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Lid sinds aug 2026</span>
            </div>
          </div>
          <GlassButton variant="outline" size="sm"><Edit3 className="h-4 w-4" /> Bewerk profiel</GlassButton>
        </div>
      </GlassPanel>

      {/* Profile details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel level={2} className="p-6">
          <h3 className="text-sm font-heading font-medium mb-4">Account informatie</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Naam</span>
              <span className="text-sm">Giulia gebruiker</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">giulia@os.app</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Rol</span>
              <span className="text-sm">Admin</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Tijdzone</span>
              <span className="text-sm">UTC</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel level={2} className="p-6">
          <h3 className="text-sm font-heading font-medium mb-4">Voorkeuren</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Taal</span>
              <span className="text-sm">Nederlands</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Thema</span>
              <span className="text-sm">Light</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-sm text-muted-foreground">Proactiviteit</span>
              <span className="text-sm">Gebalanceerd</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Stem</span>
              <span className="text-sm">River</span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Giulia stats */}
      <GlassPanel level={3} className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-olive" />
          <h3 className="text-sm font-heading font-medium">Giulia statistieken</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-heading font-light">42</p>
            <p className="text-xs text-muted-foreground mt-1">Acties uitgevoerd</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading font-light">7</p>
            <p className="text-xs text-muted-foreground mt-1">Herinneringen</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading font-light">12</p>
            <p className="text-xs text-muted-foreground mt-1">Emails voorbereid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading font-light">3</p>
            <p className="text-xs text-muted-foreground mt-1">Conflicten opgelost</p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}