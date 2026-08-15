import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search } from "lucide-react";
import { SectionLabel, Empty } from "../../system/panels/previewParts";

const SORTS = [{ key: "alfabet", label: "Alfabet" }, { key: "categorie", label: "Categorie" }, { key: "recent", label: "Recent" }];
const initials = (n) => (n || "").split(" ").map((w) => w[0]).slice(0, 2).join("");
const CAT_TONE = { Klant: "text-sand", Team: "text-blue-grey", Leverancier: "text-olive", Overig: "text-ivory/55" };
const catOf = (c) => c.relationship_type || "Overig";

/** Mensen module paneel — (naar /slick/contacten) met zoeken + sorteren +
 *  groepering, GIULIA-glass met live Contact-data. */
export default function PeoplePreview({ onOpen }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("alfabet");
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Contact.filter({}, "name", 60);
        setContacts(data || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(
    () => contacts.filter((c) =>
      (c.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(query.toLowerCase())
    ),
    [contacts, query]
  );

  const groups = useMemo(() => {
    if (sort === "alfabet") {
      const m = {};
      filtered.forEach((c) => { const k = (c.name || "?")[0].toUpperCase(); (m[k] = m[k] || []).push(c); });
      return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
    }
    if (sort === "categorie") {
      const m = {};
      filtered.forEach((c) => { const k = catOf(c); (m[k] = m[k] || []).push(c); });
      return Object.entries(m);
    }
    return [["Recent", [...filtered].sort((a, b) => (b.last_contact_date || "").localeCompare(a.last_contact_date || ""))]];
  }, [filtered, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl glass-card-2 border border-white/15 px-3 py-2 w-fit">
          <Search className="w-4 h-4 text-ivory/55" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek op naam of bedrijf…" className="bg-transparent text-ivory text-sm placeholder:text-ivory/40 outline-none w-44 sm:w-56" />
        </div>
        <div className="flex gap-1.5">
          {SORTS.map((s) => (
            <button key={s.key} onClick={() => setSort(s.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${sort === s.key ? "bg-ivory text-charcoal" : "glass-button text-ivory/70 hover:text-ivory"}`}>{s.label}</button>
          ))}
        </div>
      </div>

      <SectionLabel>Contacten</SectionLabel>

      {loading ? (
        <Empty text="Laden…" />
      ) : filtered.length === 0 ? (
        <Empty text="Geen contacten gevonden." />
      ) : (
        <div className="flex flex-col gap-5 max-h-[420px] overflow-y-auto pr-1 -mr-1">
          {groups.map(([label, items]) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-ivory/45 text-xs font-semibold uppercase tracking-wide">{label}</span>
                <div className="flex-1 h-px bg-ivory/12" />
                <span className="text-ivory/35 text-[10px] tabular-nums">{items.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                {items.map((c) => (
                  <div key={c.id} onClick={onOpen} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                    {c.avatar ? (
                      <img src={c.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full glass-button text-ivory flex items-center justify-center text-xs font-medium shrink-0">{initials(c.name)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-ivory text-sm font-medium truncate">{c.name}</p>
                      <p className="text-ivory/50 text-xs truncate">{[c.role, c.company].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className={`text-[10px] ${CAT_TONE[catOf(c)]} hidden sm:block`}>{catOf(c)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}