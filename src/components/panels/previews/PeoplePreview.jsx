import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Empty, SectionLabel, HeroStat } from "./previewParts";
import { ArrowUpRight } from "lucide-react";

export default function PeoplePreview({ onOpen }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Contact.filter({}, "-last_contact_date", 6);
        setContacts(data || []);
      } catch (e) {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <HeroStat value={contacts.length} label="Contacten" accent="hsl(var(--blue-grey))" sub={`${contacts.filter((c) => c.last_contact_date).length} recent gesproken`} />
      <SectionLabel>Recent in contact</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : contacts.length ? (
        <div className="space-y-2">
          {contacts.map((c) => (
            <button key={c.id} onClick={onOpen} className="group animate-fade-up relative w-full text-left flex items-center gap-3 rounded-2xl pl-4 pr-3 py-3 glass-card-2 hover:bg-white/10 transition-all duration-300 hover:translate-x-0.5">
              <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: "hsl(var(--blue-grey))" }} />
              <span className="h-9 w-9 rounded-full glass-button text-ivory flex items-center justify-center text-[11px] font-semibold shrink-0">
                {c.name?.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ivory truncate">{c.name}</span>
                <span className="block text-xs text-ivory/50 truncate">{[c.company, c.role].filter(Boolean).join(" · ")}</span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-ivory/40 group-hover:text-ivory/80 transition shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Nog geen contacten" />
      )}
    </div>
  );
}