import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Empty, SectionLabel } from "./previewParts";
import { ArrowUpRight } from "lucide-react";

export default function PeoplePreview({ onOpen }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Contact.filter({}, "-last_contact_date", 6);
        setContacts(data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Contacten" value={contacts.length} accent="hsl(var(--blue-grey))" />
        <Stat label="Recent" value={contacts.filter((c) => c.last_contact_date).length} />
      </div>
      <SectionLabel>Recent in contact</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : contacts.length ? (
        <div className="space-y-2">
          {contacts.map((c) => (
            <button
              key={c.id}
              onClick={onOpen}
              className="w-full text-left flex items-center gap-3 rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition group"
            >
              <span className="h-8 w-8 rounded-full glass-1 flex items-center justify-center text-[11px] font-semibold text-foreground/70 shrink-0">
                {c.name?.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground truncate">{c.name}</span>
                <span className="block text-xs text-foreground/50 truncate">
                  {[c.company, c.role].filter(Boolean).join(" · ")}
                </span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-foreground/60 transition shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Nog geen contacten" />
      )}
    </div>
  );
}