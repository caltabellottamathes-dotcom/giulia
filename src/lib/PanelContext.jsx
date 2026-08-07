import React, { createContext, useContext, useState } from "react";

/**
 * Global panel state — exactly ONE sliding glass panel can be open at a time.
 * Every module (Agenda, Projects, Email, ...) opens through this single
 * mechanism instead of navigating to a separate page.
 */
const PanelContext = createContext(null);

export function PanelProvider({ children }) {
  const [activeModule, setActiveModule] = useState(null);

  const openModule = (key) => setActiveModule(key);
  const closeModule = () => setActiveModule(null);

  return (
    <PanelContext.Provider value={{ activeModule, openModule, closeModule }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanel must be used within a PanelProvider");
  return ctx;
}