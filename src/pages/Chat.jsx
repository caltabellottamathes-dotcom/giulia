import React from "react";
import GlassPanel from "@/components/glass/GlassPanel";
import ChatInterface from "@/components/chat/ChatInterface";
import { IMAGES } from "@/lib/images";

const SUGGESTIONS = [
  "Wat staat er vandaag op de agenda?",
  "Welke taken staan open?",
  "Check mijn email",
  "Bereid een email voor aan Sarah",
];

/**
 * Chat — full-screen conversation with Giulia. All traffic flows through the
 * chatWithGiulia backend function; messages persist to the Message entity.
 */
export default function Chat() {
  return (
    <div className="h-[calc(100dvh-8.5rem)] flex flex-col animate-fade-up">
      <div className="mb-4 flex items-center gap-3">
        <img src={IMAGES.giuliaConcierge} alt="Giulia" className="h-11 w-11 rounded-full object-cover border border-border/40" />
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight leading-none">Chat met Giulia</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Je persoonlijke assistent, altijd klaar</p>
        </div>
      </div>
      <GlassPanel level={2} className="flex-1 flex flex-col min-h-0 p-4 lg:p-5">
        <ChatInterface threadId="in-app-main" suggestions={SUGGESTIONS} className="flex-1 min-h-0" />
      </GlassPanel>
    </div>
  );
}