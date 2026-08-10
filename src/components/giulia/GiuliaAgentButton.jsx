import React from "react";
import { useGiuliaAgent } from "@/lib/GiuliaAgentContext";
import { Sparkles } from "lucide-react";

/**
 * GiuliaAgentButton — fixed floating trigger (bottom-left) that opens the
 * in-app platform agent conversation panel. Distinct from the existing
 * ChatWindow trigger (bottom-right).
 */
export default function GiuliaAgentButton() {
  const { openPanel } = useGiuliaAgent();
  return (
    <button
      onClick={openPanel}
      className="fixed left-5 bottom-24 lg:left-7 lg:bottom-28 z-30 h-12 w-12 lg:h-14 lg:w-14 rounded-full refraction-panel flex items-center justify-center transition-all duration-300 hover:scale-105"
      aria-label="Open Giulia agent"
    >
      <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-ivory" />
    </button>
  );
}