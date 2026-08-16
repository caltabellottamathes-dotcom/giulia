import React from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import { Mic } from "lucide-react";

const AGENT_ID = "agent_5501kza2zx7hehxbh0ydey1mq5gv";

/**
 * VoiceAgentWidget — dashboard-tegel voor de ElevenLabs Conversational AI
 * voice agent. Het <elevenlabs-convai> custom element wordt door de embed-
 * script (in index.html) geüpgraded tot een werkende voice-widget.
 */
export default function VoiceAgentWidget() {
  return (
    <WidgetShell size="1x1" radius="medium" className="min-h-[176px]">
      <div className="relative h-full p-4 flex flex-col text-ivory">
        <div className="flex items-center gap-2 mb-2">
          <Mic className="h-3.5 w-3.5 text-ivory/70" />
          <h3 className="text-[10px] uppercase tracking-[0.28em] font-bold opacity-60">Voice agent</h3>
        </div>
        <p className="text-xs text-ivory/60 leading-relaxed mb-2">
          Praat met Giulia. Tik de microfoon om een gesprek te starten.
        </p>
        <div className="flex-1 flex items-center justify-center min-h-[64px]">
          {/* eslint-disable-next-line */}
          <elevenlabs-convai agent-id={AGENT_ID}></elevenlabs-convai>
        </div>
      </div>
    </WidgetShell>
  );
}