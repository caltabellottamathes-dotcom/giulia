import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Empty, SectionLabel, HeroStat } from "./previewParts";
import { ArrowUpRight } from "lucide-react";
import { groupByLetter } from "@/lib/contacts";

export default function PeoplePreview({ onOpen }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Contact.filter({}, "name", 24);
        setContacts(data || []);
      } catch (e) {} finally { setLoading(false); }
    })();
  }, []);

  const groups = groupByLetter(contacts);
  const recentCount = contacts.filter((c) => c.last_contact_date).length;

  return (
    <div className="space-y-4">
      <HeroStat value={contacts.length} label="Contacten" accent="hsl(var(--blue-grey))" sub={`${recentCount} recent gesproken`} />
      <SectionLabel>Alfabetisch</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : groups.length ? (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 -mr-1">
          {groups.map(({ letter, items }) => (
            <div key={letter}>
              <span className="block text-[10px] font-display font-bold tracking-wider text-ivory/45 mb-1.5 px-1">{letter}</span>
              <div className="space-y-1.5">
                {items.map((c) => (
                  <button
                    key={c.id}
                    onClick={onOpen}
                    className="group animate-fade-up relative w-full text-left flex items-center gap-3 rounded-xl pl-3 pr-2.5 py-2 glass-card-2 hover:bg-white/10 transition-all duration-300 hover:translate-x-0.5"
                  >
                    <span className="h-8 w-8 rounded-full glass-button text-ivory flex items-center justify-center text-[10px] font-semibold shrink-0">
                      {c.name?.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-ivory truncate">{c.name}</span>
                      <span className="block text-[11px] text-ivory/45 truncate">{[c.company, c.role].filter(Boolean).join(" · ")}</span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-ivory/40 group-hover:text-ivory/80 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="Nog geen contacten" />
      )}
    </div>
  );
}