import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { tool, runGiuliaAgent, createTaskWithApproval } from "../../shared/codeAgent.ts";

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
    const JUNK = /(no-?reply|noreply|donotreply|notifications|notify|mailer|updates@|team@)/i;
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
    const awaitingIds = [];
    for (const e of untriaged) {
      const category = heurCategory(e);
      const projectId = projectMatch(e);
      const isNoise = category !== 'important';
      const text = `${e.subject || ''} ${e.body || ''}`;
      const awaiting = !isNoise && !e.auto_draft_created && AWAITING_RESPONSE.test(text);
      if (awaiting) awaitingIds.push(e.id);
      updates.push(
        sr.entities.Email.update(e.id, {
          category,
          project_id: projectId || null,
          triaged: true,
          ...(isNoise ? { folder: 'archived' } : { important: true, awaiting_response: awaiting }),
        }).catch(() => null)
      );
    }
    await Promise.all(updates);

    // Domein 8 — automatisch conceptantwoord (Approval) voor mails die op
    // reactie wachten. Max 5 per run om geen bulk aan drafts te genereren.
    let autoDrafted = 0;
    for (const id of awaitingIds.slice(0, 5)) {
      const res = await base44.functions.invoke('draftEmailReply', { email_id: id }).catch(() => null);
      if (res && res.data && res.data.ok) {
        await sr.entities.Email.update(id, { auto_draft_created: true }).catch(() => null);
        autoDrafted++;
      }
    }

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
      create_task: tool({
        description: 'Voer een actie/afspraak uit een email direct uit: maak een taak aan. Giulia legt deze meteen ter goedkeuring bij Salvo.',
        inputSchema: { type: 'object', properties: { title: { type: 'string' }, priority: { type: 'string' }, deadline: { type: 'string' }, project_id: { type: 'string' }, description: { type: 'string' } }, required: ['title'] },
        execute: async ({ title, priority, deadline, project_id, description }) => {
          const t = await createTaskWithApproval(base44, { title, priority, deadline, project_id, description, source: 'triageEmails' });
          return t ? { id: t.id, title: t.title } : { error: 'create failed' };
        },
      }),
    };

    const task =
      'Sorteer de inbox is al heuristisch gedaan. Jouw taak: gebruik list_important om emails met category "important" te bekijken. ' +
      'Haal acties, afspraken, deadlines en commitments uit deze emails en VOER ze direct uit via create_task (Giulia maakt de taak aan én legt deze ter goedkeuring voor bij Salvo). ' +
      'Schrijf ZELF GEEN concept-antwoorden en maak GEEN Approval voor een email-antwoord — Salvo vraagt dat zelf aan via de "Door Giulia"-knop bij een email. ' +
      'Rapporteer via report_to_salvo kort hoeveel taken je hebt aangemaakt.';

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
      auto_drafted: autoDrafted,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}