import React from "react";
import { useGiuliaAgent } from "@/lib/GiuliaAgentContext";
import { Bot } from "lucide-react";

/**
 * GiuliaAgentButton — fixed floating trigger that opens the in-app platform
 * agent conversation panel. Sits above the bottom-right plus (menu) button.
 */
export default function GiuliaAgentButton() {
  const { openPanel } = useGiuliaAgent();
  return (
    <button
      onClick={openPanel}
      className="fixed right-5 bottom-20 lg:right-7 lg:bottom-28 z-30 h-12 w-12 lg:h-14 lg:w-14 rounded-full refraction-panel flex items-center justify-center transition-all duration-300 hover:scale-105"
      aria-label="Open Giulia agent"
    >
      <Bot className="h-5 w-5 lg:h-6 lg:w-6 text-ivory" />
    </button>
  );
}