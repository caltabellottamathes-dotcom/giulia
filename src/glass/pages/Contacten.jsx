import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { PageShell, GlassButton, Divider } from "@/glass/components/glass";
import { CONTACTS } from "@/glass/lib/contacts";

const SORTS = [
  { key: "alfabet", label: "Alfabet" },
  { key: "categorie", label: "Categorie" },
  { key: "recent", label: "Recent" },
];

const CAT_TONE = { Klant: "text-urgent", Team: "text-sky", Leverancier: "text-sand" };
const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");

export default function Contacten() {
  const [sort, setSort] = useState("alfabet");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => CONTACTS.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.company.toLowerCase().includes(query.toLowerCase())
    ),
    [query]
  );

  const groups = useMemo(() => {
    if (sort === "alfabet") {
      const map = {};
      filtered.forEach((c) => { const k = c.name[0].toUpperCase(); (map[k] = map[k] || []).push(c); });
      return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    }
    if (sort === "categorie") {
      const map = {};
      filtered.forEach((c) => { (map[c.category] = map[c.category] || []).push(c); });
      return Object.entries(map);
    }
    return [["Recent", [...filtered].sort((a, b) => b.last.localeCompare(a.last))]];
  }, [filtered, sort]);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Netwerk</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Contacten</h1>
        </div>
        <Link to="/"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-5">
        <div className="flex items-center gap-2 rounded-xl border border-marble/30 bg-marble/10 px-3 py-2">
          <Search className="w-4 h-4 text-marble/70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek op naam of bedrijf..."
            className="bg-transparent text-storm text-sm placeholder:text-marble/40 outline-none w-56"
          />
        </div>
        <div className="flex gap-2">
          {SORTS.map((s) => (
            <GlassButton key={s.key} active={sort === s.key} onClick={() => setSort(s.key)} className="px-3 py-1.5 text-storm text-xs">
              {s.label}
            </GlassButton>
          ))}
        </div>
      </div>

      <Divider className="mb-5" />

      <div className="flex flex-col gap-6">
        {groups.map(([label, items]) => (
          <div key={label}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-marble/50 text-xs font-semibold uppercase tracking-wide">{label}</span>
              <div className="flex-1 h-px bg-marble/15" />
              <span className="text-marble/40 text-[10px] tabular-nums">{items.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              {items.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-marble/10 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-metal border border-marble/30 flex items-center justify-center text-marble text-xs font-medium shrink-0">
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-storm text-sm font-medium truncate">{c.name}</p>
                    <p className="text-marble/50 text-xs truncate">{c.role} · {c.company}</p>
                  </div>
                  <span className={`text-[10px] ${CAT_TONE[c.category]} hidden sm:block`}>{c.category}</span>
                  <span className="text-marble/40 text-[10px] tabular-nums hidden md:block">{c.last}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-marble/50 text-sm text-center py-10">Geen contacten gevonden.</p>}
      </div>
    </PageShell>
  );
}