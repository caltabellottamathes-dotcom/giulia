import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Row, Empty, SectionLabel, HeroStat } from "./previewParts";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export default function AgendaPreview({ onOpen }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const now = new Date().toISOString();
        const data = await base44.entities.CalendarEvent.filter({ start: { $gte: now } }, "start", 6);
        setEvents(data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const today = events.filter((e) => new Date(e.start).toDateString() === new Date().toDateString());

  return (
    <div className="space-y-4">
      <HeroStat value={today.length} label="Vandaag" accent="hsl(var(--sand))" sub={`${events.length} afspraken in de pipeline`} />
      <SectionLabel>Volgende afspraken</SectionLabel>
      {loading ? (
        <Empty text="Laden…" />
      ) : events.length ? (
        <div className="space-y-2">
          {events.map((e) => (
            <Row
              key={e.id}
              title={e.title}
              sub={`${format(new Date(e.start), "EEE d MMM · HH:mm", { locale: nl })}${e.location ? " · " + e.location : ""}`}
              onClick={onOpen}
              accent="hsl(var(--sand))"
            />
          ))}
        </div>
      ) : (
        <Empty text="Geen afspraken in de pipeline" />
      )}
    </div>
  );
}