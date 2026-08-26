import React from "react";

const START = 6, END = 24, SPAN = END - START;
const COLORS = { free: "bg-muted-foreground/20", social: "bg-olive", recovery: "bg-steel", protected: "bg-powder", rest: "bg-powder/70" };
const hourOf = (iso) => { const d = new Date(iso); return d.getHours() + d.getMinutes() / 60; };

/** TimeField — §5.1 horizontal positioned day timeline, blocks placed by
 *  actual start/end time rather than listed in order. */
export default function TimeField({ blocks = [] }) {
  return (
    <div>
      <div className="relative h-10 rounded-xl bg-muted/40 overflow-hidden">
        {blocks.map((b) => {
          const startH = Math.max(START, Math.min(END, hourOf(b.start)));
          const endH = b.end ? Math.max(startH, Math.min(END, hourOf(b.end))) : startH + (b.duration_min || 30) / 60;
          const left = ((startH - START) / SPAN) * 100;
          const width = Math.max(1.5, ((endH - startH) / SPAN) * 100);
          return (
            <div key={b.id} title={b.title} className={`absolute top-1 bottom-1 rounded-md ${COLORS[b.type] || COLORS.free} ${b.conflict_flag ? "ring-2 ring-urgent" : ""}`}
              style={{ left: `${left}%`, width: `${width}%` }} />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5"><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
    </div>
  );
}