import React from "react";
import GraphShell from "./GraphShell";
import { A } from "./graphData";
import { Orbit, Constellation, RadialSpokes, HexTiles, DotLattice } from "./shapes";

const accent = A.ridge;

function Tree() {
  const nodes = [
    { x: 60, y: 14, r: 5 }, { x: 28, y: 52, r: 4 }, { x: 92, y: 52, r: 4 },
    { x: 16, y: 92, r: 3 }, { x: 40, y: 92, r: 3 }, { x: 84, y: 92, r: 3 }, { x: 104, y: 92, r: 3 },
  ];
  const links = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
  return <Constellation nodes={nodes} links={links} color={accent} size={140} />;
}
function Web() {
  const nodes = Array.from({ length: 9 }, (_, i) => ({ x: 20 + (i % 3) * 40, y: 20 + Math.floor(i / 3) * 40, r: 3 + (i % 2) }));
  const links = [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8]];
  return <Constellation nodes={nodes} links={links} color={accent} size={140} />;
}

const NetworkItems = [
  <GraphShell label="Orbit Net" accent={accent}><Orbit count={8} r={44} color={accent} speed={18} size={140} /></GraphShell>,
  <GraphShell label="Web" accent={accent}><Web /></GraphShell>,
  <GraphShell label="Tree" accent={accent}><Tree /></GraphShell>,
  <GraphShell label="Hub Spokes" accent={accent}><RadialSpokes count={16} color={accent} size={140} /></GraphShell>,
  <GraphShell label="Hive" accent={accent}><HexTiles color={accent} size={140} /></GraphShell>,
  <GraphShell label="Lattice" accent={accent} className="sm:col-span-2"><DotLattice cols={11} rows={6} color={accent} size={170} /></GraphShell>,
];
export default NetworkItems;