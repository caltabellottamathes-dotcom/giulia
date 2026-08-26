import React, { useMemo } from "react";
import WidgetShell from "@/system/widgets/WidgetShell";
import WidgetHeader from "@/system/widgets/WidgetHeader";
import { CountUp, ProgressRing, MiniStat } from "@/system/widgets/primitives";
import { spaceCapacityQuadrant } from "@/lib/domainUtils";
import { fmtDuration } from "@/lib/selfUtils";

const GRID = "grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 auto-rows-[176px]";
const DAY_START = 6, DAY_END = 24;
const totalDayMin = (DAY_END - DAY_START) * 60;
const BLOCK_COLOR = { rest: "hsl(var(--ridge))", recovery: "hsl(var(--blue-grey))", free: "hsl(var(--d-life-light))", protected: "hsl(var(--giulia-urgent))" };

/** PersonalTimeSection — §5 ruimtelijke laag als bento: space, capacity, blocks, space×capacity, timeline. */
export default function PersonalTimeSection({ d, capacity, availableMin }) {
  const todayBlocks = useMemo(() => { const today = new Date().toDateString(); return (d.blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === today && b.status !== "cancelled").sort((a, b) => new Date(a.start) - new Date(b.start)); }, [d.blocks]);
  const used = totalDayMin - availableMin;
  const spacePct = Math.round((availableMin / totalDayMin) * 100);
  const conflicts = todayBlocks.filter((b) => b.conflict_flag);
  const quadrant = spaceCapacityQuadrant(spacePct, capacity.level);
  const capColor = capacity.level === "HIGH" ? "hsl(var(--olive))" : capacity.level === "LOW" ? "hsl(var(--giulia-urgent))" : "var(--tile-accent)";

  return (
    <div className={GRID}>
      {/* SPACE — large */}
      <WidgetShell size="2x2" radius="large" domain="life" className="col-span-2 row-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Available Space · Today" type="agenda" />
          <div className="flex-1 flex flex-col items-center justify-center">
            <ProgressRing value={spacePct / 100} size={128} stroke={10} color={capColor} label={<span className="flex items-baseline"><CountUp value={spacePct} className="text-5xl font-display font-semibold tabular-nums leading-none" /><span className="text-2xl font-display font-semibold opacity-60">%</span></span>} />
            <p className="text-[11px] opacity-55 mt-4">{Math.round(availableMin / 60 * 10) / 10}h open · {todayBlocks.length} blocks</p>
          </div>
        </div>
      </WidgetShell>

      {/* CAPACITY */}
      <WidgetShell size="1x1" radius="medium" domain="life" style={{ "--tile-accent": capColor }}>
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="Capacity" type="energy" /><div className="mt-auto"><p className="text-2xl font-display font-semibold leading-none">{capacity.level}</p><p className="text-[10px] opacity-45 mt-1">how I'm doing</p></div></div>
      </WidgetShell>

      {/* BLOCKS */}
      <WidgetShell size="1x1" radius="medium" domain="life">
        <div className="p-4 flex flex-col h-full"><WidgetHeader label="Blocks" type="tasks" /><div className="mt-auto"><MiniStat label="today" value={todayBlocks.length} sub={fmtDuration(used)} /></div></div>
      </WidgetShell>

      {/* SPACE × CAPACITY */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full">
          <WidgetHeader label="Space × Capacity" type="pulse" />
          <div className="mt-auto">
            <p className="text-lg font-display font-semibold leading-tight">{quadrant.label}</p>
            <p className="text-[11px] opacity-55 mt-1 leading-relaxed">{quadrant.desc}</p>
          </div>
        </div>
      </WidgetShell>

      {/* TIMELINE */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2">
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <WidgetHeader label="Time Field · Today" type="agenda" />
          <div className="mt-2 space-y-1 overflow-hidden">
            {todayBlocks.length ? todayBlocks.map((b) => {
              const s = new Date(b.start); const e = new Date(b.end);
              return (
                <div key={b.id} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: BLOCK_COLOR[b.type] || BLOCK_COLOR.free }} />
                  <span className="truncate flex-1">{b.title}</span>
                  <span className="text-[10px] opacity-50 tabular-nums shrink-0">{s.getHours().toString().padStart(2, "0")}–{e.getHours().toString().padStart(2, "0")}</span>
                </div>
              );
            }) : <p className="text-sm opacity-45">Free day — no blocks</p>}
          </div>
        </div>
      </WidgetShell>

      {/* CONFLICTS */}
      <WidgetShell size="2x1" radius="large" domain="life" className="col-span-2" style={conflicts.length ? { "--tile-accent": "hsl(var(--giulia-urgent))" } : undefined}>
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <WidgetHeader label="Conflicts" type="pulse" count={conflicts.length || ""} />
          <div className="mt-2 space-y-1.5 overflow-hidden">
            {conflicts.length ? conflicts.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm"><span className="truncate">{b.title}</span><span className="text-[10px] opacity-50">protected time</span></div>
            )) : <p className="text-sm opacity-45">No conflicts — space is clean</p>}
          </div>
        </div>
      </WidgetShell>
    </div>
  );
}