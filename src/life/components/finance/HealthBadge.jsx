import React from "react";
import { STATUS_LABEL, STATUS_COLOR, STATUS_TEXT } from "@/lib/financeUtils";

export default function HealthBadge({ status, size = "sm" }) {
  const c = STATUS_COLOR[status] || STATUS_COLOR.on_track;
  const t = STATUS_TEXT[status] || "text-foreground";
  const pad = size === "lg" ? "px-3 py-1 text-[11px]" : "px-2.5 py-0.5 text-[9px]";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-[0.14em] ${pad} ${t}`} style={{ background: c }}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABEL[status] || status}
    </span>
  );
}