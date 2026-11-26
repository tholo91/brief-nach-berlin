import type { Locale } from "./locale";

/**
 * Static strings of the adult letter wizard that are shared by every locale: success page,
 * recipient pickers, free search and the town hall address box. The letter, mails, server
 * messages, recipient names and addresses stay as delivered. Values with `{braces}` are
 * templates; keep the token unchanged in every locale (only `{article}`, the German article
 * taken from data, may be dropped in EN/TR).
 */
type PickerKey =
  | "later"
  | "campaignOf"
  | "campaignThis"
  | "targetOne"
  | "targetMany"
  | "campaignSentence"
  | "campaignNoMatch"
  | "campaignOneMatch"
  | "campaignPreselected"
  | "campaignMany"
  | "fixedTitle"
  | "chooseTitle"
  | "administrationTitle"
  | "toTitle"
  | "toInstitutionTitle"
  | "landesregierungTitle"
  | "chooseMdbTitle"
  | "manyTitle"
  | "whoTitle"
  | "introFixed"
  | "introChancellor"
  | "introKommune"
  | "institutionSenatChoose"
  | "institutionRegierungChoose"
  | "institutionSenatPreselected"
  | "institutionRegierungPreselected"
  | "introLandPick"
  | "introMinister"
  | "introHead"
  | "introGovernment"
  | "introInstitution"
  | "introCampaignSearch"
  | "introPersonPreselected"
  | "introChoosePerson"
  | "introNoLocalCampaign"
  | "introNoLocal"
  | "introOneConstituency"
  | "introBorder"
  | "backToSenat"
  | "backToRegierung"
  | "changeLevel"
  | "changePostalCode"
  | "assignmentTitle"
  | "berlinDistrictHint"
  | "landConstituencyHint"
  | "orBundestagMember"
  | "filterParties"
  | "searchMdl"
  | "searchMdb"
  | "placeholderLand"
  | "placeholderBund"
  | "countOf"
  | "hideMore"
  | "showMore"
  | "noResult"
  | "constituencyPrefix"
  | "landConstituencyPrefix"
  | "landConstituencyPossible"
  | "constituencyLine"
  | "directMandate"
  | "stateList"
  | "committees"
  | "profileLink"
  | "fixedBadge"
  | "campaignBackupHint"
  | "backupBadge"
  | "backupShowMdbs"
  | "backupHideMdbs"
  | "fixedNote"
  | "badgeBezirksamt"
  | "badgeBuergermeisteramt"
  | "officialAddressFrom"
  | "standSuffix"
  | "ministerLead"
  | "badgeSenat"
  | "badgeRegierung"
  | "senatText"
  | "regierungText"
  | "officialAddress"
  | "sourceLink"
  | "checkedOn"
  | "headBadge"
  | "landtagToggle"
  | "bundestagToggle"
  | "landSearchAll"
  | "chancellorBadge"
  | "chancellorRole"
  | "continueWithout"
  | "continueHint"
  | "createLetter"
  | "termsLead"
  | "termsLeadMobile"
  | "termsLink"
  | "selectedLine"
  | "chooseRecipientAria"
  | "chooseMinisterAria"
  | "chooseInstitutionAria"
  | "chooseMembersAria";

type AlternativeKey =
  | "searchBund"
  | "searchLand"
  | "notFromConstituencyLine"
  | "notFromConstituency"
  | "partyAria"
  | "searchLabel"
  | "placeholderBund"
  | "placeholderLand"
  | "hintMinimum"
  | "loadError"
  | "empty"
  | "searching"
  | "countLine"
  | "constituencyLine"
  | "more";

