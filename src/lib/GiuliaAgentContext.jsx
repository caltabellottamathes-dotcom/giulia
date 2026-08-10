import React, { createContext, useContext, useState, useCallback } from "react";

const GiuliaAgentContext = createContext(null);

export function GiuliaAgentProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const openPanel = useCallback(() => setOpen(true), []);
  const closePanel = useCallback(() => setOpen(false), []);

  return (
    <GiuliaAgentContext.Provider
      value={{ open, openPanel, closePanel, conversationId, setConversationId }}
    >
      {children}
    </GiuliaAgentContext.Provider>
  );
}

export const useGiuliaAgent = () => useContext(GiuliaAgentContext);