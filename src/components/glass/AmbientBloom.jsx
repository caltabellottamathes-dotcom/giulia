import React from "react";

/**
 * AmbientBloom — the fixed "Living Canvas" light source in the bottom-left
 * corner. A blurred, drifting OKLCH-blue blob that gives the UI depth.
 */
export default function AmbientBloom() {
  return <div className="ambient-bloom" aria-hidden="true" />;
}