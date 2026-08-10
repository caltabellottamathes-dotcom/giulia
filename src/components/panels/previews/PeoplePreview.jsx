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
        <Stat label="Recent" value={contacts.filter((c) => c.last_contact_date).length} accent="hsl(var(--sand))" />
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
              className="group animate-fade-up relative w-full text-left flex items-center gap-3 rounded-2xl pl-4 pr-3 py-3 glass-1 hover:bg-foreground/[0.04] transition-all duration-300 hover:translate-x-0.5"
            >
              <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: "hsl(var(--blue-grey))" }} />
              <span className="h-9 w-9 rounded-full glass-1 flex items-center justify-center text-[11px] font-semibold text-foreground/70 shrink-0">
                {c.name?.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground truncate">{c.name}</span>
                <span className="block text-xs text-foreground/50 truncate">
                  {[c.company, c.role].filter(Boolean).join(" · ")}
                </span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-foreground/70 transition shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Nog geen contacten" />
      )}
    </div>
  );
}