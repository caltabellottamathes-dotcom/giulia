import React from "react";
import { Outlet, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * GlassLayout — wraps all /glass routes. Applies the `.glass-scope` class so
 * GlassAgenda's exact token values (warm marble, light olive, plum, selfbg,
 * selfpanel) take effect, and provides a dark `bg-metal` base + a floating
 * back-to-OS button.
 */
export default function GlassLayout() {
  return (
    <div className="glass-scope min-h-[100dvh] bg-metal text-storm">
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full border border-marble/30 bg-marble/10 px-4 py-2 text-xs text-storm/70 hover:text-storm hover:bg-marble/20 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> GIULIA OS
      </Link>
      <Outlet />
    </div>
  );
}