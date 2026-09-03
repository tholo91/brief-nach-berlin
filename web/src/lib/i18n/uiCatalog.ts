import type { Locale } from "./locale";

/**
 * Public UI copy for the translated landing page and letter wizard. Values with
 * `{braces}` are interpolation templates; keep the token unchanged in every locale.
 */
export interface UiCatalog {
  language: {
    selectLabel: string;
    selectAriaLabel: string;
    languageName: { de: string; en: string; tr: string };
    originalLanguageNotice: string;
    germanLetterNotice: string;
    germanOnlyLinkNotice: string;
    turkishTypingNotice: string;
  };
  navigation: {
    howItWorks: string;
    idea: string;
    getInvolved: string;
    writeLetter: string;
    openMenu: string;
    closeMenu: string;
    home: string;
  };
  hero: {
    titleStart: string;
    titleEmphasis: string;
    subtitle: string;
    trustFreeShort: string;
    trustFree: string;
    trustNoAccountShort: string;
    trustNoAccount: string;
    trustPrivacyShort: string;
    trustPrivacy: string;
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    intro: string;
    stepLabel: string;
    step1Title: string;
    step1Description: string;
    step2Title: string;
    step2Description: string;
    step3Title: string;
    step3Description: string;
    resultLabel: string;
    exampleAriaLabel: string;
    readExample: string;
  };
  press: { knownFrom: string; many: string };
  whyItWorks: {
    eyebrow: string;
    title: string;
    description: string;
    studiesLink: string;
    imageAlt: string;
    source: string;
    stat1: string;
    stat1Source: string;
    stat2: string;
    stat2Source: string;
  };
  vision: {
    eyebrow: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    storyLink: string;
    imageAlt: string;
  };
  projectSupport: {
    eyebrow: string;
    title: string;
    status: string;
    founderPrefix: string;
    openSourceLabel: string;
    founderSuffix: string;
    portraitAlt: string;
    support: string;
    share: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    freeQuestion: string;
    freeAnswer: string;
    dataQuestion: string;
    dataAnswer: string;
    lettersQuestion: string;
    lettersAnswer: string;
    representativeQuestion: string;
    representativeAnswer: string;
    levelsQuestion: string;
    levelsAnswer: string;
    aboutQuestion: string;
    aboutAnswer: string;
  };
  callToAction: { title: string; description: string; button: string; trustLine: string };
  footer: {
    description: string;
    navigationAriaLabel: string;
    use: string;
    project: string;
    participate: string;
    legal: string;
    feedback: string;
    support: string;
    openSource: string;
    imprint: string;
    privacy: string;
    writeLetter: string;
    germanPageSuffix: string;
    letterCount: string;
  };
  issue: {
    heading: string;
    campaignHeading: string;
    intro: string;
    campaignIntro: string;
    textareaAriaLabel: string;
    start: string;
    startIssueAriaLabel: string;
    stopRecordingAriaLabel: string;
    placeholderPreparingMic: string;
    placeholderRecording: string;
    placeholderTranscribing: string;
    placeholders: readonly string[];
    placeholdersWide: readonly string[];
    minCharacters: string;
    maxCharacters: string;
    characterCount: string;
    keyboardStart: string;
    writeMore: string;
    shortenIssue: string;
    tipsSummary: string;
    tipsPoint1Title: string;
    tipsPoint1Text: string;
    tipsPoint2Title: string;
    tipsPoint2Text: string;
    tipsPoint3Title: string;
    tipsPoint3Text: string;
    tipsPoint4Title: string;
    tipsPoint4Text: string;
  };
  voice: {
    startAriaLabel: string;
    startTitle: string;
    stopAriaLabel: string;
    preparing: string;
    transcribing: string;
    failed: string;
    failedTitle: string;
  };
  contact: {
    heading: string;
    intro: string;
    postalCodeLabel: string;
    postalCodePlaceholder: string;
    postalCodeHint: string;
    localityLookup: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailHint: string;
    next: string;
    postalCodeInvalid: string;
    emailInvalid: string;
  };
  preferences: {
    heading: string;
    intro: string;
    toneLegend: string;
    toneAriaLabel: string;
    tones: readonly string[];
    lengthLegend: string;
    lengthOne: string;
    lengthOneHalf: string;
    lengthTwo: string;
    lengthHint: string;
    advanced: string;
    advancedDescription: string;
    partyLabel: string;
    partyPlaceholder: string;
    partyWhy: string;
    partyExplanation: string;
    partyPrivacy: string;
    organisationLabel: string;
    organisationPlaceholder: string;
    advancedPrivacy: string;
    findingDistrict: string;
    chooseRecipients: string;
    chooseLevel: string;
  };
  levels: {
    heading: string;
    noRecommendation: string;
    canChooseAnother: string;
    groupAriaLabel: string;
    federal: string;
    federalExamples: string;
    state: string;
    stateExamples: string;
    local: string;
    localExamples: string;
    beta: string;
    cityStateHint: string;
    stateUnavailable: string;
    localUnavailable: string;
    underState: string;
    chooseRecipients: string;
  };
  progress: { issue: string; contact: string; preferences: string; back: string; close: string };
  status: {
    checkingRecipients: string;
    preparingDetails: string;
    draftingLetter: string;
    letterReady: string;
    sending: string;
    sent: string;
    resend: string;
    resendSent: string;
    retry: string;
    error: string;
    reportError: string;
  };
}

