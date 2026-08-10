import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Row, Empty, SectionLabel, HeroStat } from "./previewParts";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

const PALETTE = [
  "hsl(var(--olive))",
  "hsl(var(--sand))",
  "hsl(var(--ridge))",
  "hsl(var(--powder))",
  "hsl(var(--steel))",
  "hsl(var(--stone))",
];
const accentFor = (s = "") => {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

export default function AgendaPreview({ onOpen }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Event.list("start").catch(() => []);
        const now = Date.now();
        setEvents((data || []).filter((e) => new Date(e.start).getTime() >= now - 24 * 3600 * 1000).slice(0, 6));
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const today = events.filter((e) => new Date(e.start).toDateString() === new Date().toDateString());

  return (
    <div className="space-y-4">
      <HeroStat value={today.length} label="Vandaag" accent="hsl(var(--olive))" sub={`${events.length} afspraken in de pipeline`} />
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
              accent={accentFor(e.title)}
            />
          ))}
        </div>
      ) : (
        <Empty text="Geen afspraken in de pipeline" />
      )}
    </div>
  );
}