import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

const NAV = [
  { label: "Home", to: "/slick" },
  { label: "Week", to: "/slick/weekplanning" },
  { label: "Dag", to: "/slick/dagplanning" },
  { label: "Projecten", to: "/slick/projecten" },
  { label: "Contacten", to: "/slick/contacten" },
  { label: "Taak Details", to: "/slick/taak-details" },
  { label: "Matrix", to: "/slick/prioriteiten-matrix" },
  { label: "Notitieblok", to: "/slick/notitieblok" },
  { label: "Instellingen", to: "/slick/instellingen" },
  { label: "Tijd", to: "/slick/tijdsregistratie" },
  { label: "Archief", to: "/slick/archief" },
  { label: "Focus", to: "/slick/focus-modus" },
  { label: "Briefing", to: "/slick/dagelijkse-briefing" },
  { label: "Doelen", to: "/slick/doelen-dashboard" },
  { label: "Vergader", to: "/slick/vergader-notities" },
  { label: "Inspiratie", to: "/slick/inspiratie-bord" },
  { label: "Taken", to: "/slick/takenoverzicht" },
  { label: "Statistieken", to: "/slick/statistieken" },
  { label: "Agenda", to: "/slick/agenda-overzicht" },
];

const pillBase = "px-4 py-2 rounded-full border text-xs transition-colors backdrop-blur-md";

/**
 * SlickShell — de glazen panel-shell van de externe plannings-site, 1:1
 * nagebouwd als staging-omgeving. Geen onderdeel van het GIULIA OS-chrome.
 */
export default function SlickShell() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen w-full bg-metal overflow-hidden relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 18% 16%, rgba(224,222,211,0.22) 0%, rgba(242,242,240,0.1) 28%, rgba(45,45,35,0) 60%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8 py-8">
        <div className="rounded-[28px] border border-marble/30 bg-marble/10 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] p-6 sm:p-8">
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {NAV.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    pillBase +
                    (active
                      ? " border-marble/50 bg-marble/25 text-slickstorm"
                      : " border-marble/30 bg-marble/10 text-slickstorm/70 hover:bg-marble/20")
                  }
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
          <div className="h-px bg-marble/20 mb-6" />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/** Tijdelijke placeholder voor nog niet opgebouwde staging-pagina's. */
export function SlickPlaceholder() {
  const { pathname } = useLocation();
  const item = NAV.find((n) => n.to === pathname);
  return (
    <div className="py-24 text-center">
      <p className="text-slickstorm text-lg font-semibold">{item?.label || "Pagina"}</p>
      <p className="text-marble/60 text-sm mt-2">Design wordt opgebouwd — komt eraan.</p>
    </div>
  );
}