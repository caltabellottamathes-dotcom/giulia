import React from "react";
import { motion } from "framer-motion";

const PHASE_LIGHT = {
  wake:     { glow: "rgba(120,100,80,0.10)", size: 36, opacity: 0.45 },
  orient:   { glow: "rgba(180,150,110,0.16)", size: 50, opacity: 0.65 },
  getup:    { glow: "rgba(200,170,120,0.22)", size: 66, opacity: 0.82 },
  routine:  { glow: "rgba(210,185,140,0.28)", size: 84, opacity: 0.92 },
  briefing: { glow: "rgba(220,200,160,0.32)", size: 100, opacity: 1 },
};

export default function WakeAtmosphere({ phase }) {
  const light = PHASE_LIGHT[phase] || PHASE_LIGHT.wake;
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ background: "#15140f" }}>
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{ x: "-50%", y: "-50%", filter: "blur(70px)" }}
        animate={{ width: `${light.size}vw`, height: `${light.size}vw`, backgroundColor: light.glow, opacity: light.opacity }}
        transition={{ duration: 7, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[-10%] top-1/4 w-[40vw] h-[40vw] rounded-full"
        style={{ background: "rgba(150,170,190,0.05)", filter: "blur(80px)" }}
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-5%] bottom-[5%] w-[35vw] h-[35vw] rounded-full"
        style={{ background: "rgba(190,160,120,0.06)", filter: "blur(80px)" }}
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}