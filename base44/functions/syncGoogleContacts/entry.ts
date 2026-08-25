import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { loadContacts, matchContact } from "../../shared/contactResolver.ts";

/**
 * syncGoogleContacts — trekt alle contacten uit Google Contacts (People API)
 * en synchroniseert ze naar de Contact-entity. Google Contacts is de MASTER:
 * hier worden nieuwe contacten aangemaakt; overal elders in het OS wordt alleen
 * gekoppeld aan bestaande contacten (contactResolver). Bestaande contacten
 * worden aangevuld (gaten gevuld), nooit overschreven.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const conn = await sr.connectors.getConnection("google_contacts").catch(() => null);
    const accessToken = conn?.accessToken;
    if (!accessToken) return Response.json({ error: "Google Contacts niet verbonden" }, { status: 400 });

    const existing = await loadContacts(sr.entities);
    let synced = 0, created = 0, updated = 0, total = 0;
    let pageToken = "";
    let pages = 0;

    while (pages < 10) {
      const url = new URL("https://people.googleapis.com/v1/people/me/connections");
      url.searchParams.set("personFields", "names,emailAddresses,phoneNumbers,organizations,biographies,photos");
      url.searchParams.set("pageSize", "1000");
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) {
        const err = await res.text().catch(() => "");
        return Response.json({ error: `People API ${res.status}: ${err.slice(0, 200)}` }, { status: 502 });
      }
      const data = await res.json();
      const people = Array.isArray(data.connections) ? data.connections : [];
      total += people.length;

      for (const p of people) {
        const n = p.names?.[0];
        const name = (n?.displayName || [n?.givenName, n?.familyName].filter(Boolean).join(" ")).trim();
        if (!name) continue;
        const email = p.emailAddresses?.[0]?.value || "";
        const phone = p.phoneNumbers?.[0]?.value || "";
        const company = p.organizations?.[0]?.name || "";
        const role = p.organizations?.[0]?.title || "";
        const notes = p.biographies?.[0]?.value || "";
        const avatar = p.photos?.[0]?.url || "";

        const match = matchContact(existing, { email, phone, name });
        if (match) {
          const patch = {};
          if (!match.email && email) patch.email = email;
          if (!match.phone && phone) patch.phone = phone;
          if (!match.company && company) patch.company = company;
          if (!match.role && role) patch.role = role;
          if (!match.avatar && avatar) patch.avatar = avatar;
          if (!match.notes && notes) patch.notes = notes;
          if (match.agent_source !== "google_contacts") patch.agent_source = "google_contacts";
          if (Object.keys(patch).length) {
            await sr.entities.Contact.update(match.id, patch).catch(() => null);
            updated++;
          }
          synced++;
        } else {
          const c = await sr.entities.Contact.create({
            name, email, phone, company, role, avatar, notes,
            status: "confirmed",
            agent_source: "google_contacts",
          }).catch(() => null);
          if (c) { created++; existing.push(c); }
          synced++;
        }
      }

      pageToken = data.nextPageToken || "";
      pages++;
      if (!pageToken) break;
    }

    return Response.json({ ok: true, total, synced, created, updated, pages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}