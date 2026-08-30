import React, { createContext, useContext, useState } from "react";

/**
 * Global panel state — exactly ONE sliding glass panel can be open at a time
 * for modules. Chat and Voice are separate, dedicated floating windows that
 * can coexist with a module panel and persist across dashboard navigation.
 */
export const PanelContext = createContext(null);

export function PanelProvider({ children }) {
  const [activeModule, setActiveModule] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [mattiaChatOpen, setMattiaChatOpen] = useState(false);
  const [mattiaVoiceOpen, setMattiaVoiceOpen] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserMinimized, setBrowserMinimized] = useState(false);
  const [mediaFullscreen, setMediaFullscreen] = useState(false);
  const [mediaMinimized, setMediaMinimized] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [pendingMattiaMessage, setPendingMattiaMessage] = useState(null);

  // "chat" opens the dedicated chat window instead of a module panel.
  // "voice" opens the dedicated, navigation-persistent voice window.
  // "mattiaChat"/"mattiaVoice" open Mattia's hotline windows.
  const openModule = (key) => {
    if (key === "chat") {
      setChatOpen(true);
      return;
    }
    if (key === "voice") {
      setVoiceOpen(true);
      return;
    }
    if (key === "mattiaChat") {
      setMattiaChatOpen(true);
      return;
    }
    if (key === "mattiaVoice") {
      setMattiaVoiceOpen(true);
      return;
    }
    if (key === "browser") {
      setBrowserOpen(true);
      setBrowserMinimized(false);
      return;
    }
    setActiveModule(key);
  };
  const closeModule = () => setActiveModule(null);
  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);
  const openVoice = () => setVoiceOpen(true);
  const closeVoice = () => setVoiceOpen(false);
  const openMattiaChat = () => setMattiaChatOpen(true);
  const closeMattiaChat = () => setMattiaChatOpen(false);
  const openMattiaVoice = () => setMattiaVoiceOpen(true);
  const closeMattiaVoice = () => setMattiaVoiceOpen(false);
  const openBrowser = () => { setBrowserOpen(true); setBrowserMinimized(false); };
  const closeBrowser = () => { setBrowserOpen(false); setBrowserMinimized(false); };
  const minimizeBrowser = () => setBrowserMinimized(true);
  const restoreBrowser = () => setBrowserMinimized(false);
  const openMediaFullscreen = () => { setMediaFullscreen(true); setMediaMinimized(false); };
  const closeMediaFullscreen = () => { setMediaFullscreen(false); setMediaMinimized(false); };
  const minimizeMedia = () => setMediaMinimized(true);
  const restoreMedia = () => setMediaMinimized(false);

  return (
    <PanelContext.Provider
      value={{
        activeModule, openModule, closeModule,
        chatOpen, openChat, closeChat,
        voiceOpen, openVoice, closeVoice,
        mattiaChatOpen, openMattiaChat, closeMattiaChat,
        mattiaVoiceOpen, openMattiaVoice, closeMattiaVoice,
        browserOpen, openBrowser, closeBrowser,
        browserMinimized, minimizeBrowser, restoreBrowser,
        mediaFullscreen, openMediaFullscreen, closeMediaFullscreen,
        mediaMinimized, minimizeMedia, restoreMedia,
        pendingMessage, setPendingMessage,
        pendingMattiaMessage, setPendingMattiaMessage,
      }}
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