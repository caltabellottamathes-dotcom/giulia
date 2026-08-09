import React from "react";
import { usePanel } from "@/lib/PanelContext";
import { MessageCircle } from "lucide-react";

/**
 * OpenChatButton — dedicated fixed bottom-right button to open the Giulia
 * chat window directly (separate from the QuickAction "+" menu below it).
 */
export default function OpenChatButton() {
  const { openChat } = usePanel();
  return (
    <button
      onClick={openChat}
      className="fixed bottom-24 right-5 lg:bottom-28 lg:right-7 z-30 h-12 w-12 lg:h-14 lg:w-14 rounded-full refraction-panel flex items-center justify-center transition-all duration-300 hover:scale-105"
      aria-label="Open chat met Giulia"
    >
      <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6 text-foreground" />
    </button>
  );
}