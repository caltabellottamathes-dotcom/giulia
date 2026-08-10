import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Row, Empty, SectionLabel, ActionBtn, HeroStat, BarDistribution } from "./previewParts";
import { format } from "date-fns";
import { RefreshCw, Check } from "lucide-react";

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

  const markRead = async (e) => {
    setEmails((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: "read" } : x)));
    try {
      await base44.entities.Email.update(e.id, { status: "read" });
    } catch (e2) {
      load();
    }
  };

  const unread = emails.filter((e) => e.status === "unread");
  const important = emails.filter((e) => e.important);
  const read = emails.length - unread.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-stretch">
        <HeroStat
          value={unread.length}
          label="Ongelezen"
          accent="hsl(var(--blue-grey))"
          sub={`${important.length} belangrijk`}
          visual={
            <BarDistribution
              segments={[
                { value: unread.length, color: "hsl(var(--blue-grey))" },
                { value: important.length, color: "hsl(var(--sand))" },
                { value: read, color: "hsl(var(--foreground) / 0.15)" },
              ]}
            />
          }
        />
        <button
          onClick={sync}
          disabled={syncing}
          className="animate-fade-up rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06] px-4 py-3 flex flex-col items-center justify-center gap-1.5 hover:bg-foreground/[0.06] transition disabled:opacity-50"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/50 font-semibold">Sync</span>
          <RefreshCw className={"h-5 w-5 text-foreground " + (syncing ? "animate-spin" : "")} />
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
              action={e.status === "unread" ? <ActionBtn icon={Check} label="Markeer gelezen" onClick={() => markRead(e)} /> : undefined}
            />
          ))}
        </div>
      ) : (
        <Empty text="Postvak leeg" />
      )}
    </div>
  );
}