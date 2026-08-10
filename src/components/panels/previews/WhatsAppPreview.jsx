import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Row, Empty, SectionLabel, ActionBtn } from "./previewParts";
import { Check, X } from "lucide-react";

export default function WhatsAppPreview({ onOpen }) {
  const [msgs, setMsgs] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
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
  };

  useEffect(() => { load(); }, []);

  const decide = async (d, status) => {
    setDrafts((prev) => prev.filter((x) => x.id !== d.id));
    try {
      await base44.entities.GiuliaDraft.update(d.id, { status });
    } catch (e) {
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Ongelezen" value={msgs.length} accent="hsl(var(--sand))" />
        <Stat label="Drafts" value={drafts.length} accent="hsl(var(--olive))" />
      </div>
      {drafts.length > 0 && (
        <>
          <SectionLabel>Giulia-koncepten ter goedkeuring</SectionLabel>
          <div className="space-y-2">
            {drafts.map((d) => (
              <Row
                key={d.id}
                title={d.content}
                onClick={onOpen}
                accent="hsl(var(--olive))"
                action={
                  <div className="flex items-center gap-1">
                    <ActionBtn icon={Check} label="Goedkeuren" tone="olive" onClick={() => decide(d, "approved")} />
                    <ActionBtn icon={X} label="Afkeuren" onClick={() => decide(d, "rejected")} />
                  </div>
                }
              />
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
            <Row key={m.id} title={m.message} onClick={onOpen} accent="hsl(var(--sand))" />
          ))}
        </div>
      ) : (
        <Empty text="Alles gelezen" />
      )}
    </div>
  );
}