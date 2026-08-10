import React from "react";

/** EmptyState — consistent designed default for every project tab when no
 *  data exists yet. Keeps the layout intact instead of going blank. */
export default function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="glass-1 rounded-2xl p-10 text-center flex flex-col items-center">
      {Icon && (
        <span className="h-12 w-12 rounded-2xl glass flex items-center justify-center mb-4">
          <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        </span>
      )}
      <p className="text-sm font-display font-semibold">{title || "Nog niets hier"}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}