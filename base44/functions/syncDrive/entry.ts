import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * syncDrive — lists recent files from the connected Google Drive and stores
 * them in the Document entity (deduped by url), status "recent".
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');
    const h = { Authorization: `Bearer ${accessToken}` };

    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=50&orderBy=modifiedTime desc&fields=files(id,name,mimeType,webViewLink,modifiedTime)',
      { headers: h }
    );
    if (!res.ok) {
      return Response.json({ error: 'drive list failed', detail: await res.text() }, { status: 502 });
    }
    const data = await res.json();
    const files = data.files || [];

    const existing = await base44.entities.Document.filter({});
    const seen = new Set(existing.map((d) => d.url).filter(Boolean));

    let added = 0;
    for (const f of files) {
      const url = f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`;
      if (seen.has(url)) continue;
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      const type = ['pdf'].includes(ext)
        ? 'pdf'
        : ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)
        ? 'image'
        : ['xlsx', 'csv'].includes(ext)
        ? 'sheet'
        : ['fig'].includes(ext)
        ? 'figma'
        : ['doc', 'docx'].includes(ext)
        ? 'doc'
        : 'other';
      await base44.entities.Document.create({
        name: f.name,
        type,
        url,
        status: 'recent',
        owner: 'Google Drive',
      });
      added++;
    }

    return Response.json({ added, total: files.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}