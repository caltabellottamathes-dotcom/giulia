import React, { createContext, useContext, useState } from "react";

/**
 * Global panel state — exactly ONE sliding glass panel can be open at a time
 * for modules. Chat is a separate, dedicated floating window (Giulia agent)
 * that can coexist with a module panel.
 */
const PanelContext = createContext(null);

export function PanelProvider({ children }) {
  const [activeModule, setActiveModule] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  // "chat" opens the dedicated chat window instead of a module panel.
  const openModule = (key) => {
    if (key === "chat") {
      setChatOpen(true);
      return;
    }
    setActiveModule(key);
  };
  const closeModule = () => setActiveModule(null);
  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);

  return (
    <PanelContext.Provider
      value={{ activeModule, openModule, closeModule, chatOpen, openChat, closeChat }}
    >
      {children}
    </PanelContext.Provider>
  );
}

export function usePanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanel must be used within a PanelProvider");
  return ctx;
}