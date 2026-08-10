import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Empty, SectionLabel } from "./previewParts";
import { ArrowUpRight } from "lucide-react";

export default function WhatsAppPreview({ onOpen }) {
  const [msgs, setMsgs] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [m, d] = await Promise.all([
          base44.entities.WhatsAppMessage.filter({ status: "unread" }, "-timestamp", 5),
          base44.entities.GiuliaDraft.filter({ type: "whatsapp", status: "awaiting_approval" }, "-created_date", 5),
        ]);
        setMsgs(m || []);
        setDrafts(d || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Ongelezen" value={msgs.length} accent="hsl(var(--sand))" />
        <Stat label="Drafts" value={drafts.length} />
      </div>
      {drafts.length > 0 && (
        <>
          <SectionLabel>Giulia-koncepten ter goedkeuring</SectionLabel>
          <div className="space-y-2">
            {drafts.map((d) => (
              <button
                key={d.id}
                onClick={onOpen}
                className="w-full text-left rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition group flex items-center gap-2"
              >
                <span className="text-sm text-foreground/80 line-clamp-2 flex-1">{d.content}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-foreground/60 transition shrink-0" />
              </button>
            ))}
          </div>
        </>
      )}
      <SectionLabel>Ongelezen berichten</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : msgs.length ? (
        <div className="space-y-2">
          {msgs.map((m) => (
            <button
              key={m.id}
              onClick={onOpen}
              className="w-full text-left rounded-2xl px-4 py-3 glass-1 hover:bg-foreground/5 transition group flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sand shrink-0" />
              <span className="text-sm text-foreground/80 line-clamp-2 flex-1">{m.message}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-foreground/60 transition shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Alles gelezen" />
      )}
    </div>
  );
}