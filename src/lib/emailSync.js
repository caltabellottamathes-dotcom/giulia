import { base44 } from "@/api/base44Client";

/**
 * syncInbox — thin wrapper die de backend syncEmails-functie aanroept.
 * Eén autoritatief sync-pad (backend) voorkomt duplicaten door consistente
 * uid-typing (String) en dedup tegen alle bestaande records. De frontend
 * maakt zelf GEEN Email-records meer aan.
 */
export async function syncInbox({ limit = 50 } = {}) {
  try {
    const res = await base44.functions.invoke("syncEmails", { limit });
    return { created: res?.added || 0, total: res?.total || 0, updated: res?.updated || 0 };
  } catch (e) {
    return { created: 0, total: 0, error: String(e?.message || e) };
  }
}