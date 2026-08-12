import React from "react";
import WidgetShell from "@/components/widgets/WidgetShell";
import WidgetHeader from "@/components/widgets/WidgetHeader";
import CountUp from "@/components/widgets/CountUp";
import Ring from "@/components/widgets/Ring";
import BrandPhoto from "@/components/widgets/BrandPhoto";
import { WidgetThemeProvider } from "@/lib/WidgetThemeContext";

/* Gallery 4 — "same design, different proportions". Each adaptive widget
 * keeps the exact visual design of the current widget (same shell, header,
 * count, ring, brand photo, accent, copy) and only reflows into 3 ratio/
 * size variants. SIZES tunes photo-strip height + big text + ring so every
 * piece of information stays visible at every ratio. */

export const RATIOS = { wide: "16/9", square: "1/1", tall: "3/4" };

export const SIZES = {
  wide:   { ring: 78,  photo: "h-14", big: "text-4xl", mid: "text-3xl", sm: "text-2xl", pad: "p-4", gap: "gap-3", hMb: "mb-2",  row: true },
  square: { ring: 96,  photo: "h-20", big: "text-5xl", mid: "text-4xl", sm: "text-3xl", pad: "p-5", gap: "gap-4", hMb: "mb-3",  row: true },
  tall:   { ring: 104, photo: "h-24", big: "text-5xl", mid: "text-4xl", sm: "text-3xl", pad: "p-5", gap: "gap-5", hMb: "mb-3",  row: false },
};

export function Tile({ ratio, radius = "medium", onClick, children }) {
  return (
    <WidgetThemeProvider value={{ theme: "glass", color: "", opacity: 1, blur: 0 }}>
      <div style={{ aspectRatio: RATIOS[ratio] }} className="w-full">
        <WidgetShell size="full" radius={radius} interactive={!!onClick} onClick={onClick} className="!min-h-0 h-full">
          {children}
        </WidgetShell>
      </div>
    </WidgetThemeProvider>
  );
}

export { WidgetHeader, CountUp, Ring, BrandPhoto };