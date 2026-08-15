import React from "react";

export function PageShell({ children, maxWidth = "max-w-6xl" }) {
  return (
    <div className="min-h-screen w-full bg-metal overflow-hidden relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 18% 16%, rgba(224,222,211,0.22) 0%, rgba(242,242,240,0.10) 28%, rgba(45,45,35,0) 60%)",
        }}
      />
      <div className={`relative z-10 mx-auto ${maxWidth} px-4 sm:px-8 py-8`}>
        <GlassPanel className="p-6 sm:p-8">{children}</GlassPanel>
      </div>
    </div>
  );
}

export function Divider({ className = "" }) {
  return <div className={`h-px bg-marble/20 ${className}`} />;
}

export function GlassPanel({ className = "", children }) {
  return (
    <div className={`rounded-[28px] border border-marble/30 bg-marble/10 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] ${className}`}>
      {children}
    </div>
  );
}

export function GlassButton({ active = false, className = "", children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border border-marble/30 bg-marble/10 backdrop-blur-md transition-all duration-200 hover:bg-marble/20 active:scale-95 ${
        active ? "bg-marble/25 shadow-inner ring-1 ring-urgent/40" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-2 text-marble/70">
      {number != null && <span className="text-xs font-medium tabular-nums">({number})</span>}
      <span className="text-xs font-medium tracking-wide">{title}</span>
    </div>
  );
}

export const CATEGORY_COLORS = {
  Marktonderzoek: "text-clay",
  "Concept Brons": "text-sand",
  Identiteit: "text-sky",
  Afspraken: "text-urgent",
  Onderzoek: "text-marble",
};

export const CATEGORY_HEX = {
  Marktonderzoek: "#868564",
  "Concept Brons": "#94925D",
  Identiteit: "#B1BEC6",
  Afspraken: "#d5e24a",
  Onderzoek: "#E0DED3",
};

export function StatusBadge({ status }) {
  const map = {
    voltooid: "bg-urgent/20 text-urgent border-urgent/40",
    lopend: "bg-sky/20 text-sky border-sky/40",
    gepland: "bg-marble/15 text-marble border-marble/40",
  };
  const label = { voltooid: "Voltooid", lopend: "Lopend", gepland: "Gepland" }[status] || status;
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${map[status] || map.gepland}`}>
      {label}
    </span>
  );
}