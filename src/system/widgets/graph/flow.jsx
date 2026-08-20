import React from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";
import { FlowTrack, Wave } from "./shapes";

const accent = A.olive;

function Streams() {
  return (
    <svg width={140} height={70} viewBox="0 0 140 70">
      {[18, 34, 50].map((y, i) => (
        <motion.path key={i} d={`M0 ${y} Q35 ${y - 12} 70 ${y} T140 ${y}`} fill="none" stroke={accent} strokeWidth={2} strokeOpacity={0.3 + i * 0.25}
          animate={{ d: [`M0 ${y} Q35 ${y - 12} 70 ${y} T140 ${y}`, `M0 ${y} Q35 ${y + 12} 70 ${y} T140 ${y}`, `M0 ${y} Q35 ${y - 12} 70 ${y} T140 ${y}`] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </svg>
  );
}
function Sankey() {
  const left = [20, 45, 70], right = [30, 60, 90];
  return (
    <svg width={140} height={100} viewBox="0 0 140 100">
      {left.map((y, i) => <rect key={"l" + i} x={4} y={y - 6} width={8} height={12} fill={accent} opacity={0.5} />)}
      {right.map((y, i) => <rect key={"r" + i} x={128} y={y - 6} width={8} height={12} fill={A.ridge} opacity={0.5} />)}
      {left.map((y, i) => right.map((y2, j) => (
        <motion.path key={i + "-" + j} d={`M12 ${y} C70 ${y} 70 ${y2} 128 ${y2}`} fill="none" stroke={accent} strokeWidth={1} strokeOpacity={0.2}
          animate={{ strokeOpacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2.4, repeat: Infinity, delay: (i + j) * 0.2 }} />
      )))}
    </svg>
  );
}
function Conveyor() {
  return <div className="flex flex-col gap-2">{[0, 1, 2].map((i) => <FlowTrack key={i} count={4} w={150} h={14} color={accent} />)}</div>;
}
function Process() {
  return (
    <svg width={150} height={60} viewBox="0 0 150 60">
      {[22, 75, 128].map((x, i) => (
        <g key={i}>
          <rect x={x - 15} y={22} width={30} height={16} rx={4} fill={accent} fillOpacity={0.18} stroke={accent} strokeWidth={1.4} />
          <motion.circle cx={x} cy={30} r={3} fill={accent} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }} />
        </g>
      ))}
      {[37, 90].map((x, i) => <motion.line key={i} x1={x} y1={30} x2={x + 23} y2={30} stroke={accent} strokeWidth={1.4}
        animate={{ strokeOpacity: [0.2, 0.8, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }} />)}
    </svg>
  );
}

const FlowItems = [
  <GraphShell label="Pipeline" accent={accent}><FlowTrack count={6} w={150} h={40} color={accent} /></GraphShell>,
  <GraphShell label="Streams" accent={accent}><Streams /></GraphShell>,
  <GraphShell label="Sankey" accent={accent} className="sm:col-span-2"><Sankey /></GraphShell>,
  <GraphShell label="Conveyor" accent={accent}><Conveyor /></GraphShell>,
  <GraphShell label="Process" accent={accent}><Process /></GraphShell>,
];
export default FlowItems;