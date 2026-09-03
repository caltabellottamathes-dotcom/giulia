import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import ModulePanel from "@/system/panels/ModulePanel";
import ChatWindow from "@/giulia/panels/ChatWindow";
import VoiceWindow from "@/giulia/panels/VoiceWindow";
import MattiaChatWindow from "@/giulia/panels/MattiaChatWindow";
import MattiaVoiceWindow from "@/giulia/panels/MattiaVoiceWindow";
import BrowserWindow from "@/system/components/BrowserWindow";
import MediaFullscreenWindow from "@/system/components/MediaFullscreenWindow";
import WorkspaceToolbar from "@/system/components/WorkspaceToolbar";
import { MediaViewerProvider } from "@/lib/MediaViewerContext";
import { BeeldbankProvider } from "@/lib/BeeldbankContext";
import BeeldbankOverlay from "@/system/components/BeeldbankOverlay";
import { PanelProvider, usePanel } from "@/lib/PanelContext";
import { ContextCaptureProvider } from "@/lib/ContextCaptureContext";
import ContextCaptureLayer from "@/system/components/context/ContextCaptureLayer";
import { GiuliaVoiceProvider } from "@/lib/GiuliaVoiceContext";
import TauriFocusSync from "@/system/components/native/TauriFocusSync";
import { GiuliaAgentProvider } from "@/lib/GiuliaAgentContext";
import { useAgentNavigation } from "@/lib/useAgentNavigation";
import GiuliaBubble from "@/system/components/glass/GiuliaBubble";

export default function Layout() {
  return (
    <PanelProvider>
      <BeeldbankProvider>
        <MediaViewerProvider>
          <GiuliaVoiceProvider>
            <GiuliaAgentProvider>
              <ContextCaptureProvider>
                <LayoutInner />
              </ContextCaptureProvider>
            </GiuliaAgentProvider>
          </GiuliaVoiceProvider>
        </MediaViewerProvider>
      </BeeldbankProvider>
    </PanelProvider>);

}

function LayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openModule } = usePanel();
  useAgentNavigation({ openModule });

  return (
    <div className="min-h-screen relative">
      <TauriFocusSync />
      {/* Full-width workspace — navigation lives in the bottom plus-button menu */}
      <div className="flex flex-col h-screen relative overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 h-14 shrink-0 flex items-center justify-between px-5 lg:px-10 border-b border-foreground bg-background">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="Naar dashboard">
            <span className="h-3 w-3 bg-accent" />
            <span className="font-heading font-bold tracking-[0.26em] text-[13px] uppercase">
              Giulia
            </span>
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60 tabular-nums">
            {new Date().toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
          </p>
        </header>

        {/* Workspace content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-5 lg:px-10 pt-6 lg:pt-8 pb-24 w-full">
          <div key={location.pathname} className="animate-route-fade">
            <Outlet />
          </div>
        </main>
      </div>

      {/* The single sliding glass panel that hosts every module */}
      <ModulePanel />

      {/* Dedicated chat window — the Giulia agent */}
      <ChatWindow />

      {/* Persistent voice window — stays open across dashboard navigation */}
      <VoiceWindow />

      {/* MATTIA'S HOTLINE — dedicated chat + voice windows (parallel to Giulia's) */}
      <MattiaChatWindow />
      <MattiaVoiceWindow />

      {/* Fullscreen in-app browser window */}
      <BrowserWindow />

      {/* Fullscreen media viewer — adjustable size & ratio */}
      <MediaFullscreenWindow />

      {/* Permanent glass interaction bar — bottom-right */}
      <WorkspaceToolbar />

      {/* Click-to-remember — capture context from any element, anywhere */}
      <ContextCaptureLayer />

      {/* Giulia proactive text bubbles — appear during active OS sessions */}
      <GiuliaBubble />

      {/* Beeldbank modus — klik elke foto om hem te wisselen */}
      <BeeldbankOverlay />


    </div>);

}