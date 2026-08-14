import React from "react";
import { Link } from "react-router-dom";
// staging-sync

export function Head({ title, sub, tag, right }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/slick" className="text-marble/60 text-xs hover:text-slickstorm transition-colors">
            ← Terug
          </Link>
          {tag && (
            <span className="text-[10px] uppercase tracking-wider rounded-full border border-marble/30 bg-marble/10 px-2 py-0.5 text-marble/70">
              {tag}
            </span>
          )}
        </div>
        {right}
      </div>
      <h1 className="text-slickstorm text-2xl sm:text-3xl font-bold tracking-tight mt-2">{title}</h1>
      {sub && <p className="text-marble/60 text-sm mt-1">{sub}</p>}
    </div>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`rounded-2xl border border-marble/30 bg-marble/10 backdrop-blur-md ${className}`} {...props}>
      {children}
    </div>
  );
}