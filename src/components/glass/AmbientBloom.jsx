import React from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useGiuliaVoice } from "@/lib/GiuliaVoiceContext";

/**
 * AmbientBloom — a small glowing OKLCH-blue circle floating in the bottom-left
 * corner. Press and hold to talk to Giulia; release to send. State pulses are
 * driven by the Giulia voice state machine.
 */
export default function AmbientBloom() {
  const { state, startListening, stopListening } = useGiuliaVoice();

  return (
    <motion.button
      onMouseDown={startListening}
      onMouseUp={stopListening}
      onMouseLeave={() => state === "listening" && stopListening()}
      onTouchStart={startListening}
      onTouchEnd={stopListening}
      animate={{ scale: state === "listening" ? 1.12 : state === "speaking" ? [1, 1.06, 1] : 1 }}
      transition={{ duration: state === "speaking" ? 0.9 : 0.25, repeat: state === "speaking" ? Infinity : 0 }}
      className="fixed bottom-5 left-5 lg:bottom-7 lg:left-7 z-40 h-12 w-12 lg:h-14 lg:w-14 rounded-full flex items-center justify-center text-ivory select-none"
      style={{
        background: "oklch(var(--bloom-blue))",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.18), 0 0 36px oklch(75% 0.12 230 / 0.55), 0 12px 30px rgba(0,0,0,0.25)",
      }}
      aria-label="Hou ingedrukt om met Giulia te praten"
    >
      {state === "thinking" ? (
        <span className="h-4 w-4 border-2 border-ivory/40 border-t-ivory rounded-full animate-spin" />
      ) : state === "listening" ? (
        <span className="h-2.5 w-2.5 rounded-full bg-ivory animate-pulse-soft" />
      ) : (
        <Mic className="h-5 w-5" strokeWidth={1.75} />
      )}
    </motion.button>
  );
}