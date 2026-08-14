import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { titleSimilarity } from '../../shared/codeAgent.ts';

// Domein 13 — categoriseer op bestandsnaam-patronen (geen credits nodig).
function detectDocumentType(filename) {
  const f = (filename || "").toLowerCase();
  if (/factuur|invoice/.test(f)) return "invoice";
  if (/contract|overeenkomst/.test(f)) return "contract";
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(f)) return "image";
  if (/notulen|notes|verslag/.test(f)) return "notes";
  if (/protocol|reference|handboek/.test(f)) return "reference";
  return "other";
}

// Versie-herkenning: strip versie-markers (_v2, (2), _final, -final) om de
// "basisnaam" te krijgen; fuzzy-match (≥85%) binnen hetzelfde project.
function baseFilename(filename) {
  return (filename || "").toLowerCase().replace(/(_v\d+|\(\d+\)|_final|-final|_copy)/g, "").trim();
}

/**
 * manageFiles — deterministische scanner, GEEN eigen Gemini-brein meer.
 * Categoriseert uploads op document_type + herkent versies binnen hetzelfde
 * project (Domein 13), en signaleert de rest aan GIULIA-GIULIA (via
 * chatWithGiulia) die kan besluiten een taak aan te maken.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const uploads = await sr.entities.Upload.list("-created_date", 200).catch(() => []);
    const uncategorized = uploads.filter((u) => !u.categorized);
    if (!uncategorized.length) return Response.json({ ok: true, uncategorized: 0, skipped: "alles gecategoriseerd" });

    // Categoriseer + versie-koppeling
    let versioned = 0;
    for (const u of uncategorized) {
      const document_type = detectDocumentType(u.filename);
      const base = baseFilename(u.filename);
      const candidates = uploads.filter((o) => o.id !== u.id && o.project_id === u.project_id);
      let version_of = null;
      for (const c of candidates) {
        if (titleSimilarity(base, baseFilename(c.filename)) >= 0.85) { version_of = c.id; break; }
      }
      await sr.entities.Upload.update(u.id, {
        document_type,
        categorized: true,
        ...(version_of ? { version_of, version_number: (uploads.find((o) => o.id === version_of)?.version_number || 1) + 1 } : {}),
      }).catch(() => null);
      if (version_of) versioned++;
    }

    const projects = await sr.entities.Project.list("-created_date", 100).catch(() => []);
    const context = `Ongeregistreerde uploads (${uncategorized.length}):\n` +
      uncategorized.slice(0, 20).map((u) => `- id:${u.id} | ${u.filename} | type ${detectDocumentType(u.filename)}`).join("\n") +
      `\n\nProjecten: ${projects.map((p) => `${p.id}:${p.title}`).join(", ")}`;
    const message = `Bestanden-scan: bepaal of ongeregistreerde uploads bij een project horen en of daar een taak uit voortkomt (create_task).\n\n${context}`;

    await base44.functions.invoke("chatWithGiulia", { message, source: "agent_files", persist: false }).catch(() => null);

    return Response.json({ ok: true, uncategorized: uncategorized.length, versioned });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}