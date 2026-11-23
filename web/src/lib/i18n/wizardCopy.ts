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
    genericError: string;
    /** Letter fetch failed without a mail path: the text stays, a new try is possible. */
    fetchErrorPdf: string;
    fetchErrorMail: string;
    /** Level impact lines (steps accordion), by the level of the recipient. */
    impactBund: string;
    impactLand: string;
    impactFixed: string;
    impactKommune: string;
    addressKommune: string;
    addressYouth: string;
    addressAdult: string;
    levelDataMissing: string;
    resendToggle: string;
    resendHint: string;
    resendEmailLabel: string;
    resendLimitedTitle: string;
    /** Client fallback when the server sends no rate-limit message. */
    resendLimitedFallback: string;
    resendHelp: string;
    resendFailed: string;
    reload: string;
    stepsToggle: string;
    reportThanks: string;
    reportThanksMail: string;
    reportThanksError: string;
    reportHeadingLost: string;
    reportHeadingFailed: string;
    /** Quotes the label of `status.reportError`. */
    reportExplainLost: string;
    reportSending: string;
    /** Lead before the mailto link with the founder address. */
    reportFailedLead: string;
    reportHint: string;
    reviewTitle: string;
    /** Review line; `{draft}` is `draftYouth` or `draftMail`. */
    reviewBody: string;
    draftYouth: string;
    draftMail: string;
    stepWriteTitle: string;
    stepWriteYouth: string;
    stepWriteAdult: string;
    stepAddressTitle: string;
    stepShareTitle: string;
    stepShareBody: string;
    generatingTitle: string;
    generatingFailedTitle: string;
    generatingRetry: string;
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
    genericError: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
    fetchErrorPdf: "Die Verbindung war weg. Dein Text ist noch da, du kannst es noch einmal versuchen.",
    fetchErrorMail: "Beim Erstellen deines Briefes ist ein Fehler aufgetreten.",
    impactBund: "Handgeschriebene Briefe werden im Bundestag tatsächlich gelesen und besprochen.",
    impactLand: "Ein persönlicher, handgeschriebener Brief macht dein Anliegen auf Landesebene konkret.",
    impactFixed: "Ein persönlicher, handgeschriebener Brief macht dein Anliegen beim festen Kampagnenempfänger sichtbar.",
    impactKommune: "Ein persönlicher, handgeschriebener Brief macht dein Anliegen für die Verwaltung greifbar.",
    addressKommune: "Nutze die Suchhilfe, prüfe die vollständige Anschrift und schreib sie auf den Umschlag.",
    addressYouth: "Die Anschrift steht unter deinem Entwurf.",
    addressAdult: "Die Adresse findest du im Brief.",
    levelDataMissing: "Daten nicht verfügbar",
    resendToggle: "Keine E-Mail erhalten?",
    resendHint: "Prüfe deinen Spam-Ordner. Falls nichts ankommt, überprüfe deine E-Mail-Adresse und sende den Brief erneut.",
    resendEmailLabel: "E-Mail-Adresse",
    resendLimitedTitle: "Maximal dreimal gesendet",
    resendLimitedFallback: "Der Brief wurde jetzt mehrfach gesendet. Bitte prüfe noch einmal deinen Spam-Ordner und die E-Mail-Adresse.",
    resendHelp: "Hilfe anfragen",
    resendFailed: "Senden fehlgeschlagen. Bitte lade die Seite neu und versuche es erneut.",
    reload: "Seite neu laden",
    stepsToggle: "So geht es weiter",
    reportThanks: "Danke für deine Hilfe!",
    reportThanksMail: "Danke, ich habe die technischen Daten bekommen. Schau jetzt in dein Postfach und in den Spam-Ordner, dort ist dein Brief sehr wahrscheinlich schon.",
    reportThanksError: "Danke, ich habe die technischen Daten bekommen und schaue mir den Fehler an.",
    reportHeadingLost: "Die Verbindung ist abgebrochen",
    reportHeadingFailed: "Brief konnte nicht erstellt werden",
    reportExplainLost:
      "Dein Brief ist sehr wahrscheinlich trotzdem fertig geworden und per Mail an dich unterwegs. Schau in dein Postfach und in den Spam-Ordner. Wenn du kurz auf „Fehler melden“ klickst, hilfst du mir sehr, das zu verbessern.",
    reportSending: "Wird gemeldet...",
    reportFailedLead: "Melden hat nicht geklappt. Schreib mir kurz an",
    reportHint: "Ein Klick genügt. Schickt mir die Fehlerdaten, damit ich es schnell beheben kann.",
    reviewTitle: "Mach diesen Brief zu deinem Brief.",
    reviewBody:
      "Lies dir {draft} durch und pass Ton, Formulierungen oder einzelne Argumente so an, dass der Brief sich nach dir anfühlt. Der Entwurf ist ein Anfang, die Unterschrift ist deine.",
    draftYouth: "den Entwurf",
    draftMail: "die Mail",
    stepWriteTitle: "Brief schreiben.",
    stepWriteYouth: "Schreib deinen Brief von Hand, der Entwurf hilft dir dabei, und bleib bei deinem Schreibstil.",
    stepWriteAdult: "Schreib den Brief nach dem Entwurf von Hand und pass ihn an deinen Schreibstil an.",
    stepAddressTitle: "Adresse aufschreiben, Briefmarke drauf, ab zur Post.",
    stepShareTitle: "Weitersagen.",
    stepShareBody: "Je mehr Menschen schreiben, desto mehr Gewicht hat jeder einzelne Brief.",
    generatingTitle: "Dein Brief wird geschrieben",
    generatingFailedTitle: "Das hat nicht geklappt",
    generatingRetry: "Noch einmal versuchen",
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
    genericError: "Something went wrong. Please try again.",
    fetchErrorPdf: "The connection was lost. Your text is still here, you can try again.",
    fetchErrorMail: "An error occurred while creating your letter.",
    impactBund: "Handwritten letters are actually read and discussed in the Bundestag.",
    impactLand: "A personal, handwritten letter makes your concern concrete at state level.",
    impactFixed: "A personal, handwritten letter makes your concern visible to the recipient the campaign has set.",
    impactKommune: "A personal, handwritten letter makes your concern tangible for the local administration.",
    addressKommune: "Use the search help, check the full address and write it on the envelope.",
    addressYouth: "The address is below your draft.",
    addressAdult: "You will find the address in the letter.",
    levelDataMissing: "Data not available",
    resendToggle: "No email received?",
    resendHint: "Check your spam folder. If nothing arrives, check your email address and send the letter again.",
    resendEmailLabel: "Email address",
    resendLimitedTitle: "Sent three times, the maximum",
    resendLimitedFallback: "The letter has now been sent several times. Please check your spam folder and your email address once more.",
    resendHelp: "Ask for help",
    resendFailed: "Sending failed. Please reload the page and try again.",
    reload: "Reload page",
    stepsToggle: "What happens next",
    reportThanks: "Thanks for your help!",
    reportThanksMail: "Thanks, I received the technical data. Check your inbox and your spam folder now, your letter is very likely already there.",
    reportThanksError: "Thanks, I received the technical data and will look into the error.",
    reportHeadingLost: "The connection was interrupted",
    reportHeadingFailed: "The letter could not be created",
    reportExplainLost:
      "Your letter was very likely created anyway and is on its way to you by email. Check your inbox and your spam folder. If you click “Report an error”, you help me a lot to improve this.",
    reportSending: "Reporting...",
    reportFailedLead: "Reporting did not work. Write to me briefly at",
    reportHint: "One click is enough. It sends me the error data so I can fix it quickly.",
    reviewTitle: "Make this letter your own.",
    reviewBody:
      "Read through {draft} and adjust the tone, the wording or single arguments until the letter feels like you. The draft is a start, the signature is yours.",
    draftYouth: "the draft",
    draftMail: "the email",
    stepWriteTitle: "Write the letter.",
    stepWriteYouth: "Write your letter by hand, the draft helps you, and stay with your own writing style.",
    stepWriteAdult: "Write the letter by hand following the draft and adapt it to your own writing style.",
    stepAddressTitle: "Write down the address, add a stamp, take it to the post office.",
    stepShareTitle: "Spread the word.",
    stepShareBody: "The more people write, the more weight each single letter has.",
    generatingTitle: "Your letter is being written",
    generatingFailedTitle: "That did not work",
    generatingRetry: "Try once more",
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
    genericError: "Bir hata oluştu. Lütfen tekrar deneyin.",
    fetchErrorPdf: "Bağlantı kesildi. Metniniz hâlâ burada, yeniden deneyebilirsiniz.",
    fetchErrorMail: "Mektubunuz oluşturulurken bir hata oluştu.",
    impactBund: "El yazısıyla yazılmış mektuplar Bundestag'da gerçekten okunuyor ve tartışılıyor.",
    impactLand: "Kişisel, el yazısıyla yazılmış bir mektup, talebinizi eyalet düzeyinde somut hale getirir.",
    impactFixed: "Kişisel, el yazısıyla yazılmış bir mektup, talebinizi kampanyanın belirlediği alıcıya görünür kılar.",
    impactKommune: "Kişisel, el yazısıyla yazılmış bir mektup, talebinizi belediye yönetimi için somut hale getirir.",
    addressKommune: "Arama yardımını kullanın, tam adresi kontrol edin ve zarfa yazın.",
    addressYouth: "Adres taslağınızın altında.",
    addressAdult: "Adresi mektubun içinde bulursunuz.",
    levelDataMissing: "Veriler kullanılamıyor",
    resendToggle: "E-posta almadınız mı?",
    resendHint: "Spam klasörünüze bakın. Hiçbir şey gelmezse e-posta adresinizi kontrol edin ve mektubu tekrar gönderin.",
    resendEmailLabel: "E-posta adresi",
    resendLimitedTitle: "En fazla üç kez gönderildi",
    resendLimitedFallback: "Mektup şimdi birkaç kez gönderildi. Lütfen spam klasörünüzü ve e-posta adresinizi bir kez daha kontrol edin.",
    resendHelp: "Yardım isteyin",
    resendFailed: "Gönderim başarısız oldu. Lütfen sayfayı yenileyin ve tekrar deneyin.",
    reload: "Sayfayı yenile",
    stepsToggle: "Sonra ne olacak",
    reportThanks: "Yardımınız için teşekkürler!",
    reportThanksMail: "Teşekkürler, teknik verileri aldım. Şimdi gelen kutunuza ve spam klasörünüze bakın, mektubunuz büyük olasılıkla çoktan orada.",
    reportThanksError: "Teşekkürler, teknik verileri aldım ve hataya bakacağım.",
    reportHeadingLost: "Bağlantı koptu",
    reportHeadingFailed: "Mektup oluşturulamadı",
    reportExplainLost:
      "Mektubunuz büyük olasılıkla yine de oluşturuldu ve e-postayla size doğru yolda. Gelen kutunuza ve spam klasörünüze bakın. Kısaca “Hata bildir” düğmesine tıklarsanız, bunu iyileştirmeme çok yardımcı olursunuz.",
    reportSending: "Bildiriliyor...",
    reportFailedLead: "Bildirim gönderilemedi. Bana kısaca şu adrese yazın",
    reportHint: "Tek tıklama yeterli. Hata verilerini bana gönderir, böylece hızlıca düzeltebilirim.",
    reviewTitle: "Bu mektubu kendi mektubunuz yapın.",
    reviewBody:
      "{draft} okuyun ve tonu, ifadeleri veya tek tek argümanları mektup size ait gibi hissettirene kadar uyarlayın. Taslak bir başlangıçtır, imza sizindir.",
    draftYouth: "Taslağı",
    draftMail: "E-postayı",
    stepWriteTitle: "Mektubu yazın.",
    stepWriteYouth: "Mektubunuzu elle yazın, taslak size yardımcı olur; kendi yazı tarzınıza sadık kalın.",
    stepWriteAdult: "Mektubu taslağa bakarak elle yazın ve kendi yazı tarzınıza uyarlayın.",
    stepAddressTitle: "Adresi yazın, pulu yapıştırın, postaneye gidin.",
    stepShareTitle: "Başkalarına anlatın.",
    stepShareBody: "Ne kadar çok kişi yazarsa, her mektubun ağırlığı o kadar artar.",
    generatingTitle: "Mektubunuz yazılıyor",
    generatingFailedTitle: "Bu olmadı",
    generatingRetry: "Bir kez daha deneyin",
  },
};

export const WIZARD_COPY: Record<Locale, WizardCopy> = { de, en, tr };
