import React from "react";

/** RelationshipTimeline — §2.4 six-month real activity history for one contact. */
export default function RelationshipTimeline({ contactId, whatsapps = [] }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: d.toLocaleDateString("nl-NL", { month: "short" }), start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 1) };
  });
  const counts = months.map((m) => (whatsapps || []).filter((msg) => msg.contact_id === contactId && new Date(msg.timestamp) >= m.start && new Date(msg.timestamp) < m.end).length);
  const max = Math.max(1, ...counts);

  return (
    <div className="flex items-end gap-2 h-12">
      {months.map((m, i) => (
        <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-md bg-muted overflow-hidden flex items-end" style={{ height: 32 }}>
            <div className="w-full rounded-md bg-olive/60" style={{ height: `${Math.max(6, (counts[i] / max) * 100)}%` }} />
          </div>
          <span className="text-[9px] text-muted-foreground uppercase">{m.key}</span>
        </div>
      ))}
    </div>
  );
}