const de: UiCatalog = {
  language: {
    selectLabel: "Sprache",
    selectAriaLabel: "Sprache auswählen",
    languageName: { de: "Deutsch", en: "English", tr: "Türkçe" },
    originalLanguageNotice: "Du kannst die Sprache jederzeit ändern.",
    germanLetterNotice: "Dein Anliegen kann auf Deutsch, Englisch oder Türkisch sein. Der Brief an die Politik wird immer auf Deutsch formuliert.",
    germanOnlyLinkNotice: "Diese Seite ist derzeit auf Deutsch.",
    turkishTypingNotice: "Du kannst dein Anliegen auf Türkisch schreiben. Die Spracheingabe ist dafür noch nicht verfügbar.",
  },
  navigation: { howItWorks: "Wie es funktioniert", idea: "Die Idee", getInvolved: "Mitmachen", writeLetter: "Brief schreiben", openMenu: "Menü öffnen", closeMenu: "Menü schließen", home: "Startseite" },
  hero: {
    titleStart: "Dein Anliegen.", titleEmphasis: "Direkt an die Politik.", subtitle: "In 3 Minuten ist dein Brief an die passenden Abgeordneten fertig.",
    trustFreeShort: "kostenlos", trustFree: "Vollständig kostenlos", trustNoAccountShort: "ohne Account", trustNoAccount: "Kein Account erforderlich", trustPrivacyShort: "KI aus EU", trustPrivacy: "KI aus Europa, kein Datentracking",
  },
  howItWorks: {
    eyebrow: "In drei Schritten", title: "So einfach geht's", intro: "Du musst kein Politik-Profi sein oder wissen, an wen du schreiben sollst. Ein paar Stichpunkte reichen – Brief-nach-Berlin führt dich bis zum fertigen Brief.", stepLabel: "Schritt {number}",
    step1Title: "Anliegen schildern", step1Description: "Schreib oder sprich einfach auf, was dich beschäftigt. Stichpunkte reichen.",
    step2Title: "Angaben ergänzen", step2Description: "Gib PLZ und E-Mail an und wähle Ton und Länge. Brief-nach-Berlin schlägt die passende politische Adresse vor und erstellt deinen persönlichen Brief.",
    step3Title: "Abschreiben und abschicken", step3Description: "Du bekommst Brief und Adresse per E-Mail. Schreib ihn von Hand ab, unterschreib ihn und schick ihn ab.", resultLabel: "Dein Ergebnis", exampleAriaLabel: "Vollständigen Brief und weitere Beispiele lesen", readExample: "Ganzen Brief lesen",
  },
  press: { knownFrom: "Bekannt aus", many: "zahlreichen" },
  whyItWorks: {
    eyebrow: "Warum ein Brief", title: "Warum ein Brief mehr bewegt als tausend Klicks", description: "Ein handschriftlicher Brief macht Zeit und persönliches Interesse sichtbar. Was Studien dazu sagen und wo die Grenzen liegen, steht hier:", studiesLink: "Was Studien zur Wirkung handschriftlicher Briefe sagen", imageAlt: "Ein handgeschriebener Brief wird in einem Berliner Abgeordnetenbüro gelesen, mit Blick auf grüne Altbau-Fassaden.", source: "Quelle: {source}",
    stat1: "Petitionen gingen 2024 beim Bundestag ein. Nur 607 wurden im Ausschuss einzeln beraten. Ein Brief an deinen Wahlkreisabgeordneten landet nicht in dieser Schlange.", stat1Source: "Petitionsausschuss, Jahresbericht 2024", stat2: "der befragten US-Abgeordnetenbüros sagen: Weniger als 50 persönliche Zuschriften können reichen, damit ein Thema auf die Agenda kommt.", stat2Source: "Congressional Management Foundation",
  },
  vision: {
    eyebrow: "Wie alles begann", title: "Die Idee dahinter", paragraph1: "Ich habe selbst in Bundestagsbüros gesehen, was passiert, wenn ein persönlicher, handgeschriebener Brief auf einem Schreibtisch landet: Inmitten all der Drucksachen und Briefe von Verbänden fällt dieser auf und hat eine höhere Chance, besprochen zu werden.", paragraph2: "Die meisten Leute wissen nur nicht, an wen sie schreiben sollen. Oder wie sie ihr Anliegen so formulieren, dass es ankommt. Brief-nach-Berlin nimmt dir diese Hürden ab.", paragraph3: "Die Idee brachte mir meine Mutter in Duisburg.", storyLink: "Die ganze Geschichte dahinter", imageAlt: "Drei Mitarbeitende in einem Bundestagsbüro besprechen gemeinsam einen handgeschriebenen Brief, der aufgeschlagen auf dem Schreibtisch liegt.",
  },
  projectSupport: {
    eyebrow: "Das Projekt dahinter", title: "Kostenlos, gemeinnützig, offen", status: "Brief-nach-Berlin ist eine gemeinnützige Initiative und bleibt für alle kostenlos.", founderPrefix: "Ich bin Thomas und entwickle das Projekt in meiner Freizeit als", openSourceLabel: "Open Source", founderSuffix: "weiter, damit Menschen unkompliziert politisch aktiv werden können.", portraitAlt: "Thomas Lorenz, der Brief-nach-Berlin entwickelt", support: "Brief-nach-Berlin unterstützen", share: "Brief-nach-Berlin weiterempfehlen",
  },
  faq: {
    eyebrow: "Häufige Fragen", title: "Was viele fragen", freeQuestion: "Ist das wirklich kostenlos?", freeAnswer: "Ja. Du zahlst nichts, kein Abo, keine Premium-Stufe. Die Nutzung bleibt kostenlos.", dataQuestion: "Was passiert mit meinen Daten?", dataAnswer: "Dein Anliegen wird einmalig an die KI geschickt, der Brief kommt zurück. Brief-nach-Berlin speichert nichts. Kein Account, kein Tracking, keine Werbung.", lettersQuestion: "Wirken handgeschriebene Briefe wirklich?", lettersAnswer: "Ja, in einem Maß, das viele unterschätzen. In einem Bundestagsbüro landen täglich Dutzende Mails und Online-Petitionen. Ein handgeschriebener Brief mit Wahlkreisbezug ist die Ausnahme und landet oben auf dem Stapel. Genau dafür ist Brief-nach-Berlin gebaut.", representativeQuestion: "Warum schreibe ich an meinen Wahlkreisabgeordneten und nicht an den Fachausschuss?", representativeAnswer: "Weil deine direkte Vertretung im Bundestag dir gegenüber rechenschaftspflichtig ist. Ein fachfremder Ausschussabgeordneter aus einem anderen Wahlkreis muss auf dich nicht reagieren, deine eigene Vertretung schon. Genau das macht deinen Brief wirksam.", levelsQuestion: "Welche politischen Ebenen sind dabei?", levelsAnswer: "Bund, Land und Kommune. Brief-nach-Berlin findet die passende politische Adresse auf allen drei Ebenen. Außerdem kannst du öffentliche Kampagnen starten.", aboutQuestion: "Wer steckt dahinter?", aboutAnswer: "Thomas Lorenz, Produktentwickler aus Bremen mit politikwissenschaftlichem Hintergrund. Brief-nach-Berlin ist ein unabhängiges, parteiloses Projekt. Keine Lobby, kein NGO-Apparat, kein Werbebudget.",
  },
  callToAction: { title: "Bereit für deinen Brief?", description: "Beschreib in Stichpunkten, was dich bewegt. Brief-nach-Berlin findet die zuständigen Abgeordneten und formuliert einen Brief, der ankommt.", button: "Jetzt Brief schreiben", trustLine: "Kostenlos · in 3 Minuten · ohne Anmeldung" },
  footer: { description: "Ein Freizeitprojekt, das Menschen hilft, politische Anliegen als Brief an die richtige Stelle zu formulieren.", navigationAriaLabel: "Footer", use: "Nutzen", project: "Projekt", participate: "Mitmachen", legal: "Rechtliches", feedback: "Feedback", support: "Brief-nach-Berlin unterstützen", openSource: "Open Source", imprint: "Impressum", privacy: "Datenschutz", writeLetter: "Brief schreiben", germanPageSuffix: "Diese Seite ist auf Deutsch", letterCount: "{count} Briefe" },
  issue: {
    heading: "Was beschäftigt dich gerade?", campaignHeading: "Möchtest du den Brief persönlicher machen?", intro: "Sprich drauflos und passe deinen Text danach an. Oder nenne ein paar Stichpunkte, du musst keine ganzen Sätze schreiben. Daraus wird dein Briefentwurf formuliert.", campaignIntro: "Die Kampagne hat bereits einen Entwurf vorbereitet. Du kannst ihn direkt übernehmen oder kurz ergänzen, warum dir das Thema persönlich wichtig ist. Stichpunkte reichen.", textareaAriaLabel: "Dein Anliegen", start: "Starten", startIssueAriaLabel: "Anliegen starten", stopRecordingAriaLabel: "Aufnahme beenden und Text übernehmen", placeholderPreparingMic: "Bereite das Mikrofon vor...", placeholderRecording: "Sprich jetzt, dein Text erscheint hier...", placeholderTranscribing: "Transkribiere deine Aufnahme...", placeholders: ["Was möchtest du verändern?", "Was beschäftigt dich gerade?", "Zum Beispiel: Der Spielplatz bei uns ist voller Müll..."], placeholdersWide: ["Was möchtest du verändern? Zum Beispiel: Der Spielplatz bei uns ist voller Müll...", "Was beschäftigt dich gerade? Beschreib kurz, was dir wichtig ist."], minCharacters: "{count} von mind. {min} Zeichen", maxCharacters: "{count} / {max} Zeichen", characterCount: "{count} Zeichen", keyboardStart: "{shortcut} starten", writeMore: "Schreib noch etwas mehr", shortenIssue: "Bitte kürze dein Anliegen", tipsSummary: "Je konkreter, desto wirksamer", tipsPoint1Title: "Stichpunkte genügen.", tipsPoint1Text: "Was siehst du, was nervt dich, was schlägst du vor? Daraus entstehen die Sätze.", tipsPoint2Title: "Sag kurz, wer du bist.", tipsPoint2Text: "Zum Beispiel: Ich wohne hier, ich arbeite in der Pflege oder ich bin Elternteil.", tipsPoint3Title: "Eine konkrete Bitte reicht.", tipsPoint3Text: "Was sollen die Abgeordneten tun? Ein präziser Satz schlägt eine lange Forderungsliste.", tipsPoint4Title: "Sag auch, was du nicht meinst.", tipsPoint4Text: "Das macht dein Anliegen fairer und glaubwürdiger.",
  },
  voice: { startAriaLabel: "Sprachaufnahme starten", startTitle: "Diktieren: deine Worte werden ins Textfeld übernommen. Du kannst den Text danach noch ändern.", stopAriaLabel: "Aufnahme beenden und Text übernehmen", preparing: "Mikrofon wird vorbereitet...", transcribing: "Transkribiere deine Aufnahme...", failed: "Aufnahme fehlgeschlagen", failedTitle: "Aufnahme fehlgeschlagen, bitte erneut versuchen" },
  contact: { heading: "Wer ist für dein Anliegen zuständig?", intro: "Deine Postleitzahl zeigt, welche Abgeordneten dein Brief erreichen soll. Den fertigen Brief bekommst du per E-Mail.", postalCodeLabel: "Postleitzahl *", postalCodePlaceholder: "z.B. 10115", postalCodeHint: "Damit werden deine zuständigen Abgeordneten gefunden", localityLookup: "Abgeordnete für {locality} werden gesucht", emailLabel: "E-Mail-Adresse *", emailPlaceholder: "deine@email.de", emailHint: "Dein Brief kommt per Mail zu dir. Deine Adresse wird nur für den Versand genutzt und danach gelöscht.", next: "Weiter", postalCodeInvalid: "Bitte gib eine gültige fünfstellige Postleitzahl ein.", emailInvalid: "Bitte gib eine gültige E-Mail-Adresse ein." },
  preferences: { heading: "Wie soll dein Brief klingen?", intro: "Wähle noch Ton und Länge. Zusätzliche Angaben über dich sind freiwillig.", toneLegend: "Tonalität des Briefes", toneAriaLabel: "Tonlage des Briefes", tones: ["freundlich", "höflich", "sachlich", "bestimmt", "nachdrücklich"], lengthLegend: "Gewünschte Brieflänge", lengthOne: "1 Seite", lengthOneHalf: "1,5 Seiten", lengthTwo: "2 Seiten", lengthHint: "Eine Seite ist voreingestellt: prägnant und in 5–10 Minuten auf Papier abgeschrieben.", advanced: "Erweitert", advancedDescription: "Zusätzliche Infos über dich (optional)", partyLabel: "Bist du selbst Mitglied einer Partei?", partyPlaceholder: "z.B. SPD, Grüne, CDU", partyWhy: "Warum wird das gefragt?", partyExplanation: "Wenn du selbst Mitglied einer Partei bist und an Abgeordnete derselben Partei schreibst, kann der Brief das aufgreifen.", partyPrivacy: "Die Angabe wird nicht gespeichert und nicht weitergegeben.", organisationLabel: "Bist du in einer Organisation oder Gewerkschaft aktiv?", organisationPlaceholder: "z.B. Greenpeace, ver.di", advancedPrivacy: "Diese Angaben helfen nur bei der Formulierung deines aktuellen Briefs. Sie werden nicht dauerhaft gespeichert.", findingDistrict: "Wahlkreis finden...", chooseRecipients: "Abgeordnete auswählen", chooseLevel: "Politische Ebene wählen" },
  levels: { heading: "Welche Ebene passt zu deinem Anliegen?", noRecommendation: "Die passende Ebene ist nicht eindeutig. Wähle selbst, wohin dein Brief gehen soll.", canChooseAnother: "Du kannst dich trotzdem anders entscheiden.", groupAriaLabel: "Politische Ebene wählen", federal: "Bund", federalExamples: "Bundesgesetze, Rente, Asyl, Mieten, Verteidigung", state: "Land", stateExamples: "Schule, Polizei, Krankenhäuser, Landespolitik", local: "Kommune", localExamples: "Straße, Kita, Müll, Spielplatz, lokale Verwaltung", beta: "Beta", cityStateHint: "{state} ist Stadt und Bundesland zugleich. Kommunale Anliegen laufen deshalb über die Landesebene.", stateUnavailable: "Für deine PLZ in {region} ist die Landesebene noch nicht verfügbar. Du kannst weiterhin den Bund wählen.", localUnavailable: "Für diese PLZ fehlt noch die Zuordnung zur Kommune.", underState: "In {state} unter Land", chooseRecipients: "Empfänger auswählen" },
  progress: { issue: "Dein Anliegen", contact: "PLZ & E-Mail", preferences: "Ton & Länge", back: "Zurück", close: "Schließen" },
  status: { checkingRecipients: "Empfänger prüfen...", preparingDetails: "Angaben vorbereiten...", draftingLetter: "Brief wird formuliert...", letterReady: "Dein Brief ist fertig!", sending: "Wird gesendet...", sent: "Gesendet", resend: "Brief erneut senden", resendSent: "Brief erneut gesendet", retry: "Erneut versuchen", error: "Etwas ist schiefgelaufen.", reportError: "Fehler melden" },
};

