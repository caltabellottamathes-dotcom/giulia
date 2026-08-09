import React from "react";
import WidgetShell from "./WidgetShell";
import WidgetHeader from "./WidgetHeader";
import ChatInterface from "@/components/chat/ChatInterface";
import { IMAGES } from "@/lib/images";
import { Sparkles } from "lucide-react";

const PILLS = ["Wat staat er vandaag?", "Openstaande taken?", "Check mijn email"];

/**
 * GiuliaWidget — the concierge anchor. Contains the live chat with Giulia
 * plus quick pill prompts. (The intro video lives in its own vertical widget.)
 */
export default function GiuliaWidget() {
  return (
    <WidgetShell size="2x2" radius="large" glass="opaque" className="min-h-[520px]">
      <div className="p-5 lg:p-6 flex flex-col h-full">
        <WidgetHeader icon={Sparkles} label="Giulia · je dag" />
        <div className="flex items-center gap-3 mb-4">
          <img src={IMAGES.giuliaConcierge} alt="Giulia" className="h-11 w-11 rounded-full object-cover border border-ivory/20 shrink-0" />
          <div>
            <p className="text-sm font-display font-semibold text-ivory leading-none">Praat met Giulia</p>
            <p className="text-[11px] text-ivory/55 mt-1.5">Je digitale assistent — vraag me anything</p>
          </div>
        </div>
        <div className="flex-1 min-h-0 rounded-2xl bg-card border border-charcoal/10 p-2.5">
          <ChatInterface threadId="widget-concierge" suggestions={PILLS} className="h-full" />
        </div>
      </div>
    </WidgetShell>
  );
}