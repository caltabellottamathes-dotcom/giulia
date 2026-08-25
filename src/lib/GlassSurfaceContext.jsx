import React, { createContext, useContext, useCallback, useMemo } from "react";

const Ctx = createContext(null);

/**
 * GlassSurfaceProvider — vertelt glas-tegels (GlassShell) welke ondergrondtoon
 * er op een bepaald viewportpunt heerst. Op het dashboard is de achtergrondfoto
 * (donker) het "donkere" gebied; alles daarbuiten is de lichte pagina-achtergrond.
 * Zo kan de tekst in een glas-tegel per locatie donker of licht worden voor contrast
 * en leesbaarheid. Enkel van toepassing op tekst in een GlassShell.
 */
export function GlassSurfaceProvider({ photoRef, children }) {
  const getTone = useCallback((clientX, clientY) => {
    const el = photoRef && photoRef.current;
    if (!el) return "light";
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return "light"; // foto verborgen (bv. mobiel) → lichte achtergrond
    if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
      return "dark";
    }
    return "light";
  }, [photoRef]);

  const value = useMemo(() => ({ getTone }), [getTone]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGlassSurface() {
  return useContext(Ctx);
}