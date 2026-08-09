import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { agentDecide, reportToSalvo, notifySalvo } from "../../shared/agent.ts";

/**
 * manageFiles — organizes files: categorizes documents, links to projects,
 * finds important docs, recognizes versions, signals duplicates, and points
 * out relevant files when working on a project.
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

    const uncategorized = uploads.filter((u) => !u.categorized);
    const context = `Uploads (${uploads.length}, ${uncategorized.length} uncategorized):\n` +
      uploads.slice(0, 30).map((u) => `- ${u.filename} | note: ${u.note || ""} | project: ${u.project_id || "?"}`).join("\n") +
      `\n\nDocumenten: ${documents.slice(0, 20).map((d) => d.name).join(", ")}` +
      `\n\nProjecten: ${projects.map((p) => p.title).join(", ")}`;

    const schema = {
      type: "object",
      properties: {
        message: { type: "string" },
        categorize: { type: "array", items: { type: "object", properties: { id: { type: "string" }, project_id: { type: "string" }, note: { type: "string" } } } },
        duplicates: { type: "array", items: { type: "string" } },
        attention: { type: "boolean" },
      },
      required: ["message"],
    };

    const decision = await agentDecide(
      base44, "manageFiles",
      "Ordent bestanden: categoriseer, koppel aan projecten, herken versies en duplicaten. Wijs op relevante bestanden bij werk aan projecten.",
      context, schema
    );

    if (decision?.categorize) {
      for (const c of decision.categorize) {
        const patch = { categorized: true };
        if (c.project_id) patch.project_id = c.project_id;
        if (c.note) patch.note = c.note;
        await sr.entities.Upload.update(c.id, patch).catch(() => {});
      }
    }

    if (decision?.attention) {
      await reportToSalvo(base44, "manageFiles", decision.message);
      await notifySalvo(base44, "Bestanden", decision.message);
    }

    return Response.json({ ok: true, uncategorized: uncategorized.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}