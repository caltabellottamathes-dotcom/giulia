import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent } from "../../shared/codeAgent.ts";

/**
 * manageFiles (Agent 6 — File Agent). Real code agent.
 * Trigger: on uploads + daily.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [uploads, documents, projects] = await Promise.all([
      sr.entities.Upload.list().catch(() => []),
      sr.entities.Document.list().catch(() => []),
      sr.entities.Project.list().catch(() => []),
    ]);

    const tools = {
      list_uploads: tool({ description: "Alle uploads.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Upload.list().catch(() => []).then(l => l.map(u => ({ id: u.id, filename: u.filename, note: u.note, project_id: u.project_id, categorized: u.categorized }))) }),
      list_documents: tool({ description: "Alle documenten.", inputSchema: { type: "object", properties: {} }, execute: () => sr.entities.Document.list().catch(() => []).then(l => l.map(d => ({ id: d.id, name: d.name, type: d.type, project_id: d.project_id }))) }),
      categorize_upload: tool({ description: "Categoriseer een upload + koppel aan project.", inputSchema: { type: "object", properties: { id: { type: "string" }, project_id: { type: "string" }, note: { type: "string" } }, required: ["id"] }, execute: ({ id, project_id, note }) => sr.entities.Upload.update(id, { categorized: true, ...(project_id ? { project_id } : {}), ...(note ? { note } : {}) }).catch(() => null) }),
    };

    const uncategorized = uploads.filter(u => !u.categorized);
    const context = `Uploads (${uploads.length}, ${uncategorized.length} uncategorized):\n` + uploads.slice(0, 30).map(u => `- id:${u.id} | ${u.filename} | project: ${u.project_id || "?"}`).join("\n") + `\n\nProjecten: ${projects.map(p => p.id + ":" + p.title).join(", ")}`;
    const task = `Ordent bestanden: categoriseer ongeregistreerde uploads (categorize_upload), koppel aan projecten, herken versies en duplicaten (signaleer via report_to_salvo). Wijs op relevante bestanden bij werk aan projecten.\n\n${context}`;

    await runGiuliaAgent(base44, "manageFiles", task, tools, 6);
    return Response.json({ ok: true, uncategorized: uncategorized.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}