const en: UiCatalog = {
  language: { selectLabel: "Language", selectAriaLabel: "Choose language", languageName: { de: "Deutsch", en: "English", tr: "Türkçe" }, originalLanguageNotice: "You can change the language at any time.", germanLetterNotice: "You can describe your concern in German, English or Turkish. The letter to politicians will always be written in German.", germanOnlyLinkNotice: "This page is currently in German.", turkishTypingNotice: "You can write your concern in Turkish. Voice input is not available for Turkish yet." },
  navigation: { howItWorks: "How it works", idea: "The idea", getInvolved: "Get involved", writeLetter: "Write a letter", openMenu: "Open menu", closeMenu: "Close menu", home: "Home" },
  hero: { titleStart: "Your concern.", titleEmphasis: "Straight to politics.", subtitle: "Your letter to the right representatives is ready in 3 minutes.", trustFreeShort: "free", trustFree: "Completely free", trustNoAccountShort: "no account", trustNoAccount: "No account required", trustPrivacyShort: "EU AI", trustPrivacy: "AI from Europe, no data tracking" },
  howItWorks: { eyebrow: "In three steps", title: "It really is this simple", intro: "You do not need to be a politics expert or know whom to contact. A few notes are enough – Brief-nach-Berlin guides you to a finished letter.", stepLabel: "Step {number}", step1Title: "Describe your concern", step1Description: "Write or say what matters to you. Bullet points are enough.", step2Title: "Add a few details", step2Description: "Enter your postcode and email, then choose tone and length. Brief-nach-Berlin suggests the right political contact and creates your personal letter.", step3Title: "Write it out and send it", step3Description: "You receive the letter and address by email. Copy it out by hand, sign it and send it.", resultLabel: "Your result", exampleAriaLabel: "Read the full letter and more examples", readExample: "Read the full letter" },
  press: { knownFrom: "Featured in", many: "many" },
  whyItWorks: { eyebrow: "Why a letter", title: "Why a letter achieves more than a thousand clicks", description: "A handwritten letter shows time and personal commitment. You can read what studies say and where their limits are here:", studiesLink: "What studies say about the impact of handwritten letters", imageAlt: "A handwritten letter is read in a Berlin parliamentary office, with green historic buildings outside.", source: "Source: {source}", stat1: "Petitions were submitted to the Bundestag in 2024. Only 607 were discussed individually in committee. A letter to your constituency representative does not end up in that queue.", stat1Source: "Petitions Committee, 2024 annual report", stat2: "of surveyed US congressional offices say fewer than 50 personal messages can be enough to put an issue on the agenda.", stat2Source: "Congressional Management Foundation" },
  vision: { eyebrow: "How it started", title: "The idea behind it", paragraph1: "I have seen first-hand in Bundestag offices what happens when a personal handwritten letter lands on a desk: among all the printed papers and association letters, it stands out and is more likely to be discussed.", paragraph2: "Most people simply do not know who to write to, or how to phrase their concern so it reaches the right people. Brief-nach-Berlin removes those barriers.", paragraph3: "The idea came from my mother in Duisburg.", storyLink: "The full story behind it", imageAlt: "Three staff members in a Bundestag office discuss an opened handwritten letter on the desk." },
  projectSupport: { eyebrow: "Behind the project", title: "Free, non-profit, open", status: "Brief-nach-Berlin is a non-profit initiative and remains free for everyone.", founderPrefix: "I'm Thomas, and I develop this", openSourceLabel: "open-source project", founderSuffix: "in my spare time so people can take political action without unnecessary hurdles.", portraitAlt: "Thomas Lorenz, creator of Brief-nach-Berlin", support: "Support Brief-nach-Berlin", share: "Share Brief-nach-Berlin" },
  faq: { eyebrow: "Frequently asked questions", title: "What people often ask", freeQuestion: "Is it really free?", freeAnswer: "Yes. You pay nothing: no subscription and no premium tier. It will remain free to use.", dataQuestion: "What happens to my data?", dataAnswer: "Your concern is sent to the AI once and the letter comes back. Brief-nach-Berlin stores nothing. No account, no tracking, no advertising.", lettersQuestion: "Do handwritten letters really work?", lettersAnswer: "Yes, more than many people think. Bundestag offices receive dozens of emails and online petitions every day. A handwritten letter with a constituency connection is the exception and rises to the top of the pile. That is exactly what Brief-nach-Berlin is built for.", representativeQuestion: "Why write to my constituency representative instead of the specialist committee?", representativeAnswer: "Because your direct representative in the Bundestag is accountable to you. A committee member from another constituency does not have to respond to you; your own representative does. That is what makes your letter effective.", levelsQuestion: "Which political levels are included?", levelsAnswer: "Federal, state and local government. Brief-nach-Berlin finds the right political address at all three levels. You can also start public campaigns.", aboutQuestion: "Who is behind it?", aboutAnswer: "Thomas Lorenz, a product builder from Bremen with a background in political science. Brief-nach-Berlin is independent and non-partisan: no lobby, no NGO machine, no advertising budget." },
  callToAction: { title: "Ready to write your letter?", description: "Describe what moves you in bullet points. Brief-nach-Berlin finds the responsible representatives and drafts a letter that gets heard.", button: "Write your letter now", trustLine: "Free · 3 minutes · no sign-up" },
  footer: { description: "A side project that helps people turn political concerns into a letter to the right place.", navigationAriaLabel: "Footer", use: "Use", project: "Project", participate: "Get involved", legal: "Legal", feedback: "Feedback", support: "Support Brief-nach-Berlin", openSource: "Open source", imprint: "Legal notice", privacy: "Privacy", writeLetter: "Write a letter", germanPageSuffix: "This page is in German", letterCount: "{count} letters" },
  issue: { heading: "What is on your mind?", campaignHeading: "Would you like to make the letter more personal?", intro: "Just speak or write freely, then adjust your text. A few bullet points are enough; you do not need complete sentences. We turn them into a letter draft.", campaignIntro: "The campaign has already prepared a draft. You can use it as it is or briefly add why this issue matters to you personally. Bullet points are enough.", textareaAriaLabel: "Your concern", start: "Start", startIssueAriaLabel: "Start your concern", stopRecordingAriaLabel: "Stop recording and use text", placeholderPreparingMic: "Preparing the microphone...", placeholderRecording: "Speak now, your text will appear here...", placeholderTranscribing: "Transcribing your recording...", placeholders: ["What would you like to change?", "What is on your mind?", "For example: The playground near us is full of litter..."], placeholdersWide: ["What would you like to change? For example: The playground near us is full of litter...", "What is on your mind? Briefly describe what matters to you."], minCharacters: "{count} of at least {min} characters", maxCharacters: "{count} / {max} characters", characterCount: "{count} characters", keyboardStart: "{shortcut} to start", writeMore: "Write a little more", shortenIssue: "Please shorten your concern", tipsSummary: "The more specific, the more effective", tipsPoint1Title: "Bullet points are enough.", tipsPoint1Text: "What do you see, what bothers you, what do you propose? We turn that into sentences.", tipsPoint2Title: "Briefly say who you are.", tipsPoint2Text: "For example: I live here, I work in care, or I am a parent.", tipsPoint3Title: "One specific request is enough.", tipsPoint3Text: "What should the representatives do? One precise sentence beats a long list of demands.", tipsPoint4Title: "Say what you do not mean, too.", tipsPoint4Text: "That makes your concern fairer and more credible." },
  voice: { startAriaLabel: "Start voice input", startTitle: "Dictate: your words will be added to the text field. You can edit the text afterwards.", stopAriaLabel: "Stop recording and use text", preparing: "Preparing microphone...", transcribing: "Transcribing your recording...", failed: "Recording failed", failedTitle: "Recording failed. Please try again." },
  contact: { heading: "Who is responsible for your concern?", intro: "Your postal code shows which representatives should receive your letter. You will receive the finished letter by email.", postalCodeLabel: "Postal code *", postalCodePlaceholder: "e.g. 10115", postalCodeHint: "This finds the representatives responsible for you", localityLookup: "Finding representatives for {locality}", emailLabel: "Email address *", emailPlaceholder: "you@email.com", emailHint: "Your letter will arrive by email. Your address is used only to send it and then deleted.", next: "Continue", postalCodeInvalid: "Please enter a valid five-digit postal code.", emailInvalid: "Please enter a valid email address." },
  preferences: { heading: "How should your letter sound?", intro: "Choose the tone and length. Additional information about you is optional.", toneLegend: "Tone of the letter", toneAriaLabel: "Letter tone", tones: ["friendly", "polite", "factual", "firm", "emphatic"], lengthLegend: "Preferred letter length", lengthOne: "1 page", lengthOneHalf: "1.5 pages", lengthTwo: "2 pages", lengthHint: "One page is preselected: concise and easy to copy onto paper in 5–10 minutes.", advanced: "Advanced", advancedDescription: "Additional information about you (optional)", partyLabel: "Are you a member of a political party?", partyPlaceholder: "e.g. SPD, Greens, CDU", partyWhy: "Why do we ask this?", partyExplanation: "If you are a member of a party and write to representatives from that party, the letter can mention it.", partyPrivacy: "This information is not stored or shared.", organisationLabel: "Are you active in an organisation or trade union?", organisationPlaceholder: "e.g. Greenpeace, ver.di", advancedPrivacy: "This information only helps draft your current letter. It is not stored permanently.", findingDistrict: "Finding constituency...", chooseRecipients: "Choose representatives", chooseLevel: "Choose political level" },
  levels: { heading: "Which level suits your concern?", noRecommendation: "The right level is not clear. Choose where you would like your letter to go.", canChooseAnother: "You can still choose differently.", groupAriaLabel: "Choose political level", federal: "Federal", federalExamples: "Federal laws, pensions, asylum, rents, defence", state: "State", stateExamples: "Schools, police, hospitals, state policy", local: "Local", localExamples: "Streets, childcare, litter, playgrounds, local administration", beta: "Beta", cityStateHint: "{state} is both a city and a state. Local concerns therefore go through the state level.", stateUnavailable: "The state level is not available for your postal code in {region} yet. You can still choose the federal level.", localUnavailable: "The local authority has not been mapped for this postal code yet.", underState: "Under state in {state}", chooseRecipients: "Choose recipients" },
  progress: { issue: "Your concern", contact: "Postal code & email", preferences: "Tone & length", back: "Back", close: "Close" },
  status: { checkingRecipients: "Checking recipients...", preparingDetails: "Preparing details...", draftingLetter: "Drafting your letter...", letterReady: "Your letter is ready!", sending: "Sending...", sent: "Sent", resend: "Send letter again", resendSent: "Letter sent again", retry: "Try again", error: "Something went wrong.", reportError: "Report an error" },
};

