import React from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";
import { Orbit, Constellation } from "./shapes";

const accent = A.ridge;

function AvatarStack() {
  const cols = [accent, A.olive, A.sand, A.smoke];
  return <div className="flex">{cols.map((c, i) => (
    <motion.div key={i} className="h-10 w-10 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white"
      style={{ background: c, marginLeft: i ? -12 : 0, zIndex: 10 - i }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>M</motion.div>
  ))}</div>;
}
function PresenceGrid() {
  const people = Array.from({ length: 12 }, () => Math.random() > 0.4);
  return <div className="grid grid-cols-4 gap-2">{people.map((on, i) => (
    <motion.div key={i} className="h-8 rounded-lg flex items-center justify-center" style={{ background: on ? accent : "hsl(var(--foreground)/0.08)" }} animate={{ opacity: on ? 1 : 0.4 }} />
  ))}</div>;
}
function SocialGraph() {
  const nodes = [{ x: 60, y: 24, r: 5 }, { x: 30, y: 60, r: 3 }, { x: 90, y: 55, r: 3 }, { x: 48, y: 92, r: 3 }, { x: 82, y: 90, r: 3 }];
  const links = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 3], [2, 4], [1, 2]];
  return <Constellation nodes={nodes} links={links} color={accent} size={140} />;
}
function ContactDensity() {
  const v = [3, 5, 2, 7, 4, 6, 3];
  return <div className="flex items-end gap-1.5 h-16">{v.map((n, i) => (
    <motion.div key={i} className="w-3 rounded-t-md" style={{ background: accent }} initial={{ height: 0 }} animate={{ height: n * 8 }} transition={{ delay: i * 0.08 }} />
  ))}</div>;
}

const PeopleItems = [
  <GraphShell label="Avatar Stack" accent={accent}><AvatarStack /></GraphShell>,
  <GraphShell label="Presence" accent={accent}><PresenceGrid /></GraphShell>,
  <GraphShell label="Social Graph" accent={accent}><SocialGraph /></GraphShell>,
  <GraphShell label="Team Ring" accent={accent}><Orbit count={6} r={42} color={accent} speed={20} size={140} /></GraphShell>,
  <GraphShell label="Contact Density" accent={accent}><ContactDensity /></GraphShell>,
];
export default PeopleItems;