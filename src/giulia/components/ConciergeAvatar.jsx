import React from "react";
import { motion } from "framer-motion";
import { IMAGES } from "@/lib/images";
import { useGiuliaVoice } from "@/lib/GiuliaVoiceContext";

/**
 * ConciergeAvatar — tap-to-talk. Press and hold to record, release to send.
 * Border color + pulse are driven directly by the voice state machine.
 */
const RING = {
  idle: "hsl(var(--warm-white) / 0.35)",
  listening: "hsl(0 70% 60% / 0.95)",
  thinking: "hsl(var(--blue-grey))",
  speaking: "hsl(var(--olive))",
};

export default function ConciergeAvatar() {
  const { state, startListening, stopListening } = useGiuliaVoice();

  return (
    <motion.button
      onMouseDown={startListening}
      onMouseUp={stopListening}
      onMouseLeave={() => state === "listening" && stopListening()}
      onTouchStart={startListening}
      onTouchEnd={stopListening}
      animate={{
        boxShadow: `0 0 0 3px ${RING[state] || RING.idle}, 0 12px 30px hsl(30 10% 10% / 0.32)`,
        scale: state === "listening" ? 1.08 : state === "speaking" ? [1, 1.05, 1] : 1,
      }}
      transition={{ duration: state === "speaking" ? 0.9 : 0.25, repeat: state === "speaking" ? Infinity : 0 }}
      className="relative h-14 w-14 lg:h-16 lg:w-16 rounded-full overflow-hidden shrink-0 select-none"
      aria-label="Hou ingedrukt om met Giulia te praten"
    >
      <img src={IMAGES.giuliaConcierge} alt="Giulia" className="h-full w-full object-cover" draggable={false} />
      {(state === "thinking" || state === "listening") && (
        <span className="absolute inset-0 flex items-center justify-center bg-charcoal/35">
          {state === "thinking" ? (
            <span className="h-4 w-4 border-2 border-ivory/40 border-t-ivory rounded-full animate-spin" />
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-red-400 animate-pulse-soft" />
          )}
        </span>
      )}
    </motion.button>
  );
}