const tr: UiCatalog = {
  language: { selectLabel: "Dil", selectAriaLabel: "Dil seçin", languageName: { de: "Deutsch", en: "English", tr: "Türkçe" }, originalLanguageNotice: "Dili istediğiniz zaman değiştirebilirsiniz.", germanLetterNotice: "Talebinizi Almanca, İngilizce veya Türkçe yazabilirsiniz. Politikacılara giden mektup her zaman Almanca hazırlanır.", germanOnlyLinkNotice: "Bu sayfa şu anda Almanca.", turkishTypingNotice: "Talebinizi Türkçe yazabilirsiniz. Türkçe için sesli giriş henüz mevcut değil." },
  navigation: { howItWorks: "Nasıl çalışır", idea: "Fikir", getInvolved: "Katıl", writeLetter: "Mektup yaz", openMenu: "Menüyü aç", closeMenu: "Menüyü kapat", home: "Ana sayfa" },
  hero: { titleStart: "Talebiniz.", titleEmphasis: "Doğrudan siyasete.", subtitle: "Doğru temsilcilere göndereceğiniz mektup 3 dakika içinde hazır.", trustFreeShort: "ücretsiz", trustFree: "Tamamen ücretsiz", trustNoAccountShort: "hesap yok", trustNoAccount: "Hesap gerekmez", trustPrivacyShort: "AB yapay zekâsı", trustPrivacy: "Avrupa'dan yapay zekâ, veri takibi yok" },
  howItWorks: { eyebrow: "Üç adımda", title: "Bu kadar kolay", intro: "Siyaset uzmanı olmanıza veya kime yazacağınızı bilmenize gerek yok. Birkaç not yeter – Brief-nach-Berlin sizi hazır mektuba kadar yönlendirir.", stepLabel: "Adım {number}", step1Title: "Talebinizi anlatın", step1Description: "Sizi neyin ilgilendirdiğini yazın veya sesli olarak anlatın. Anahtar noktalar yeterli.", step2Title: "Bilgileri tamamlayın", step2Description: "Posta kodunuzu ve e-posta adresinizi girin, üslup ile uzunluğu seçin. Brief-nach-Berlin uygun siyasi adresi önerir ve kişisel mektubunuzu hazırlar.", step3Title: "Elinizle yazın ve gönderin", step3Description: "Mektup ve adres e-postanıza gelir. Mektubu elinizle yazın, imzalayın ve gönderin.", resultLabel: "Sonuç", exampleAriaLabel: "Mektubun tamamını ve başka örnekleri okuyun", readExample: "Mektubun tamamını oku" },
  press: { knownFrom: "Medyada", many: "pek çok" },
  whyItWorks: { eyebrow: "Neden mektup?", title: "Bir mektup neden bin tıklamadan daha çok şey değiştirir", description: "El yazısıyla yazılmış bir mektup zamanı ve kişisel ilgiyi gösterir. Araştırmaların ne söylediğini ve sınırlarını burada okuyabilirsiniz:", studiesLink: "El yazısıyla yazılmış mektupların etkisi hakkında araştırmalar", imageAlt: "Berlin'deki bir milletvekili ofisinde, yeşil tarihi binalara bakarken el yazısıyla yazılmış bir mektup okunuyor.", source: "Kaynak: {source}", stat1: "dilekçe 2024'te Bundestag'a ulaştı. Bunların yalnızca 607'si komisyonda tek tek görüşüldü. Seçim bölgenizin temsilcisine gönderilen bir mektup bu sıraya girmez.", stat1Source: "Dilekçe Komisyonu, 2024 yıllık raporu", stat2: "oranındaki ABD kongre ofisi, bir konunun gündeme gelmesi için 50'den az kişisel mesajın yeterli olabileceğini söylüyor.", stat2Source: "Congressional Management Foundation" },
  vision: { eyebrow: "Nasıl başladı?", title: "Arkasındaki fikir", paragraph1: "Bundestag ofislerinde, kişisel ve el yazısıyla yazılmış bir mektup masaya geldiğinde ne olduğunu bizzat gördüm: tüm basılı belgeler ve dernek mektupları arasında öne çıkar ve konuşulma ihtimali daha yüksektir.", paragraph2: "Çoğu insan sadece kime yazacağını ya da talebini nasıl etkili ifade edeceğini bilmiyor. Brief-nach-Berlin bu engelleri ortadan kaldırır.", paragraph3: "Fikri bana Duisburg'daki annem verdi.", storyLink: "Arkasındaki hikâyenin tamamı", imageAlt: "Bir Bundestag ofisinde üç çalışan, masanın üzerindeki açık el yazısı mektubu birlikte konuşuyor." },
  projectSupport: { eyebrow: "Projenin arkasında", title: "Ücretsiz, kâr amacı gütmeyen, açık", status: "Brief-nach-Berlin kâr amacı gütmeyen bir girişimdir ve herkes için ücretsiz kalır.", founderPrefix: "Ben Thomas. Bu", openSourceLabel: "açık kaynak projesini", founderSuffix: "boş zamanlarımda geliştiriyorum; böylece insanlar gereksiz engeller olmadan siyasi olarak harekete geçebiliyor.", portraitAlt: "Brief-nach-Berlin'i geliştiren Thomas Lorenz", support: "Brief-nach-Berlin'i destekle", share: "Brief-nach-Berlin'i paylaş" },
  faq: { eyebrow: "Sık sorulan sorular", title: "İnsanların sıkça sordukları", freeQuestion: "Gerçekten ücretsiz mi?", freeAnswer: "Evet. Hiçbir ücret, abonelik ya da premium seviye yok. Kullanım ücretsiz kalacak.", dataQuestion: "Verilerime ne oluyor?", dataAnswer: "Talebiniz yapay zekâya bir kez gönderilir ve mektup geri gelir. Brief-nach-Berlin hiçbir şey saklamaz. Hesap yok, takip yok, reklam yok.", lettersQuestion: "El yazısıyla yazılmış mektuplar gerçekten etkili mi?", lettersAnswer: "Evet, çoğu kişinin düşündüğünden daha fazla. Bundestag ofislerine her gün onlarca e-posta ve çevrimiçi dilekçe gelir. Seçim bölgesi bağlantısı olan el yazısı mektup istisnadır ve yığının üstüne çıkar.", representativeQuestion: "Neden uzman komite yerine seçim bölgesi temsilcime yazıyorum?", representativeAnswer: "Çünkü Bundestag'daki doğrudan temsilciniz size karşı sorumludur. Başka bir seçim bölgesinden komite üyesinin yanıt verme zorunluluğu yoktur; kendi temsilcinizin vardır. Mektubunuzu etkili yapan budur.", levelsQuestion: "Hangi siyasi düzeyler var?", levelsAnswer: "Federal, eyalet ve yerel yönetim. Brief-nach-Berlin her üç düzeyde de doğru siyasi adresi bulur. Ayrıca herkese açık kampanyalar başlatabilirsiniz.", aboutQuestion: "Arkasında kim var?", aboutAnswer: "Thomas Lorenz, Bremen'den siyaset bilimi geçmişi olan bir ürün geliştirici. Brief-nach-Berlin bağımsız ve tarafsızdır: lobi yok, büyük bir STK yapısı yok, reklam bütçesi yok." },
  callToAction: { title: "Mektubunuzu yazmaya hazır mısınız?", description: "Sizi ilgilendiren konuyu madde madde anlatın. Brief-nach-Berlin sorumlu temsilcileri bulur ve duyulacak bir mektup hazırlar.", button: "Şimdi mektup yaz", trustLine: "Ücretsiz · 3 dakika · kayıt gerekmez" },
  footer: { description: "İnsanların siyasi taleplerini doğru yere gönderilecek bir mektuba dönüştürmelerine yardımcı olan bir yan proje.", navigationAriaLabel: "Alt bilgi", use: "Kullanım", project: "Proje", participate: "Katıl", legal: "Yasal", feedback: "Geri bildirim", support: "Brief-nach-Berlin'i destekle", openSource: "Açık kaynak", imprint: "Künye", privacy: "Gizlilik", writeLetter: "Mektup yaz", germanPageSuffix: "Bu sayfa Almanca", letterCount: "{count} mektup" },
  issue: { heading: "Aklınızı ne meşgul ediyor?", campaignHeading: "Mektubu daha kişisel yapmak ister misiniz?", intro: "Özgürce konuşun ya da yazın, sonra metninizi düzenleyin. Tam cümlelere gerek yok, birkaç madde yeterli. Bunları bir mektup taslağına dönüştürüyoruz.", campaignIntro: "Kampanya zaten bir taslak hazırladı. Olduğu gibi kullanabilir ya da konunun neden sizin için önemli olduğunu kısaca ekleyebilirsiniz. Maddeler yeterlidir.", textareaAriaLabel: "Talebiniz", start: "Başla", startIssueAriaLabel: "Talebinizi başlat", stopRecordingAriaLabel: "Kaydı durdur ve metni kullan", placeholderPreparingMic: "Mikrofon hazırlanıyor...", placeholderRecording: "Şimdi konuşun, metniniz burada görünecek...", placeholderTranscribing: "Kaydınız yazıya dönüştürülüyor...", placeholders: ["Neyi değiştirmek istersiniz?", "Aklınızı ne meşgul ediyor?", "Örneğin: Yakınımızdaki oyun alanı çöple dolu..."], placeholdersWide: ["Neyi değiştirmek istersiniz? Örneğin: Yakınımızdaki oyun alanı çöple dolu...", "Aklınızı ne meşgul ediyor? Sizin için önemli olanı kısaca anlatın."], minCharacters: "En az {min} karakterden {count} karakter", maxCharacters: "{count} / {max} karakter", characterCount: "{count} karakter", keyboardStart: "Başlatmak için {shortcut}", writeMore: "Biraz daha yazın", shortenIssue: "Lütfen talebinizi kısaltın", tipsSummary: "Ne kadar somut, o kadar etkili", tipsPoint1Title: "Maddeler yeterlidir.", tipsPoint1Text: "Ne görüyorsunuz, sizi ne rahatsız ediyor, ne öneriyorsunuz? Bunları cümlelere dönüştürüyoruz.", tipsPoint2Title: "Kısaca kim olduğunuzu söyleyin.", tipsPoint2Text: "Örneğin: Burada yaşıyorum, bakım sektöründe çalışıyorum veya ebeveynim.", tipsPoint3Title: "Tek bir somut istek yeterlidir.", tipsPoint3Text: "Temsilciler ne yapmalı? Kesin bir cümle uzun bir talep listesinden daha etkilidir.", tipsPoint4Title: "Ne demek istemediğinizi de söyleyin.", tipsPoint4Text: "Bu, talebinizi daha adil ve inandırıcı yapar." },
  voice: { startAriaLabel: "Sesli girişi başlat", startTitle: "Dikte edin: sözleriniz metin alanına eklenir. Metni sonra değiştirebilirsiniz.", stopAriaLabel: "Kaydı durdur ve metni kullan", preparing: "Mikrofon hazırlanıyor...", transcribing: "Kaydınız yazıya dönüştürülüyor...", failed: "Kayıt başarısız oldu", failedTitle: "Kayıt başarısız oldu. Lütfen tekrar deneyin." },
  contact: { heading: "Talebinizden kim sorumlu?", intro: "Posta kodunuz mektubunuzun hangi temsilcilere gitmesi gerektiğini gösterir. Bitmiş mektubu e-posta ile alırsınız.", postalCodeLabel: "Posta kodu *", postalCodePlaceholder: "örn. 10115", postalCodeHint: "Bu, sizin için sorumlu temsilcileri bulur", localityLookup: "{locality} için temsilciler aranıyor", emailLabel: "E-posta adresi *", emailPlaceholder: "siz@eposta.com", emailHint: "Mektubunuz size e-posta ile gelir. Adresiniz yalnızca gönderim için kullanılır ve sonra silinir.", next: "Devam et", postalCodeInvalid: "Lütfen geçerli beş haneli bir posta kodu girin.", emailInvalid: "Lütfen geçerli bir e-posta adresi girin." },
  preferences: { heading: "Mektubunuz nasıl bir tonda olsun?", intro: "Tonunu ve uzunluğunu seçin. Kendinizle ilgili ek bilgiler isteğe bağlıdır.", toneLegend: "Mektubun tonu", toneAriaLabel: "Mektup tonu", tones: ["samimi", "nazik", "nesnel", "kararlı", "ısrarcı"], lengthLegend: "Tercih edilen mektup uzunluğu", lengthOne: "1 sayfa", lengthOneHalf: "1,5 sayfa", lengthTwo: "2 sayfa", lengthHint: "Bir sayfa önceden seçilidir: kısa ve 5-10 dakikada kâğıda kolayca geçirilebilir.", advanced: "Gelişmiş", advancedDescription: "Sizinle ilgili ek bilgiler (isteğe bağlı)", partyLabel: "Bir siyasi partinin üyesi misiniz?", partyPlaceholder: "örn. SPD, Yeşiller, CDU", partyWhy: "Bunu neden soruyoruz?", partyExplanation: "Bir partinin üyesiyseniz ve o partinin temsilcilerine yazıyorsanız, mektup bunu belirtebilir.", partyPrivacy: "Bu bilgi saklanmaz ve paylaşılmaz.", organisationLabel: "Bir kuruluşta veya sendikada aktif misiniz?", organisationPlaceholder: "örn. Greenpeace, ver.di", advancedPrivacy: "Bu bilgiler yalnızca mevcut mektubunuzun hazırlanmasına yardımcı olur. Kalıcı olarak saklanmaz.", findingDistrict: "Seçim bölgesi aranıyor...", chooseRecipients: "Temsilcileri seç", chooseLevel: "Siyasi düzeyi seç" },
  levels: { heading: "Talebiniz için hangi düzey uygun?", noRecommendation: "Doğru düzey net değil. Mektubunuzun nereye gitmesini istediğinizi siz seçin.", canChooseAnother: "Yine de farklı bir seçim yapabilirsiniz.", groupAriaLabel: "Siyasi düzeyi seç", federal: "Federal", federalExamples: "Federal yasalar, emeklilik, iltica, kiralar, savunma", state: "Eyalet", stateExamples: "Okullar, polis, hastaneler, eyalet politikası", local: "Yerel", localExamples: "Sokaklar, kreş, çöp, oyun alanı, yerel yönetim", beta: "Beta", cityStateHint: "{state} hem şehir hem eyalettir. Yerel talepler bu nedenle eyalet düzeyinden gider.", stateUnavailable: "{region} bölgesindeki posta kodunuz için eyalet düzeyi henüz mevcut değil. Federal düzeyi yine de seçebilirsiniz.", localUnavailable: "Bu posta kodu için yerel yönetim eşleştirmesi henüz yok.", underState: "{state} için eyalet altında", chooseRecipients: "Alıcıları seç" },
  progress: { issue: "Talebiniz", contact: "Posta kodu ve e-posta", preferences: "Ton ve uzunluk", back: "Geri", close: "Kapat" },
  status: { checkingRecipients: "Alıcılar kontrol ediliyor...", preparingDetails: "Bilgiler hazırlanıyor...", draftingLetter: "Mektubunuz hazırlanıyor...", letterReady: "Mektubunuz hazır!", sending: "Gönderiliyor...", sent: "Gönderildi", resend: "Mektubu tekrar gönder", resendSent: "Mektup tekrar gönderildi", retry: "Tekrar dene", error: "Bir şeyler ters gitti.", reportError: "Hata bildir" },
};

export const UI_CATALOG: Record<Locale, UiCatalog> = { de, en, tr };

export function getUiCopy(locale: Locale): UiCatalog {
  return UI_CATALOG[locale];
}
