import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * ContextCaptureContext — app-wide "click to remember" mode. When active,
 * clicking any element in the app captures its text so it can be saved to
 * Giulia's Memory, instead of being limited to a manual-typing box in chat.
 */
const Ctx = createContext(null);

export function ContextCaptureProvider({ children }) {
  const [active, setActive] = useState(false);
  const [captured, setCaptured] = useState(null); // { text, x, y }

  const start = useCallback(() => { setCaptured(null); setActive(true); }, []);
  const stop = useCallback(() => setActive(false), []);
  const capture = useCallback((text, x, y) => {
    setActive(false);
    setCaptured({ text, x, y });
  }, []);
  const clear = useCallback(() => setCaptured(null), []);

  return (
    <Ctx.Provider value={{ active, start, stop, captured, capture, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useContextCapture() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useContextCapture must be used within ContextCaptureProvider");
  return ctx;
}