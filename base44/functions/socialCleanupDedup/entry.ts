import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * socialCleanupDedup — §19 (Social Cleanup / Deduplication). Voorkomt
 * dubbele open SocialOpportunity/SocialIntention-records voor dezelfde
 * combinatie contact+kind.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const [opps, intentions] = await Promise.all([
      sr.entities.SocialOpportunity.filter({ status: "open" }, "-created_date", 200).catch(() => []),
      sr.entities.SocialIntention.filter({ status: "open" }, "-created_date", 200).catch(() => []),
    ]);
    let dismissed = 0;
    const seenOpp = new Set();
    for (const o of opps) {
      const key = `${o.contact_id}:${o.kind}`;
      if (seenOpp.has(key)) { await sr.entities.SocialOpportunity.update(o.id, { status: "dismissed" }).catch(() => null); dismissed++; }
      else seenOpp.add(key);
    }
    const seenInt = new Set();
    for (const i of intentions) {
      const key = `${i.contact_id}:${i.kind}`;
      if (seenInt.has(key)) { await sr.entities.SocialIntention.update(i.id, { status: "dismissed" }).catch(() => null); dismissed++; }
      else seenInt.add(key);
    }
    return Response.json({ ok: true, dismissed });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}