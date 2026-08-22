import React from "react";
import { Link } from "react-router-dom";
import { GlassPhotoLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";

const PHOTO = "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/a560179c0_Voice_.jpeg";
const IVORY = "hsl(var(--ivory))";
const DEEP = "hsl(var(--d-giulia-deep))";

/** Hotline2 — de zwevende widget die naast het voice-paneel verschijnt als je
 *  op de echte Hotline-widget klikt. GEEN ElevenLabs, niet in het registry
 *  (dus niet in de Widget Picker of op het dashboard). Alleen een header met
 *  animatie + "GIULIA'S HOTLINE.", een body-regel, en een minimalistische
 *  chat-knop (Link → /chat). PhotoCard links. G·16x9·L·SIDE. */
export default function Hotline2Widget() {
  return (
    <div className="w-full h-[300px]">
      <GlassPhotoLayeredWidget
        shape="16:9"
        photo={PHOTO}
        photoPosition="left"
        photoFraction={0.42}
        overhang={0}
        domain="giulia"
        radius="large"
        photoOverlay="bg-gradient-to-t from-black/45 via-black/20 to-black/10"
      >
        <WidgetHeader type="pulse" label="GIULIA'S HOTLINE." />
        <p className="text-[12.5px] leading-snug mt-2.5" style={{ color: "hsl(var(--ivory) / 0.92)" }}>
          Call Giulia in the panel on the right or click here to chat.
        </p>
        <div className="flex-1 min-h-2" />
        <Link
          to="/chat"
          className="inline-flex items-center self-start rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.22em] font-bold transition-opacity hover:opacity-80"
          style={{ background: DEEP, color: IVORY }}
        >
          Chat
        </Link>
      </GlassPhotoLayeredWidget>
    </div>
  );
}