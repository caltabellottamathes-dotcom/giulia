import React from "react";
import { motion } from "framer-motion";
import GraphShell from "./GraphShell";
import { A } from "./graphData";
import { Radar, Constellation, Wave, Donut } from "./shapes";

const accent = A.sand;

function ConfidenceRings() {
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {[30, 46, 60].map((r, i) => (
        <motion.circle key={i} cx={60} cy={60} r={r} fill="none" stroke={accent} strokeWidth={2}
          animate={{ strokeOpacity: [0.2, 0.7, 0.2], r: [r - 4, r, r - 4] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }} />
      ))}
      <circle cx={60} cy={60} r={6} fill={accent} />
    </svg>
  );
}
function InsightWeb() {
  const nodes = [{ x: 60, y: 20, r: 5 }, { x: 30, y: 60, r: 3 }, { x: 90, y: 60, r: 3 }, { x: 45, y: 96, r: 3 }, { x: 78, y: 96, r: 3 }];
  const links = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [3, 4]];
  return <Constellation nodes={nodes} links={links} color={accent} size={140} />;
}

const IntelligenceItems = [
  <GraphShell label="Insight Radar" accent={accent}><Radar axes={8} color={accent} size={140} /></GraphShell>,
  <GraphShell label="Confidence Rings" accent={accent}><ConfidenceRings /></GraphShell>,
  <GraphShell label="Insight Web" accent={accent}><InsightWeb /></GraphShell>,
  <GraphShell label="Signal" accent={accent}><Wave w={150} h={50} color={accent} amp={14} /></GraphShell>,
  <GraphShell label="Confidence Donut" accent={accent}><Donut segs={[42, 30, 18, 10]} colors={[accent, A.olive, A.ridge, A.smoke]} size={120} /></GraphShell>,
];
export default IntelligenceItems;