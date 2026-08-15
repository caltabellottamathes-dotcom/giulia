import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ChevronDown } from "lucide-react";
import { PageShell, GlassPanel, GlassButton, SectionHeader, StatusBadge, CATEGORY_COLORS } from "@/system/components/slick/glass";
import { TASKS } from "@/lib/slick/tasks";

export default function Takenoverzicht() {
  const [filter, setFilter] = useState("alle");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return TASKS.filter((t) => {
      const matchStatus = filter === "alle" || t.status === filter;
      const matchQuery = t.title.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [filter, query]);

  const filters = ["alle", "gepland", "lopend", "voltooid"];

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Privé</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Takenoverzicht</h1>
        </div>
        <Link to="/slick">
          <GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton>
        </Link>
      </div>

      <GlassPanel className="p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-marble/30 bg-marble/10 px-3 py-2">
              <Search className="w-4 h-4 text-marble/70" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek taken..."
                className="bg-transparent text-storm text-sm placeholder:text-marble/40 outline-none w-44"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <GlassButton key={f} active={filter === f} onClick={() => setFilter(f)} className="px-3 py-1.5 text-storm text-xs capitalize">
                {f}
              </GlassButton>
            ))}
          </div>
        </div>

        <SectionHeader number={1} title={`Geplande taken (${filtered.length})`} />

        {/* Column list */}
        <div className="mt-4 flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-marble/50 text-sm text-center py-10">Geen taken gevonden.</p>
          )}
          {filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 rounded-2xl border border-marble/25 bg-marble/8 px-4 py-3.5 hover:bg-marble/15 transition-colors"
            >
              <div className="flex flex-col items-center justify-center w-14 shrink-0">
                <span className="text-marble/50 text-[10px] uppercase">{new Date(t.date).toLocaleDateString("nl-NL", { month: "short" })}</span>
                <span className="text-storm text-xl font-semibold leading-none">{new Date(t.date).getDate()}</span>
              </div>
              <div className="w-px h-10 bg-marble/20" />
              <div className="flex-1 min-w-0">
                <p className="text-storm text-sm font-medium truncate">{t.title}</p>
                <p className={`text-xs ${CATEGORY_COLORS[t.category]} mt-0.5`}>{t.category}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-marble/60 text-xs">
                <span>{t.time}</span>
                <span>·</span>
                <span>{t.duration} min</span>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      </GlassPanel>

      <div className="flex justify-end mt-4">
        <button className="px-6 py-3 rounded-full bg-urgent text-metal text-sm font-semibold hover:brightness-105 transition-all shadow-[0_4px_20px_rgba(213,226,74,0.4)] active:scale-95 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nieuwe Taak
        </button>
      </div>
    </PageShell>
  );
}