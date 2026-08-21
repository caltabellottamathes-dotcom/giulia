import React from "react";
import CountUp from "@/system/widgets/CountUp";

/** MiniStat — kleine label + geanimeerd getal + eenheid. Typografie-blok. */
export default function MiniStat({ label, value = 0, unit, sub }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase tracking-[0.2em] font-semibold opacity-50">{label}</span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <CountUp value={value} className="text-2xl font-display font-semibold tabular-nums text-current leading-none tracking-[-0.02em]" />
        {unit && <span className="text-[10px] uppercase tracking-[0.15em] opacity-50">{unit}</span>}
      </div>
      {sub && <span className="text-[10px] opacity-45 mt-0.5">{sub}</span>}
    </div>
  );
}