import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global navigation + chat-window state. Opening a module now navigates to
 * its full page route (so every page slides in and stays reachable). "chat"
 * opens the dedicated floating Giulia chat window instead of a route.
 */
const PanelContext = createContext(null);

export function PanelProvider({ children }) {
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

  const openModule = (key) => {
    if (key === "chat") {
      setChatOpen(true);
      return;
    }
    navigate(key === "home" ? "/" : `/${key}`);
  };
  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);

  return (
    <PanelContext.Provider value={{ openModule, chatOpen, openChat, closeChat }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanel must be used within a PanelProvider");
  return ctx;
}