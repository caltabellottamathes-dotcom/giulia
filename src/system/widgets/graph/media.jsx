import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";

const accent = A.sand;
const PHOTOS = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&q=60",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=60",
  "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=200&q=60",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=200&q=60",
];

function Filmstrip() {
  return <motion.div className="flex gap-1" animate={{ x: [0, -192] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
    {[...PHOTOS, ...PHOTOS].map((p, i) => <div key={i} className="h-12 w-16 rounded-md bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${p})` }} />)}
  </motion.div>;
}
function ImageGrid() {
  return <div className="grid grid-cols-3 gap-1 w-full">{PHOTOS.map((p, i) => (
    <motion.div key={i} className="aspect-square rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${p})` }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} />
  ))}</div>;
}
function Scrubber() {
  const [x, setX] = useState(20);
  useEffect(() => { const id = setInterval(() => setX((v) => (v >= 100 ? 0 : v + 1.5)), 60); return () => clearInterval(id); }, []);
  return <div className="w-full"><div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: accent, width: `${x}%` }} /></div>
    <div className="flex justify-between text-[8px] text-foreground/40 mt-1"><span>0:00</span><span>2:48</span></div></div>;
}
function Levels() {
  const [h, setH] = useState([40, 60, 30, 70, 50]);
  useEffect(() => { const id = setInterval(() => setH((arr) => arr.map(() => 30 + Math.random() * 50)), 400); return () => clearInterval(id); }, []);
  return <div className="flex items-end gap-1 h-16">{h.map((v, i) => <motion.div key={i} className="w-3 rounded-t-sm" style={{ background: accent }} animate={{ height: v }} />)}</div>;
}
function Mosaic() {
  return <div className="grid grid-cols-2 gap-1 w-full h-24">
    <div className="row-span-2 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${PHOTOS[0]})` }} />
    <div className="rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${PHOTOS[1]})` }} />
    <div className="rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${PHOTOS[2]})` }} />
  </div>;
}

const MediaItems = [
  <GraphShell label="Filmstrip" accent={accent} className="sm:col-span-2"><Filmstrip /></GraphShell>,
  <GraphShell label="Image Grid" accent={accent}><ImageGrid /></GraphShell>,
  <GraphShell label="Scrubber" accent={accent}><Scrubber /></GraphShell>,
  <GraphShell label="Levels" accent={accent}><Levels /></GraphShell>,
  <GraphShell label="Mosaic" accent={accent} className="sm:col-span-2"><Mosaic /></GraphShell>,
];
export default MediaItems;