import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";
import { KineticText } from "./shapes";

const accent = A.ink;

function Specimen() {
  return <div className="flex items-center justify-center h-full"><span className="text-7xl font-display font-semibold tracking-tight" style={{ color: accent }}>Aa</span></div>;
}
function WeightScale() {
  const ws = [300, 400, 500, 700];
  return <div className="flex items-baseline gap-2">{ws.map((w, i) => (
    <motion.span key={i} className="font-display" style={{ fontWeight: w, color: accent, fontSize: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>Gi</motion.span>
  ))}</div>;
}
function SpacingDemo() {
  const [t, setT] = useState(-2);
  useEffect(() => { const id = setInterval(() => setT((v) => (v >= 8 ? -2 : v + 1)), 700); return () => clearInterval(id); }, []);
  return <div className="text-center"><span className="text-3xl font-display font-semibold" style={{ color: accent, letterSpacing: `${t}px` }}>G I U L I A</span><p className="text-[9px] text-foreground/50 mt-1">{t}px tracking</p></div>;
}
function DropCap() {
  return <div className="text-[11px] leading-relaxed text-foreground/70"><span className="float-left text-4xl font-display font-semibold leading-none mr-1.5" style={{ color: accent }}>G</span>iulia brengt agenda, mail en projecten samen in één rustige omgeving.</div>;
}

const TypographyItems = [
  <GraphShell label="Specimen" accent={accent}><Specimen /></GraphShell>,
  <GraphShell label="Weight Scale" accent={accent}><WeightScale /></GraphShell>,
  <GraphShell label="Spacing" accent={accent}><SpacingDemo /></GraphShell>,
  <GraphShell label="Drop Cap" accent={accent}><DropCap /></GraphShell>,
  <GraphShell label="Kinetic Type" accent={accent}><KineticText words={["focus", "flow", "form", "field"]} color={accent} /></GraphShell>,
];
export default TypographyItems;