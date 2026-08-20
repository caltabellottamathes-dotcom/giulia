import React from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";
import { Swatch } from "./shapes";

const accent = A.olive;
const SW = [
  ["#5c7584", "Sky"], ["#d8dab3", "Sage"], ["#94925d", "Olive"], ["#d5e24a", "Urgent"],
  ["#3a3d42", "Metal"], ["#b9c2c9", "Marble"], ["#8a8170", "Clay"], ["#efe9da", "Linen"],
];

function SwatchGrid() {
  return <div className="grid grid-cols-4 gap-2">{SW.map(([hex, l], i) => (
    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}><Swatch hex={hex} label={l} /></motion.div>
  ))}</div>;
}
function GradientSpectrum() {
  return <div className="w-full h-16 rounded-xl" style={{ background: "linear-gradient(90deg,#3a3d42,#5c7584,#94925d,#d8dab3,#efe9da)" }} />;
}
function TextureTiles() {
  const tx = [
    "radial-gradient(circle at 30% 30%, #b9c2c9, #5c7584)",
    "linear-gradient(135deg,#d8dab3,#94925d)",
    "repeating-linear-gradient(45deg,#efe9da 0 6px,#d8dab3 6px 12px)",
    "radial-gradient(circle at 70% 70%, #d5e24a, #94925d)",
  ];
  return <div className="grid grid-cols-2 gap-2 w-full">{tx.map((t, i) => <div key={i} className="h-12 rounded-lg" style={{ background: t }} />)}</div>;
}
function PaletteLadder() {
  const shades = ["#2b3a44", "#5c7584", "#7e97a6", "#a9bcc7", "#d3dee5"];
  return <div className="flex flex-col gap-1 w-full">{shades.map((s, i) => (
    <motion.div key={i} className="h-6 rounded-md" style={{ background: s }} initial={{ width: 0 }} animate={{ width: `${100 - i * 16}%` }} transition={{ delay: i * 0.1 }} />
  ))}</div>;
}
function MaterialCards() {
  const mats = [{ n: "Metal", c: "#3a3d42" }, { n: "Marble", c: "#b9c2c9" }, { n: "Clay", c: "#8a8170" }];
  return <div className="flex gap-2 w-full">{mats.map((m, i) => (
    <div key={i} className="flex-1 rounded-lg p-2 text-white text-[10px] font-semibold uppercase tracking-wider" style={{ background: m.c }}>{m.n}</div>
  ))}</div>;
}

const MaterialsItems = [
  <GraphShell label="Swatch Grid" accent={accent} className="sm:col-span-2"><SwatchGrid /></GraphShell>,
  <GraphShell label="Spectrum" accent={accent}><GradientSpectrum /></GraphShell>,
  <GraphShell label="Textures" accent={accent}><TextureTiles /></GraphShell>,
  <GraphShell label="Palette Ladder" accent={accent}><PaletteLadder /></GraphShell>,
  <GraphShell label="Material Cards" accent={accent}><MaterialCards /></GraphShell>,
];
export default MaterialsItems;