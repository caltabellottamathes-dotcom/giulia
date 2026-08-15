import React, { useEffect } from "react";
import { useContextCapture } from "@/lib/ContextCaptureContext";

// Generic "card-like" containers used throughout the app — clicking anywhere
// inside one of these captures that whole element's text, not just a word.
const CONTAINER_SELECTOR =
  "[data-context], .glass-card, .glass-card-2, .chat-bubble, .glass-1, .glass-2, .glass-3, .refraction-panel, .rounded-2xl, .rounded-xl";

/**
 * ContextCaptureLayer — floating toggle (bottom-left) that puts the whole app
 * into "click to remember" mode. While active, clicking ANY element captures
 * its visible text; a small popup then lets Salvo add extra notes before
 * saving it to Giulia's Memory. Works on every page/panel, not just chat.
 */
export default function ContextCaptureLayer() {
  const { active, capture } = useContextCapture();

  useEffect(() => {
    if (!active) return;
    document.body.style.cursor = "crosshair";
    const onClick = (e) => {
      if (e.target.closest("[data-no-capture]")) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target.closest(CONTAINER_SELECTOR) || e.target;
      const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 500);
      capture(text, e.clientX, e.clientY);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.body.style.cursor = "";
      document.removeEventListener("click", onClick, true);
    };
  }, [active, capture]);

  return null;
}