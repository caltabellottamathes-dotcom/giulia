import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Stat, Row, Empty, SectionLabel } from "./previewParts";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";

export default function EmailPreview({ onOpen }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    try {
      const data = await base44.entities.Email.filter({ folder: { $in: ["inbox", "important"] } }, "-timestamp", 6);
      setEmails(data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sync = async () => {
    setSyncing(true);
    try {
      await base44.functions.syncGmail.invoke({});
      await load();
    } catch (e) {
    } finally {
      setSyncing(false);
    }
  };

  const unread = emails.filter((e) => e.status === "unread");
  const important = emails.filter((e) => e.important);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Ongelezen" value={unread.length} accent="hsl(var(--blue-grey))" />
        <Stat label="Belangrijk" value={important.length} />
        <button
          onClick={sync}
          disabled={syncing}
          className="glass-1 rounded-2xl px-4 py-3 flex flex-col items-start gap-1.5 hover:bg-foreground/5 transition disabled:opacity-50"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 font-semibold">Sync</span>
          <RefreshCw className={`h-5 w-5 text-foreground ${syncing ? "animate-spin" : ""}`} />
        </button>
      </div>
      <SectionLabel>Recent · mail@salvatorecaltabellotta.com</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : emails.length ? (
        <div className="space-y-2">
          {emails.map((e) => (
            <Row
              key={e.id}
              title={e.subject}
              sub={`${e.sender || ""} · ${e.timestamp ? format(new Date(e.timestamp), "d MMM HH:mm") : ""}`}
              onClick={onOpen}
              accent={e.important ? "hsl(var(--sand))" : undefined}
            />
          ))}
        </div>
      ) : (
        <Empty text="Postvak leeg" />
      )}
    </div>
  );
}