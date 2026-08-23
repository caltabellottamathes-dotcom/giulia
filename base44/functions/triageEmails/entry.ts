import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent, createApproval } from "../../shared/codeAgent.ts";

// Domein 8: een directe vraag, deadline of verzoek om reactie → awaiting_response.
const AWAITING_RESPONSE = /(kun je|kan je|laat.*weten|graag.*reactie|graag.*antwoord|zou je|wanneer.*kan|wat denk je|\?)/i;

/**
 * triageEmails — sorteert de inbox in categorieën (important / advertising /
 * newsletter / junk / spam), koppelt projectgerelateerde mails aan het juiste
 * project (email.project_id), en zet alles wat geen persoonlijk gerichte mail
 * is (reclame, nieuwsbrieven, notificaties, spam) direct in "archived" zodat
 * de inbox alleen echte mail toont.
 *
 * Giulia stelt GEEN concept-antwoorden meer proactief voor — dat gebeurt
 * alleen nog als Salvo zelf op "Door Giulia" klikt bij een email (draftEmailReply).
 *
 * Werkt in twee lagen:
 *  1. Heuristische pre-pass (geen credits) — classificatie + archivering + project-koppeling.
 *  2. LLM-agent (runGiuliaAgent) — haalt alleen acties/deadlines/commitments uit
 *     belangrijke mail (create_task). Slaat stil door als dit faalt; de
 *     heuristische laag blijft dan geldig.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const [emails, projects] = await Promise.all([
      sr.entities.Email.filter({ folder: 'inbox' }).catch(() => []),
      sr.entities.Project.list().catch(() => []),
    ]);
    // Verwerk ALLE inbox-emails bij elke aanroep — de sorteerknop moet
    // altijd opnieuw sorteren, ook als alles al getriaged was.
    const untriaged = emails;

    // === Laag 1 — heuristische classificatie + project-koppeling (geen credits) ===
    const ADVERTISING = /(unsubscribe|uitgeschreven|afmelden|sale|solden|korting|aanbieding|deal|promo|winkelwagen|cart|free shipping|actie|uitverkoop|offerte|early access|order now|bevestig je|abonnement)/i;
    const SPAM = /(winner|lottery|crypto|bitcoin|investment opportunity|urgent fund|claim your|congratulations you|viagra|casino|loan offer|prize|secured link|verify your account|suspended)/i;
    const NEWSLETTER = /(newsletter|nieuwsbrief|weekly digest|this week in|issue #|vol \d|digest|roundup|the edition)/i;
    const JUNK = /(no-?reply|noreply|donotreply|do.?not.?reply|notifications?|notify|mailer|updates@|team@|automated|automatisch|postmaster|bounce|alert|monitoring|statusupdate)/i;
    // Bekende mass-mail afzenders die zelden persoonlijk gericht zijn.
    const MASS_SENDER_DOMAINS = /(linkedin\.com|dezeen\.com|substack\.com|mailchimp|sendgrid|hubspot|medium\.com|eventbrite|meetup\.com|glassdoor|indeed\.com)/i;

    const heurCategory = (e) => {
      const text = `${e.subject || ''} ${e.body || ''} ${e.sender || ''} ${e.sender_email || ''}`.toLowerCase();
      if (SPAM.test(text)) return 'spam';
      if (MASS_SENDER_DOMAINS.test(e.sender_email || '')) return 'advertising';
      if (NEWSLETTER.test(text) || /newsletter|nieuwsbrief/.test(e.sender_email || '')) return 'newsletter';
      if (ADVERTISING.test(text)) return 'advertising';
      if (JUNK.test(e.sender_email || '')) return 'junk';
      return 'important';
    };

    const projectMatch = (e) => {
      const text = `${e.subject || ''} ${e.body || ''} ${e.sender || ''} ${e.sender_email || ''}`.toLowerCase();
      for (const p of projects) {
        const title = (p.title || '').toLowerCase().trim();
        if (title.length > 3 && text.includes(title)) return p.id;
      }
      return null;
    };

    const updates = [];
    for (const e of untriaged) {
      const category = heurCategory(e);
      const projectId = projectMatch(e);
      const isNoise = category !== 'important';
      const text = `${e.subject || ''} ${e.body || ''}`;
      const awaiting = !isNoise && AWAITING_RESPONSE.test(text);
      updates.push(
        sr.entities.Email.update(e.id, {
          category,
          project_id: projectId || null,
          triaged: true,
          ...(isNoise ? { folder: 'archived', status: 'read' } : { important: true, awaiting_response: awaiting }),
        }).catch(() => null)
      );
    }
    await Promise.all(updates);

    // Ruim non-important op: verwijder alles in Reclame/Nieuwsbrief/Onbelangrijk/Spam
    // dat langer dan 2 weken in de map staat (folder: archived).
    const cutoff = new Date(Date.now() - 14 * 24 * 3600 * 1000);
    const archived = await sr.entities.Email.filter({ folder: 'archived' }).catch(() => []);
    const stale = archived.filter((e) => ["advertising", "newsletter", "junk", "spam"].includes(e.category) && new Date(e.updated_date || e.created_date || 0) < cutoff);
    if (stale.length) await sr.entities.Email.deleteMany({ id: { $in: stale.map((e) => e.id) } }).catch(() => {});

    // GEEN proactieve concept-antwoorden meer — Salvo vraagt dat zelf aan via
    // de "Giulia antwoordt"-knop bij een email (draftEmailReply).

    // === Laag 2 — LLM-agent: verfijning + concept-antwoorden ===
    const tools = {
      list_important: tool({
        description: 'Als important geclassificeerde emails die mogelijk een antwoord nodig hebben.',
        inputSchema: { type: 'object', properties: {} },
        execute: () =>
          sr.entities.Email.filter({ folder: 'inbox' }).catch(() => [])
            .then((l) => l.filter((e) => e.category === 'important').slice(0, 30)
              .map((e) => ({ id: e.id, sender: e.sender, sender_email: e.sender_email, subject: e.subject, body: String(e.body || '').slice(0, 500), project_id: e.project_id }))),
      }),
      propose_task: tool({
        description: 'Stel een actie/taak voor uit een email. Giulia legt deze TER GOEDKEURING bij Salvo via een Approval — maak GEEN directe Task aan.',
        inputSchema: { type: 'object', properties: { title: { type: 'string' }, priority: { type: 'string' }, deadline: { type: 'string' }, project_id: { type: 'string' }, description: { type: 'string' } }, required: ['title'] },
        execute: async ({ title, priority, deadline, project_id, description }) => {
          const ap = await createApproval(base44, 'task', `Voorgestelde taak: ${title}`, description || '', 'Uit email gehaald door Giulia — wacht op goedkeuring.', 'salvo', {
            category: project_id ? 'projects' : 'intern',
            ...(project_id ? { project_id } : {}),
            proposed_action: { title, priority: priority || 'medium', deadline: deadline || '', project_id: project_id || '', description: description || '' },
          });
          return ap ? { id: ap.id, title } : { error: 'create failed' };
        },
      }),
    };

    const task =
      'Sorteer de inbox is al heuristisch gedaan. Jouw taak: gebruik list_important om emails met category "important" te bekijken. ' +
      'Stel UITSLUITEND een taak voor via propose_task als de email een concrete actie bevat die SALVO ZELF moet uitvoeren met een duidelijke deadline/commitment (iemand verwacht dat hij iets doet). ' +
      'Negeer informatieve updates, bevestigingen, nieuwsbrieven, de plannen van de afzender, en kleine dagelijkse dingen (eten, boodschappen, "laat je weten", vrijblijvende meldingen, receipts, statusupdates). ' +
      'Twijfel je? Stel dan NIETS voor — liever nul voorstellen dan rommel. ' +
      'Schrijf ZELF GEEN concept-antwoorden en maak GEEN Approval voor een email-antwoord — Salvo vraagt dat zelf aan via de "Door Giulia"-knop bij een email. ' +
      'Rapporteer via report_to_salvo kort hoeveel voorstellen je hebt gedaan (vaak nul).';

    await runGiuliaAgent(base44, 'triageEmails', task, tools, 10).catch(() => null);

    // === Samenvatting ===
    const [allInbox, drafts] = await Promise.all([
      sr.entities.Email.filter({ folder: 'inbox' }).catch(() => []),
      sr.entities.Email.filter({ folder: 'giulia_drafts' }).catch(() => []),
    ]);
    const counts = { important: 0, advertising: 0, newsletter: 0, junk: 0, spam: 0, other: 0 };
    allInbox.forEach((e) => { if (e.category) counts[e.category] = (counts[e.category] || 0) + 1; });
    const linked = allInbox.filter((e) => e.project_id).length;

    return Response.json({
      ok: true,
      triaged: untriaged.length,
      counts,
      linked,
      drafts: drafts.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}