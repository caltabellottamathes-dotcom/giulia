import React from "react";
import { Link, useLocation } from "react-router-dom";
import { usePanel } from "@/lib/PanelContext";
import { MODULE_FUNCTIONS } from "@/lib/moduleFunctions";

const ROUTE_SECTIONS = [
  { test: (p) => p === "/", key: "home" },
  { test: (p) => p.startsWith("/agenda") || p.startsWith("/planning"), key: "agenda" },
  { test: (p) => p.startsWith("/projects"), key: "projects" },
  { test: (p) => p.startsWith("/tasks"), key: "tasks" },
  { test: (p) => p.startsWith("/email"), key: "email" },
  { test: (p) => p.startsWith("/whatsapp"), key: "whatsapp" },
  { test: (p) => p.startsWith("/knowledge"), key: "knowledge" },
  { test: (p) => p.startsWith("/documents"), key: "documents" },
  { test: (p) => p.startsWith("/people"), key: "people" },
  { test: (p) => p.startsWith("/approvals"), key: "approvals" },
  { test: (p) => p.startsWith("/activity"), key: "activity" },
  { test: (p) => p.startsWith("/memory"), key: "memory" },
  { test: (p) => p.startsWith("/insights"), key: "insights" },
  { test: (p) => p.startsWith("/chat"), key: "chat" },
  { test: (p) => p.startsWith("/voice"), key: "voice" },
  { test: (p) => p.startsWith("/settings"), key: "settings" },
  { test: (p) => p.startsWith("/profile"), key: "profile" },
  { test: (p) => p.startsWith("/integrations"), key: "integrations" },
];

function routeSection(pathname) {
  return ROUTE_SECTIONS.find((r) => r.test(pathname))?.key || "home";
}

export default function SectionNavLinks() {
  const { pathname } = useLocation();
  const { activeModule } = usePanel();
  const section = activeModule || routeSection(pathname);
  const links = [{ label: "Home", to: "/" }, ...(MODULE_FUNCTIONS[section] || [])];

  return (
    <nav className="hidden lg:flex fixed top-[4.5rem] left-10 z-20 flex-wrap gap-x-5 gap-y-1.5 max-w-[40rem]">
      {links.map((f) => {
        const active = f.to === "/" ? pathname === "/" : pathname.startsWith(f.to);
        return (
          <Link
            key={f.label}
            to={f.to}
            className={`text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors ${
              active ? "text-foreground" : "text-foreground/55 hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}