type RathausKey =
  | "officialHeading"
  | "sourceLead"
  | "googleLead"
  | "googleLink"
  | "googleTail"
  | "noAddress"
  | "searchButton"
  | "districtHint"
  | "or";

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
  /** Recipient picker (Bund, Land, Kommune, campaigns). `{article}` is the German article from data. */
  picker: Record<PickerKey, string>;
  /** Free recipient search. */
  alternative: Record<AlternativeKey, string>;
  /** Town hall address box. `or` joins the Berlin district list. */
  rathaus: Record<RathausKey, string>;
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
  picker: {
    later: "MdB später auswählen",
    campaignOf: "Die Kampagne von {name}",
    campaignThis: "Diese Kampagne",
    targetOne: "eine ausgewählte Person",
    targetMany: "{count} ausgewählte Abgeordnete",
    campaignSentence: "{attribution} richtet sich an {target}.",
    campaignNoMatch: "Für deine PLZ ist keine Person aus dieser Auswahl direkt zuständig. Wähle eine Person aus der Kampagnenauswahl.",
    campaignOneMatch: "Für deine PLZ ist {name} zuständig und bereits ausgewählt.",
    campaignPreselected: "{name} ist vorausgewählt. Du kannst weitere passende Personen anzeigen.",
    campaignMany: "Für deine PLZ passen {count} Personen aus dieser Auswahl.",
    fixedTitle: "Fester Empfänger: {name}",
    chooseTitle: "An wen soll dein Brief gehen?",
    administrationTitle: "Dein Brief geht an die Verwaltung",
    toTitle: "Dein Brief geht an {name}",
    toInstitutionTitle: "Dein Brief geht an {article} {name}",
    landesregierungTitle: "Dein Brief geht an die Landesregierung",
    chooseMdbTitle: "Wähle ein MdB aus",
    manyTitle: "{count} Abgeordnete für PLZ {plz}",
    whoTitle: "Wer vertritt deinen Wahlkreis?",
    introFixed: "Dieser Empfänger ist für die Kampagne festgelegt. Deine PLZ verändert die Adresse nicht.",
    introChancellor: "Der Bundeskanzler ist vorausgewählt. Du kannst stattdessen auch ein Mitglied des Bundestags aus deinem Wahlkreis wählen.",
    introKommune: "Der kommunale Empfänger ist bereits vorausgewählt.",
    institutionSenatChoose: "den Senat",
    institutionRegierungChoose: "die Landesregierung",
    institutionSenatPreselected: "Der Senat",
    institutionRegierungPreselected: "Die Landesregierung",
    introLandPick: "Wähle {institution} oder eine Person aus dem Landtag.",
    introMinister: "Das Tool hat die passende Person für dein Thema vorausgewählt. Du kannst auch an die Regierung oder an ein Mitglied des Landtags schreiben.",
    introHead: "Die Regierungsspitze ist vorausgewählt. Du kannst stattdessen an die Landesregierung als Ganzes oder an ein Mitglied des Landtags schreiben.",
    introGovernment: "{institution} ist vorausgewählt. Du kannst stattdessen an die Regierungsspitze oder an ein Mitglied des Landtags schreiben.",
    introInstitution: "Der institutionelle Empfänger ist bereits vorausgewählt.",
    introCampaignSearch: "Filtere nach Partei oder suche nach Name, Wahlkreis und Ausschuss.",
    introPersonPreselected: "Die passende Person ist bereits vorausgewählt.",
    introChoosePerson: "Wähle eine der passenden Personen aus.",
    introNoLocalCampaign: "Für die PLZ {plz} wurde kein lokales MdB gefunden. Suche bundesweit nach der Person, an die dein Brief gehen soll.",
    introNoLocal: "Für die PLZ {plz} wurde kein lokales MdB gefunden. Suche bundesweit nach einer Person oder erstelle einen neutralen Entwurf, den du später adressierst.",
    introOneConstituency: "Dein Wahlkreis wird von folgenden MdBs vertreten. Das MdB mit Direktmandat ist vorausgewählt, du kannst aber auch jemand anderen wählen.",
    introBorder: "Deine PLZ liegt an einer Wahlkreis-Grenze. Wähle das MdB, das deinen Wahlkreis vertritt. Das Direktmandat ist je Wahlkreis vorausgewählt.",
    backToSenat: "Zurück zum Senat",
    backToRegierung: "Zurück zur Landesregierung",
    changeLevel: "Ebene ändern",
    changePostalCode: "PLZ ändern",
    assignmentTitle: "Hinweis zur Zuordnung",
    berlinDistrictHint: "Diese PLZ kann zu mehreren Berliner Bezirken gehören.",
    landConstituencyHint: "Eine PLZ kann mehrere Landtagswahlkreise abdecken. Prüfe über das verlinkte Profil, welcher Wahlkreis zu deiner Wohnadresse gehört, bevor du auswählst.",
    orBundestagMember: "Oder: ein Mitglied des Bundestags aus deinem Wahlkreis",
    filterParties: "Parteien filtern",
    searchMdl: "MdL suchen",
    searchMdb: "MdB suchen",
    placeholderLand: "Name, Partei oder Wahlkreis",
    placeholderBund: "Name, Partei, Wahlkreis oder Ausschuss",
    countOf: "{shown} von {total} Personen",
    hideMore: "Weitere passende Abgeordnete ausblenden",
    showMore: "Weitere passende Abgeordnete anzeigen ({count})",
    noResult: "Keine passende Person gefunden. Ändere deine Suche.",
    constituencyPrefix: "Wahlkreis",
    landConstituencyPrefix: "Landtagswahlkreis",
    landConstituencyPossible: "Möglicher Landtagswahlkreis",
    constituencyLine: "Wahlkreis {id} · {name}",
    directMandate: "Direktmandat",
    stateList: "Landesliste",
    committees: "Ausschüsse",
    profileLink: "Profil auf Abgeordnetenwatch.de",
    fixedBadge: "Fester Kampagnenempfänger",
    campaignBackupHint: "In deinem Wahlkreis sitzt kein MdB aus dieser Kampagnenauswahl, deshalb geht dein Brief an die für das Anliegen zuständige Stelle.",
    backupBadge: "Zuständig für das Anliegen",
    backupShowMdbs: "Lieber an ein MdB aus der Kampagnenauswahl schreiben",
    backupHideMdbs: "MdB-Auswahl ausblenden",
    fixedNote: "Du kannst aus ganz Deutschland teilnehmen.",
    badgeBezirksamt: "Bezirksamt",
    badgeBuergermeisteramt: "Bürgermeisteramt",
    officialAddressFrom: "Amtliche Anschrift von",
    standSuffix: ", Stand {date}",
    ministerLead: "Für dein Thema zuständig in {state}.",
    badgeSenat: "Senat",
    badgeRegierung: "Landesregierung",
    senatText: "Dein Brief geht an den {name}. Er ist für landesweite politische Entscheidungen zuständig.",
    regierungText: "Dein Brief geht an die Landesregierung von {state}. Sie ist für landesweite politische Entscheidungen zuständig.",
    officialAddress: "Amtliche Anschrift:",
    sourceLink: "Quelle",
    checkedOn: ", geprüft am {date}",
    headBadge: "Regierungschef:in",
    landtagToggle: "Lieber einer Person im Landtag schreiben?",
    bundestagToggle: "Lieber einer anderen Person im Bundestag schreiben?",
    landSearchAll: "Nicht dabei? Im ganzen Landtag suchen",
    chancellorBadge: "Bundeskanzler",
    chancellorRole: "Dein Brief richtet sich an Friedrich Merz in seiner Rolle als Leiter der Bundesregierung.",
    continueWithout: "Ohne Person fortfahren",
    continueHint: "Du setzt Name, Anschrift und Anrede vor dem Schreiben selbst ein.",
    createLetter: "Brief erstellen",
    termsLead: "Du siehst den Entwurf zuerst und kannst ihn anpassen. Anschließend schreibst du ihn von Hand und verschickst ihn per Post. Es gelten die",
    termsLeadMobile: "Du passt den Entwurf an, schreibst ihn von Hand und verschickst ihn selbst per Post. Es gelten die",
    termsLink: "Nutzungsbedingungen",
    selectedLine: "Ausgewählt: {name}",
    chooseRecipientAria: "Empfänger auswählen",
    chooseMinisterAria: "Fachminister:in auswählen",
    chooseInstitutionAria: "Institutionellen Empfänger auswählen",
    chooseMembersAria: "Abgeordnete auswählen",
  },
  alternative: {
    searchBund: "Bundesweit suchen",
    searchLand: "Im Bundesland suchen",
    notFromConstituencyLine: "Diese Personen sind nicht aus deinem Wahlkreis.",
    notFromConstituency: "Nicht aus deinem Wahlkreis",
    partyAria: "Partei auswählen",
    searchLabel: "Person suchen",
    placeholderBund: "Name, Partei, Wahlkreis oder Ausschuss",
    placeholderLand: "Name, Partei oder Wahlkreis",
    hintMinimum: "Wähle eine Partei oder gib mindestens zwei Zeichen ein.",
    loadError: "Die Suche konnte nicht geladen werden. Bitte versuche es erneut.",
    empty: "Keine passende Person gefunden.",
    searching: "Suche läuft …",
    countLine: "{count} von {total} Personen",
    constituencyLine: "Wahlkreis {id} · {name}",
    more: "Weitere anzeigen",
  },
  rathaus: {
    officialHeading: "Amtliche Postanschrift",
    sourceLead: "Quelle:",
    googleLead: ", Stand {date}. Du kannst die Adresse bei Google noch einmal",
    googleLink: "hier",
    googleTail: "prüfen.",
    noAddress: "Die Postanschrift konnte ich für deine PLZ nicht sicher zuordnen.",
    searchButton: "Adresse suchen",
    districtHint: "Deine PLZ liegt in {list}. Nimm die Adresse deines Bezirks:",
    or: "oder",
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
  picker: {
    later: "Choose a Bundestag member later",
    campaignOf: "The campaign by {name}",
    campaignThis: "This campaign",
    targetOne: "one selected person",
    targetMany: "{count} selected members of parliament",
    campaignSentence: "{attribution} is addressed to {target}.",
    campaignNoMatch: "No person from this selection is directly responsible for your postal code. Choose a person from the campaign selection.",
    campaignOneMatch: "{name} is responsible for your postal code and already selected.",
    campaignPreselected: "{name} is preselected. You can show more matching people.",
    campaignMany: "{count} people from this selection match your postal code.",
    fixedTitle: "Fixed recipient: {name}",
    chooseTitle: "Who should your letter go to?",
    administrationTitle: "Your letter goes to the local administration",
    toTitle: "Your letter goes to {name}",
    toInstitutionTitle: "Your letter goes to {name}",
    landesregierungTitle: "Your letter goes to the state government (Landesregierung)",
    chooseMdbTitle: "Choose a Bundestag member",
    manyTitle: "{count} Bundestag members for postal code {plz}",
    whoTitle: "Who represents your constituency?",
    introFixed: "This recipient is fixed for the campaign. Your postal code does not change the address.",
    introChancellor: "The Chancellor (Bundeskanzler) is preselected. You can also choose a member of the Bundestag from your constituency instead.",
    introKommune: "The local recipient is already preselected.",
    institutionSenatChoose: "the Senate (Senat)",
    institutionRegierungChoose: "the state government (Landesregierung)",
    institutionSenatPreselected: "The Senate (Senat)",
    institutionRegierungPreselected: "The state government (Landesregierung)",
    introLandPick: "Choose {institution} or a person from the state parliament (Landtag).",
    introMinister: "The tool preselected the right person for your topic. You can also write to the government or to a member of the state parliament (Landtag).",
    introHead: "The head of government is preselected. You can write to the state government as a whole or to a member of the state parliament (Landtag) instead.",
    introGovernment: "{institution} is preselected. You can write to the head of government or to a member of the state parliament (Landtag) instead.",
    introInstitution: "The institutional recipient is already preselected.",
    introCampaignSearch: "Filter by party or search by name, constituency and committee.",
    introPersonPreselected: "The matching person is already preselected.",
    introChoosePerson: "Choose one of the matching people.",
    introNoLocalCampaign: "No local Bundestag member was found for postal code {plz}. Search nationwide for the person your letter should go to.",
    introNoLocal: "No local Bundestag member was found for postal code {plz}. Search nationwide for a person or create a neutral draft that you address later.",
    introOneConstituency: "Your constituency is represented by the following Bundestag members. The member with the direct mandate is preselected, but you can choose someone else.",
    introBorder: "Your postal code lies on a constituency border. Choose the Bundestag member who represents your constituency. The direct mandate is preselected for each constituency.",
    backToSenat: "Back to the Senate",
    backToRegierung: "Back to the state government",
    changeLevel: "Change level",
    changePostalCode: "Change postal code",
    assignmentTitle: "Note on the assignment",
    berlinDistrictHint: "This postal code can belong to several Berlin districts.",
    landConstituencyHint: "A postal code can cover several state constituencies. Use the linked profile to check which constituency your home address belongs to before you choose.",
    orBundestagMember: "Or: a member of the Bundestag from your constituency",
    filterParties: "Filter by party",
    searchMdl: "Search state parliament members",
    searchMdb: "Search Bundestag members",
    placeholderLand: "Name, party or constituency",
    placeholderBund: "Name, party, constituency or committee",
    countOf: "{shown} of {total} people",
    hideMore: "Hide more matching members",
    showMore: "Show more matching members ({count})",
    noResult: "No matching person found. Change your search.",
    constituencyPrefix: "Constituency",
    landConstituencyPrefix: "State constituency",
    landConstituencyPossible: "Possible state constituency",
    constituencyLine: "Constituency {id} · {name}",
    directMandate: "Direct mandate",
    stateList: "State list",
    committees: "Committees",
    profileLink: "Profile on Abgeordnetenwatch.de",
    fixedBadge: "Fixed campaign recipient",
    campaignBackupHint: "No Bundestag member from this campaign's selection represents your constituency, so your letter goes to the office responsible for this issue.",
    backupBadge: "Responsible for this issue",
    backupShowMdbs: "Write to a Bundestag member from the campaign selection instead",
    backupHideMdbs: "Hide member selection",
    fixedNote: "You can take part from anywhere in Germany.",
    badgeBezirksamt: "District office",
    badgeBuergermeisteramt: "Mayor's office",
    officialAddressFrom: "Official address from",
    standSuffix: ", as of {date}",
    ministerLead: "Responsible for your topic in {state}.",
    badgeSenat: "Senate",
    badgeRegierung: "State government",
    senatText: "Your letter goes to {name}. It is responsible for statewide political decisions.",
    regierungText: "Your letter goes to the state government of {state}. It is responsible for statewide political decisions.",
    officialAddress: "Official address:",
    sourceLink: "Source",
    checkedOn: ", checked on {date}",
    headBadge: "Head of government",
    landtagToggle: "Prefer to write to a person in the state parliament (Landtag)?",
    bundestagToggle: "Prefer to write to a different person in the Bundestag?",
    landSearchAll: "Not listed? Search the whole state parliament",
    chancellorBadge: "Chancellor",
    chancellorRole: "Your letter is addressed to Friedrich Merz in his role as head of the federal government.",
    continueWithout: "Continue without a person",
    continueHint: "You add name, address and salutation yourself before writing.",
    createLetter: "Create letter",
    termsLead: "You see the draft first and can adjust it. Then you write it by hand and send it by post. See the",
    termsLeadMobile: "You adjust the draft, write it by hand and send it by post yourself. See the",
    termsLink: "terms of use",
    selectedLine: "Selected: {name}",
    chooseRecipientAria: "Choose recipient",
    chooseMinisterAria: "Choose subject minister",
    chooseInstitutionAria: "Choose institutional recipient",
    chooseMembersAria: "Choose members of parliament",
  },
  alternative: {
    searchBund: "Search nationwide",
    searchLand: "Search in the state",
    notFromConstituencyLine: "These people are not from your constituency.",
    notFromConstituency: "Not from your constituency",
    partyAria: "Choose party",
    searchLabel: "Search for a person",
    placeholderBund: "Name, party, constituency or committee",
    placeholderLand: "Name, party or constituency",
    hintMinimum: "Choose a party or enter at least two characters.",
    loadError: "The search could not be loaded. Please try again.",
    empty: "No matching person found.",
    searching: "Searching …",
    countLine: "{count} of {total} people",
    constituencyLine: "Constituency {id} · {name}",
    more: "Show more",
  },
  rathaus: {
    officialHeading: "Official postal address",
    sourceLead: "Source:",
    googleLead: ", as of {date}. You can check the address again",
    googleLink: "here",
    googleTail: "on Google.",
    noAddress: "I could not match the postal address for your postal code with confidence.",
    searchButton: "Search address",
    districtHint: "Your postal code lies in {list}. Use the address of your district:",
    or: "or",
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
  picker: {
    later: "Bundestag milletvekilini sonra seçin",
    campaignOf: "{name} tarafından başlatılan kampanya",
    campaignThis: "Bu kampanya",
    targetOne: "seçilmiş bir kişi",
    targetMany: "seçilmiş {count} milletvekili",
    campaignSentence: "{attribution} {target} için hazırlanmıştır.",
    campaignNoMatch: "Posta kodunuz için bu seçimden doğrudan sorumlu bir kişi yok. Kampanya seçiminden bir kişi seçin.",
    campaignOneMatch: "Posta kodunuzdan {name} sorumludur ve zaten seçilidir.",
    campaignPreselected: "{name} önceden seçilidir. Uygun diğer kişileri gösterebilirsiniz.",
    campaignMany: "Posta kodunuza bu seçimden {count} kişi uyuyor.",
    fixedTitle: "Sabit alıcı: {name}",
    chooseTitle: "Mektubunuz kime gitsin?",
    administrationTitle: "Mektubunuz yerel yönetime gider",
    toTitle: "Mektubunuz şu alıcıya gider: {name}",
    toInstitutionTitle: "Mektubunuz şu alıcıya gider: {name}",
    landesregierungTitle: "Mektubunuz eyalet hükümetine (Landesregierung) gider",
    chooseMdbTitle: "Bir Bundestag milletvekili seçin",
    manyTitle: "{plz} posta kodu için {count} milletvekili",
    whoTitle: "Seçim bölgenizi kim temsil ediyor?",
    introFixed: "Bu alıcı kampanya için belirlenmiştir. Posta kodunuz adresi değiştirmez.",
    introChancellor: "Şansölye (Bundeskanzler) önceden seçilidir. Bunun yerine seçim bölgenizden bir Bundestag milletvekilini de seçebilirsiniz.",
    introKommune: "Yerel alıcı zaten önceden seçilidir.",
    institutionSenatChoose: "Senato (Senat)",
    institutionRegierungChoose: "eyalet hükümeti (Landesregierung)",
    institutionSenatPreselected: "Senato (Senat)",
    institutionRegierungPreselected: "Eyalet hükümeti (Landesregierung)",
    introLandPick: "{institution} ya da eyalet meclisinden (Landtag) bir kişi seçin.",
    introMinister: "Araç, konunuz için uygun kişiyi önceden seçti. Hükümete veya eyalet meclisinin (Landtag) bir üyesine de yazabilirsiniz.",
    introHead: "Hükümet başkanı önceden seçilidir. Bunun yerine bir bütün olarak eyalet hükümetine veya eyalet meclisinin (Landtag) bir üyesine yazabilirsiniz.",
    introGovernment: "{institution} önceden seçilidir. Bunun yerine hükümet başkanına veya eyalet meclisinin (Landtag) bir üyesine yazabilirsiniz.",
    introInstitution: "Kurumsal alıcı zaten önceden seçilidir.",
    introCampaignSearch: "Partiye göre filtreleyin veya ad, seçim bölgesi ve komisyona göre arayın.",
    introPersonPreselected: "Uygun kişi zaten önceden seçilidir.",
    introChoosePerson: "Uygun kişilerden birini seçin.",
    introNoLocalCampaign: "{plz} posta kodu için yerel bir Bundestag milletvekili bulunamadı. Mektubunuzun gideceği kişiyi ülke genelinde arayın.",
    introNoLocal: "{plz} posta kodu için yerel bir Bundestag milletvekili bulunamadı. Ülke genelinde bir kişi arayın ya da daha sonra adresleyeceğiniz tarafsız bir taslak oluşturun.",
    introOneConstituency: "Seçim bölgeniz aşağıdaki Bundestag milletvekilleri tarafından temsil ediliyor. Doğrudan mandatlı milletvekili önceden seçilidir, ama başka birini de seçebilirsiniz.",
    introBorder: "Posta kodunuz bir seçim bölgesi sınırında yer alıyor. Seçim bölgenizi temsil eden Bundestag milletvekilini seçin. Doğrudan mandat her seçim bölgesinde önceden seçilidir.",
    backToSenat: "Senatoya geri dön",
    backToRegierung: "Eyalet hükümetine geri dönün",
    changeLevel: "Düzeyi değiştirin",
    changePostalCode: "Posta kodunu değiştirin",
    assignmentTitle: "Eşleştirme notu",
    berlinDistrictHint: "Bu posta kodu birden fazla Berlin ilçesine ait olabilir.",
    landConstituencyHint: "Bir posta kodu birden fazla eyalet seçim bölgesini kapsayabilir. Seçim yapmadan önce, bağlantılı profilden ikamet adresinizin hangi seçim bölgesine ait olduğunu kontrol edin.",
    orBundestagMember: "Veya: seçim bölgenizden bir Bundestag milletvekili",
    filterParties: "Partilere göre filtreleyin",
    searchMdl: "Eyalet milletvekili arayın",
    searchMdb: "Bundestag milletvekili arayın",
    placeholderLand: "Ad, parti veya seçim bölgesi",
    placeholderBund: "Ad, parti, seçim bölgesi veya komisyon",
    countOf: "{shown} / {total} kişi",
    hideMore: "Diğer uygun milletvekillerini gizleyin",
    showMore: "Diğer uygun milletvekillerini gösterin ({count})",
    noResult: "Uygun kişi bulunamadı. Aramanızı değiştirin.",
    constituencyPrefix: "Seçim bölgesi",
    landConstituencyPrefix: "Eyalet seçim bölgesi",
    landConstituencyPossible: "Olası eyalet seçim bölgesi",
    constituencyLine: "Seçim bölgesi {id} · {name}",
    directMandate: "Doğrudan mandat",
    stateList: "Eyalet listesi",
    committees: "Komisyonlar",
    profileLink: "Abgeordnetenwatch.de'de profil",
    fixedBadge: "Sabit kampanya alıcısı",
    campaignBackupHint: "Seçim bölgenizde bu kampanya seçiminden bir Bundestag milletvekili olmadığı için mektubunuz bu konudan sorumlu makama gider.",
    backupBadge: "Bu konudan sorumlu",
    backupShowMdbs: "Bunun yerine kampanya seçiminden bir milletvekiline yazın",
    backupHideMdbs: "Milletvekili seçimini gizleyin",
    fixedNote: "Almanya'nın her yerinden katılabilirsiniz.",
    badgeBezirksamt: "İlçe idaresi",
    badgeBuergermeisteramt: "Belediye başkanlığı",
    officialAddressFrom: "Resmi adres, kaynak:",
    standSuffix: ", {date} itibarıyla",
    ministerLead: "{state} eyaletinde konunuzdan sorumlu.",
    badgeSenat: "Senato",
    badgeRegierung: "Eyalet hükümeti",
    senatText: "Mektubunuz şu alıcıya gider: {name}. Eyalet genelindeki siyasi kararlardan sorumludur.",
    regierungText: "Mektubunuz {state} eyalet hükümetine gider. Eyalet genelindeki siyasi kararlardan sorumludur.",
    officialAddress: "Resmi adres:",
    sourceLink: "Kaynak",
    checkedOn: ", {date} tarihinde kontrol edildi",
    headBadge: "Hükümet başkanı",
    landtagToggle: "Eyalet meclisindeki (Landtag) bir kişiye yazmayı mı tercih edersiniz?",
    bundestagToggle: "Bundestag'da başka birine yazmayı mı tercih edersiniz?",
    landSearchAll: "Listede yok mu? Tüm eyalet meclisinde arayın",
    chancellorBadge: "Şansölye",
    chancellorRole: "Mektubunuz, federal hükümetin başkanı rolüyle Friedrich Merz'e yöneliktir.",
    continueWithout: "Kişi seçmeden devam edin",
    continueHint: "Yazmadan önce ad, adres ve hitabı kendiniz eklersiniz.",
    createLetter: "Mektubu oluşturun",
    termsLead: "Önce taslağı görürsünüz ve düzenleyebilirsiniz. Sonra elle yazar ve postayla gönderirsiniz. Bkz.",
    termsLeadMobile: "Taslağı düzenler, elle yazar ve kendiniz postayla gönderirsiniz. Bkz.",
    termsLink: "Kullanım koşulları",
    selectedLine: "Seçilen: {name}",
    chooseRecipientAria: "Alıcı seçin",
    chooseMinisterAria: "Konu bakanını seçin",
    chooseInstitutionAria: "Kurumsal alıcıyı seçin",
    chooseMembersAria: "Milletvekillerini seçin",
  },
  alternative: {
    searchBund: "Ülke genelinde arayın",
    searchLand: "Eyalette arayın",
    notFromConstituencyLine: "Bu kişiler sizin seçim bölgenizden değil.",
    notFromConstituency: "Seçim bölgenizden değil",
    partyAria: "Parti seçin",
    searchLabel: "Kişi arayın",
    placeholderBund: "Ad, parti, seçim bölgesi veya komisyon",
    placeholderLand: "Ad, parti veya seçim bölgesi",
    hintMinimum: "Bir parti seçin veya en az iki karakter girin.",
    loadError: "Arama yüklenemedi. Lütfen tekrar deneyin.",
    empty: "Uygun kişi bulunamadı.",
    searching: "Aranıyor …",
    countLine: "{count} / {total} kişi",
    constituencyLine: "Seçim bölgesi {id} · {name}",
    more: "Daha fazla gösterin",
  },
  rathaus: {
    officialHeading: "Resmi posta adresi",
    sourceLead: "Kaynak:",
    googleLead: ", {date} itibarıyla. Adresi Google'da",
    googleLink: "buradan",
    googleTail: "tekrar kontrol edebilirsiniz.",
    noAddress: "Posta adresini posta kodunuz için güvenilir biçimde eşleştiremedim.",
    searchButton: "Adres arayın",
    districtHint: "Posta kodunuz {list} ilçelerinden birinde yer alıyor. İlçenizin adresini kullanın:",
    or: "veya",
  },
};

export const WIZARD_COPY: Record<Locale, WizardCopy> = { de, en, tr };
