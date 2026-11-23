import type { Locale } from "./locale";

/**
 * Static strings of the adult letter wizard that are shared by every locale: success page,
 * recipient pickers, free search and the town hall address box. The letter, mails, server
 * messages, recipient names and addresses stay as delivered. Values with `{braces}` are
 * templates; keep the token unchanged in every locale (only `{article}`, the German article
 * taken from data, may be dropped in EN/TR).
 */
export interface WizardCopy {
  success: {
    /** Ready line with the masked address as `{email}`. */
    readySubtitle: string;
    /** Loading line: lead, then the last word that stays on one line with the dots. */
    loadingLead: string;
    loadingLast: string;
    waitLong: string;
    waitShort: string;
    connectionLost: string;
    /** Follow-up lead; the mailto link with the founder address follows it. */
    connectionLostLead: string;
    mailAppButton: string;
    /** Inbox hint; quotes the localized mail subject (`emailCopy[locale].subject.standard`). */
    inboxHint: string;
    /** Shown in the ready line when the address cannot be masked. */
    emailFallback: string;
  };
}

const de: WizardCopy = {
  success: {
    readySubtitle: "Dein Entwurf kommt an {email}. Den Brief schickst du anschließend selbst per Post ab.",
    loadingLead: "Brief und nächste Schritte kommen per E-Mail zu ",
    loadingLast: "dir",
    waitLong: "Viele schreiben gerade, dein Brief kommt gleich. Bitte lass diese Seite offen.",
    waitShort: "Bitte lass diese Seite offen. Lange Briefe können bis zu einer Minute dauern.",
    connectionLost:
      "Die Verbindung war kurz weg, zum Beispiel weil du die App gewechselt hast. Deshalb konnte diese Seite den Versand nicht mehr bestätigen. Dein Brief kommt trotzdem per Mail, schau auch im Spam-Ordner nach.",
    connectionLostLead: "Nach zehn Minuten noch nichts da? Schreib mir an",
    mailAppButton: "Postfach öffnen",
    inboxHint: "Öffne jetzt dein E-Mail-Postfach und suche nach „Dein Brief nach Berlin ist fertig“.",
    emailFallback: "deine E-Mail-Adresse",
  },
};

const en: WizardCopy = {
  success: {
    readySubtitle: "Your draft is on its way to {email}. You send the letter by post yourself afterwards.",
    loadingLead: "The letter and the next steps are coming to your ",
    loadingLast: "inbox",
    waitLong: "Many people are writing right now, your letter will be ready shortly. Please keep this page open.",
    waitShort: "Please keep this page open. Long letters can take up to a minute.",
    connectionLost:
      "The connection dropped for a moment, for example because you switched apps. That is why this page could not confirm the sending. Your letter will still arrive by email, so check your spam folder too.",
    connectionLostLead: "Nothing there after ten minutes? Write to me at",
    mailAppButton: "Open inbox",
    inboxHint: "Open your email inbox now and look for “Your letter to Berlin is ready”.",
    emailFallback: "your email address",
  },
};

const tr: WizardCopy = {
  success: {
    readySubtitle: "Taslağınız {email} adresine geliyor. Mektubu daha sonra kendiniz postayla gönderirsiniz.",
    loadingLead: "Mektup ve sonraki adımlar e-postanıza ",
    loadingLast: "geliyor",
    waitLong: "Şu anda çok kişi yazıyor, mektubunuz birazdan hazır olacak. Lütfen bu sayfayı açık bırakın.",
    waitShort: "Lütfen bu sayfayı açık bırakın. Uzun mektuplar bir dakikaya kadar sürebilir.",
    connectionLost:
      "Bağlantı kısa süre kesildi, örneğin uygulamayı değiştirdiğiniz için. Bu yüzden bu sayfa gönderimi onaylayamadı. Mektubunuz yine de e-postayla gelecek, spam klasörüne de bakın.",
    connectionLostLead: "On dakika sonra hâlâ bir şey yok mu? Bana şu adrese yazın",
    mailAppButton: "Gelen kutusunu aç",
    inboxHint: "Şimdi e-posta gelen kutunuzu açın ve “Berlin'e mektubunuz hazır” konulu iletiyi arayın.",
    emailFallback: "e-posta adresiniz",
  },
};

export const WIZARD_COPY: Record<Locale, WizardCopy> = { de, en, tr };
