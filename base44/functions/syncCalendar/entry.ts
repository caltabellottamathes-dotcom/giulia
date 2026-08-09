import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * syncCalendar — pulls upcoming Google Calendar events into the Event entity
 * (deduped by title+start). Works both with a logged-in user (app-user token,
 * records owned by the user) and without (scheduled/service-role). The
 * Google Calendar connector is shared, so asServiceRole.connectors works
 * in both cases.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const ent = user ? base44.entities : base44.asServiceRole.entities;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const h = { Authorization: `Bearer ${accessToken}` };

    const now = new Date();
    const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=60&singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`,
      { headers: h }
    );
    if (!res.ok) {
      return Response.json({ error: 'calendar list failed', detail: await res.text() }, { status: 502 });
    }
    const data = await res.json();
    const items = data.items || [];

    const existing = await ent.Event.list();
    const seen = new Set(
      existing.map((e) => `${(e.title || '').trim()}|${(e.start || '').slice(0, 16)}`)
    );

    let added = 0;
    for (const it of items) {
      const start = it.start?.dateTime || it.start?.date;
      const end = it.end?.dateTime || it.end?.date;
      if (!start) continue;
      const key = `${(it.summary || '').trim()}|${(start || '').slice(0, 16)}`;
      if (seen.has(key)) continue;
      await ent.Event.create({
        title: it.summary || '(geen titel)',
        start,
        end,
        location: it.location || '',
        attendees: (it.attendees || []).map((a) => a.email).filter(Boolean),
      });
      added++;
    }

    return Response.json({ ok: true, added, total: items.length, mode: user ? 'user' : 'service' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}