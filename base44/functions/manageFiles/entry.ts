import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * manageFiles — deterministische scanner, GEEN eigen Gemini-brein meer.
 * Categoriseert niets zelf via AI meer; signaleert ongeregistreerde uploads
 * aan GIULIA-GIULIA (via chatWithGiulia) die kan besluiten een taak aan te maken.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const uploads = await sr.entities.Upload.list("-created_date", 200).catch(() => []);
    const uncategorized = uploads.filter((u) => !u.categorized);
    if (!uncategorized.length) return Response.json({ ok: true, uncategorized: 0, skipped: "alles gecategoriseerd" });

    const projects = await sr.entities.Project.list("-created_date", 100).catch(() => []);
    const context = `Ongeregistreerde uploads (${uncategorized.length}):\n` +
      uncategorized.slice(0, 20).map((u) => `- id:${u.id} | ${u.filename}`).join("\n") +
      `\n\nProjecten: ${projects.map((p) => `${p.id}:${p.title}`).join(", ")}`;
    const message = `Bestanden-scan: bepaal of ongeregistreerde uploads bij een project horen en of daar een taak uit voortkomt (create_task).\n\n${context}`;

    await base44.functions.invoke("chatWithGiulia", { message, source: "agent_files", persist: false }).catch(() => null);

    return Response.json({ ok: true, uncategorized: uncategorized.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}