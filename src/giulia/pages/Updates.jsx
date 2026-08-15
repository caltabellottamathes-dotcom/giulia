import React from "react";
import PageHero from "@/system/components/glass/PageHero";
import SocialFeed from "@/life/components/SocialFeed";
import { Sparkles } from "lucide-react";

/**
 * Updates — "Achter de schermen" / "Wat er nieuw is" as its own space, off
 * the home dashboard. Placeholder for Salvo's future concept; for now it
 * just hosts the SocialFeed of completed actions.
 */
export default function Updates() {
  return (
    <div className="space-y-5 animate-fade-up">
      <PageHero page="updates" icon={Sparkles} eyebrow="Giulia" title="Wat er nieuw is" subtitle="Achter de schermen — recent afgeronde acties" />
      <SocialFeed />
    </div>
  );
}