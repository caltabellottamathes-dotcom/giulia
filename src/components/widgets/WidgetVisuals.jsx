import React from "react";
import { cn } from "@/lib/utils";

/** The "exactly one glanceable visual" building blocks for Widget cards. */

export function ProgressBar({ value = 0, className }) {
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden", className)}>
      <div
        className="h-full rounded-full bg-foreground/70"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function AvatarCluster({ avatars = [] }) {
  return (
    <div className="flex items-center -space-x-2">
      {avatars.slice(0, 4).map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="h-6 w-6 rounded-full object-cover border-2 border-background"
        />
      ))}
    </div>
  );
}