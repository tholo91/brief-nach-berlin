import Link from "next/link";
import { CONTACT } from "@/lib/contact";

export const metadata = {
  title: "Datenschutz | Brief-nach-Berlin",
};

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <h1 className="font-typewriter text-3xl font-bold text-waldgruen-dark mb-8">
          Datenschutzerklärung
        </h1>

        <div className="font-body text-warmgrau space-y-6 leading-relaxed">
          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              1. Verantwortlicher
            </h2>
            <p>
              Thomas Lorenz
              <br />
              A.d. Schleifmühle 44
              <br />
              28203 Bremen
              <br />
              Deutschland
              <br />
              E-Mail:{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-waldgruen hover:underline"
              >
                {CONTACT.email}
              </a>
            </p>
            <p className="mt-2 text-sm">
              Zuständige Aufsichtsbehörde: Die Landesbeauftragte für
              Datenschutz und Informationsfreiheit der Freien Hansestadt Bremen,
              Arndtstraße 1, 27570 Bremerhaven,{" "}
              <a
                href="https://www.datenschutz.bremen.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                datenschutz.bremen.de
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              2. Allgemeines zur Datenverarbeitung
            </h2>
            <p>
              Brief nach Berlin verarbeitet personenbezogene Daten ausschließlich
              zur Erbringung des Dienstes: die Erstellung eines personalisierten
              Briefs an Ihren zuständigen Abgeordneten. Ich lege keine
              Nutzerkonten an und setze keine Cookies ein. Alle eingegebenen
              Daten (Postleitzahl, E-Mail-Adresse, Anliegen, optionale Angaben,
              optionale Spracheingabe) werden ausschließlich während der
              Verarbeitung Ihrer Anfrage verwendet und danach verworfen. Eine
              dauerhafte Speicherung Ihrer Brief-Daten findet nicht statt.
              Ausnahme: optionale Bewertungen nach dem Versand (siehe
              Abschnitt 16). Die eingesetzten Dienstleister Mistral AI
              (Abschnitt 9) und Brevo (Abschnitt 11) speichern Daten im Rahmen
              ihrer eigenen Datenschutzbestimmungen und
              Auftragsverarbeitungsvertr&auml;ge.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              3. Hinweis zu besonderen Kategorien personenbezogener Daten (Art. 9
              DSGVO)
            </h2>
            <p>
              Briefe an politische Mandatsträger enthalten zwangsläufig politische
              Meinungen. Je nach Inhalt Ihres Anliegens können auch weitere
              besondere Kategorien personenbezogener Daten verarbeitet werden,
              etwa Angaben zu Gesundheit, religiöser oder weltanschaulicher
              Überzeugung oder Gewerkschaftszugehörigkeit. Die Verarbeitung
              dieser Daten erfolgt ausschließlich auf Grundlage Ihrer
              ausdrücklichen Einwilligung gemäß{" "}
              <strong>Art. 9 Abs. 2 lit. a DSGVO</strong>, die Sie durch das
              freiwillige Eintragen Ihres Anliegens und das Absenden des
              Formulars erteilen. Sie können die Einwilligung jederzeit für die
              Zukunft widerrufen; eine Speicherung der Daten findet bei mir
              ohnehin nicht statt.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              4. Hosting (Vercel)
            </h2>
            <p>
              Diese Website wird bei Vercel Inc., 340 S Lemon Ave #4133, Walnut,
              CA 91789, USA gehostet. Die Server-seitige Verarbeitung
              (Server-Funktionen, API-Aufrufe) erfolgt in der Region{" "}
              <strong>Frankfurt am Main (fra1)</strong>. Vercel verarbeitet
              technisch notwendige Verbindungsdaten (IP-Adresse,
              Zugriffszeitpunkt, User-Agent) zur Auslieferung der Inhalte, zur
              Sicherstellung der Verfügbarkeit und zur Abwehr von Missbrauch.
            </p>
            <p className="mt-2">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
              an einem zuverlässigen, sicheren Betrieb).
            </p>
            <p className="mt-2">
              Drittlandtransfer in die USA: Vercel Inc. ist nach dem{" "}
              <strong>EU-U.S. Data Privacy Framework (DPF)</strong> zertifiziert
              (Adäquanzbeschluss der EU-Kommission vom 10.07.2023). Ergänzend
              habe ich mit Vercel die Standardvertragsklauseln (SCCs) der
              EU-Kommission abgeschlossen. Der Auftragsverarbeitungsvertrag (DPA)
              ist hier abrufbar:{" "}
              <a
                href="https://vercel.com/legal/dpa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                vercel.com/legal/dpa
              </a>
              . Datenschutzerklärung von Vercel:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                vercel.com/legal/privacy-policy
              </a>
              .
            </p>
            <p className="mt-2 text-sm">
              Speicherdauer: Server-Logs werden von Vercel typischerweise bis zu
              30 Tage vorgehalten und danach automatisch gelöscht.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              5. Verarbeitung der Postleitzahl
            </h2>
            <p>
              Zweck: Zuordnung Ihrer Postleitzahl zum zuständigen
              Bundestagswahlkreis und zu den dort gewählten Abgeordneten.
              Verarbeitete Daten: Postleitzahl (5 Ziffern). Die Zuordnung erfolgt
              vollständig lokal auf meinem Server anhand statischer
              Referenzdaten der Bundeswahlleiterin; die Postleitzahl wird nicht
              an Dritte übermittelt. Speicherdauer: keine Speicherung.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Durchführung
              vorvertraglicher Maßnahmen auf Ihre Anfrage).
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              6. Verarbeitung der E-Mail-Adresse
            </h2>
            <p>
              Zweck: einmaliger Versand des generierten Briefs als
              Transaktionsmail. Verarbeitete Daten: E-Mail-Adresse. Empfänger:
              Brevo SAS (siehe Abschnitt 11). Ich speichere die E-Mail-Adresse
              nicht bei mir; es wird kein Newsletter und keine Empfängerliste
              geführt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Erfüllung
              Ihrer Anfrage).
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              7. Verarbeitung des Anliegens (Freitext und optionale
              Spracheingabe)
            </h2>
            <p className="mb-3">
              Zweck: Erstellung eines personalisierten Briefs auf Basis Ihres
              beschriebenen Anliegens sowie Sicherheitsprüfung des Inhalts.
              Verarbeitete Daten: Ihr Anliegen (Freitext oder transkribierte
              Spracheingabe), optionale Angaben (Name, Parteizugehörigkeit,
              Organisationszugehörigkeit, Tonalität, gewünschte Brieflänge), der
              im Anschluss generierte Brieftext. Empfänger: Mistral AI (siehe
              Abschnitt 9). Speicherdauer: keine Speicherung auf meinem Server.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO; soweit besondere
              Kategorien personenbezogener Daten betroffen sind (z. B. politische
              Meinung, Gesundheit), zusätzlich Art. 9 Abs. 2 lit. a DSGVO
              (ausdrückliche Einwilligung).
            </p>
            <p>
              <strong className="text-waldgruen-dark">
                Spracheingabe (optional):
              </strong>{" "}
              Wenn Sie die Spracheingabe nutzen, wird Ihre Audioaufnahme im
              Browser erfasst, an meinen Server (Vercel, Region Frankfurt)
              übertragen und sofort zur Transkription an die Mistral Voxtral API
              (Mistral AI, Frankreich) weitergeleitet. Die Audiodatei wird weder
              bei mir noch dauerhaft bei Mistral gespeichert; nach der
              Transkription wird sie verworfen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              8. Politiker- und Wahlkreisdaten
            </h2>
            <p>
              Die angezeigten Politikerdaten (Name, Titel, Parteizugehörigkeit,
              Wahlkreis, Postadresse, Profil-Link) stammen aus öffentlich
              zugänglichen Quellen: der Datenbank von Abgeordnetenwatch.de
              (Lizenz: CC0) sowie den offenen Daten der Bundeswahlleiterin. Diese
              Daten sind keine personenbezogenen Daten der Websitenutzerinnen
              und -nutzer, sondern öffentliche Informationen über
              Mandatsträgerinnen und Mandatsträger.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              9. KI-gestützte Briefgenerierung, Inhaltsmoderation und
              Spracherkennung (Mistral AI)
            </h2>
            <p>
              Zweck: (a) Erstellung eines formalen, persönlichen Briefs auf Basis
              Ihres Anliegens, (b) automatische Inhaltsprüfung Ihres Anliegens
              und des generierten Briefs auf beleidigende, bedrohliche oder
              schädliche Inhalte, (c) optional: Transkription Ihrer
              Sprachaufnahme.
            </p>
            <p className="mt-2">
              Verarbeitete Daten: Ihr Anliegen, optionale Angaben (Name, Partei,
              Organisation, Tonalität, Brieflänge), die Liste der zuständigen
              Abgeordneten, der generierte Brieftext, ggf. die Audioaufnahme.
            </p>
            <p className="mt-2">
              Empfänger: Mistral AI, 15 rue des Halles, 75001 Paris, Frankreich.
              Eingesetzte Modelle: <em>mistral-small-latest</em> (Briefe),{" "}
              <em>mistral-moderation-latest</em> (Inhaltsprüfung),{" "}
              <em>voxtral-mini-transcribe-2507</em> (Spracherkennung).
              Serverstandort: Europäische Union (Frankreich). Es findet kein
              Drittlandtransfer statt.
            </p>
            <p className="mt-2">
              Mistral AI verarbeitet die übermittelten Daten als
              Auftragsverarbeiter im Sinne des Art. 28 DSGVO. Die übermittelten
              API-Daten werden nach Auskunft von Mistral nicht zum Training der
              Modelle verwendet. Auftragsverarbeitungsvertrag:{" "}
              <a
                href="https://mistral.ai/terms#data-processing-agreement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                mistral.ai/terms#data-processing-agreement
              </a>
              . Datenschutzhinweise:{" "}
              <a
                href="https://mistral.ai/terms#privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                mistral.ai/terms#privacy-policy
              </a>
              .
            </p>
            <p className="mt-2 text-sm">
              Speicherdauer: Mistral speichert API-Anfragen typischerweise bis zu
              30 Tage zur Missbrauchsvermeidung und löscht sie anschließend.
            </p>
            <p className="mt-2">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO; für besondere
              Kategorien zusätzlich Art. 9 Abs. 2 lit. a DSGVO. Für die
              Inhaltsmoderation gilt zusätzlich Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an der Verhinderung von Missbrauch und an
              der Einhaltung gesetzlicher Vorgaben gegenüber Mandatsträgern).
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              10. Automatisierte Entscheidungen im Einzelfall
            </h2>
            <p>
              Es findet keine automatisierte Entscheidung im Sinne des Art. 22
              DSGVO statt, die Ihnen gegenüber rechtliche Wirkung entfaltet oder
              Sie in ähnlicher Weise erheblich beeinträchtigt. Der von der KI
              generierte Brief ist ein Vorschlag, den Sie selbst prüfen, ggf.
              anpassen und handschriftlich versenden. Die inhaltliche
              Verantwortung für den versendeten Brief liegt bei Ihnen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              11. E-Mail-Versand (Brevo)
            </h2>
            <p>
              Zweck: einmalige Zustellung des generierten Briefs als
              Transaktions-E-Mail an die von Ihnen angegebene Adresse.
              Verarbeitete Daten: Ihre E-Mail-Adresse, der generierte Brieftext,
              die Postanschrift des Abgeordneten. Empfänger: Brevo SAS (vormals
              Sendinblue), 106 boulevard Haussmann, 75008 Paris, Frankreich.
              Serverstandort: Europäische Union (Rechenzentren in Frankreich und
              Deutschland). Es findet kein Drittlandtransfer statt.
            </p>
            <p className="mt-2">
              Brevo wird ausschließlich als Transaktionsversender eingesetzt; ein
              Newsletter, eine Marketingliste oder ein Tracking (Open- bzw.
              Click-Tracking) findet nicht statt. Brevo speichert die
              Versand-Logs entsprechend ihrer eigenen Aufbewahrungsfristen
              (typischerweise wenige Tage bis Wochen). Brevo handelt als
              Auftragsverarbeiter im Sinne des Art. 28 DSGVO.
              Auftragsverarbeitungsvertrag:{" "}
              <a
                href="https://www.brevo.com/legal/termsofuse/dpa/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                brevo.com/legal/termsofuse/dpa
              </a>
              . Datenschutzerklärung:{" "}
              <a
                href="https://www.brevo.com/legal/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                brevo.com/legal/privacypolicy
              </a>
              .
            </p>
            <p className="mt-2">
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Erfüllung Ihrer
              Anfrage).
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              12. Schutz vor Missbrauch (Rate Limiting)
            </h2>
            <p>
              Zur Abwehr von Missbrauch (z. B. massenhafte Anfragen, automatisierte
              Skripte) speichere ich Ihre IP-Adresse sowie ggf. eine Hash-Form
              Ihrer E-Mail-Adresse vorübergehend im Arbeitsspeicher der jeweiligen
              Server-Instanz. Diese Daten werden nicht persistiert; sie verfallen
              automatisch nach Ablauf des Zähl-Zeitfensters (1 bzw. 24 Stunden)
              oder bei einem Neustart der Server-Instanz. Rechtsgrundlage: Art. 6
              Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem stabilen und
              missbrauchsfreien Betrieb).
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              13. Reichweitenmessung (Vercel Web Analytics)
            </h2>
            <p>
              Ich nutze Vercel Web Analytics, um zu sehen, wie viele Menschen
              die Seite besuchen und wo technische Fehler auftreten. Der Dienst
              arbeitet <strong>cookielos</strong>, erstellt keine
              Nutzerprofile und verarbeitet keine Brief-Inhalte.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Details:{" "}
              <a
                href="https://vercel.com/docs/analytics/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                vercel.com/docs/analytics/privacy-policy
              </a>
              .
            </p>
            <p className="mt-2">
              Diese Reichweitenmessung dient ausschließlich dazu,
              Brief-nach-Berlin in der Anfangsphase zu verbessern (Reichweite
              verstehen, Fehler erkennen, Performance-Probleme finden). Die
              Daten werden nie an Dritte verkauft, nie zur Profilbildung
              verwendet und nie mit Werbenetzwerken geteilt. Sobald die
              Plattform stabil läuft, wird die Reichweitenmessung deaktiviert.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              14. Ihre Rechte
            </h2>
            <p>
              Sie haben gemäß DSGVO das Recht auf Auskunft (Art. 15),
              Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
              Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20), Widerspruch
              (Art. 21) sowie auf Widerruf einer erteilten Einwilligung mit
              Wirkung für die Zukunft (Art. 7 Abs. 3). Sie haben außerdem das
              Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77), z. B.
              bei der oben genannten LDI NRW. Anfragen richten Sie bitte formlos
              per E-Mail an{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-waldgruen hover:underline"
              >
                {CONTACT.email}
              </a>
              . Da ich selbst keine personenbezogenen Daten speichere, können
              Auskunfts- oder Löschanfragen, die Daten bei meinen
              Auftragsverarbeitern (Vercel, Mistral, Brevo) betreffen, von mir
              nur mit deren Mitwirkung beantwortet werden.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              15. Streitschlichtung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              16. Bewertungen und Feedback
            </h2>
            <p className="mb-3">
              Wenn Sie nach dem Brief-Versand auf einen Stern in der E-Mail
              klicken und eine Bewertung absenden, speichere ich folgende
              Daten bei Supabase (Server in Frankfurt am Main, Region eu-central-1):
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Sterne-Bewertung (1 bis 5)</li>
              <li>Optional: Ihr Kommentar (max. 500 Zeichen)</li>
              <li>Optional: Ihr Name oder Pseudonym (max. 80 Zeichen)</li>
              <li>Ihr Häkchen für die öffentliche Anzeige (an oder aus)</li>
              <li>
                Ihre Angabe, ob der Brief tatsächlich verschickt wird (Ja / Nein)
              </li>
              <li>
                Verknüpfung zum erstellten Brief (intern: Politiker-ID, PLZ,
                technische Brief-Metadaten zur Produktverbesserung)
              </li>
              <li>
                Ihre E-Mail-Adresse (kommt aus dem signierten Bewertungs-Link
                in der Brief-Mail)
              </li>
              <li>Pseudonymisierter Hash Ihrer IP-Adresse (Spam-Schutz)</li>
              <li>Zeitstempel</li>
            </ul>
            <p className="mb-3">
              Ihre E-Mail nutze ich <strong>ausschließlich</strong> für
              eventuelle Rückfragen zu Ihrer Bewertung. Sie wird niemals
              öffentlich gezeigt, nicht für Newsletter oder Marketing
              verwendet und nicht an Dritte weitergegeben.
            </p>
            <p className="mb-3">
              Wenn Sie dem Häkchen „öffentlich zeigen“ zustimmen, kann Ihre
              Bewertung später anonymisiert auf brief-nach-berlin.de erscheinen,
              gegebenenfalls mit dem von Ihnen angegebenen Namen oder
              Pseudonym. Sie können das Häkchen vor dem Absenden jederzeit
              entfernen.
            </p>
            <p className="mb-3">
              <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO
              (Einwilligung) für die öffentliche Anzeige; Art. 6 Abs. 1 lit. f
              DSGVO (berechtigtes Interesse: Produktverbesserung) für die
              interne Auswertung.
            </p>
            <p className="mb-3">
              <strong>Speicherort:</strong> Supabase Inc. (Auftragsverarbeiter),
              Server-Region Frankfurt (EU). Auftragsverarbeitungsvertrag (DPA):{" "}
              <a
                href="https://supabase.com/legal/dpa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                supabase.com/legal/dpa
              </a>
              .
            </p>
            <p>
              <strong>Aufbewahrung:</strong> Maximal 24 Monate. Sie können
              Ihre Bewertung jederzeit löschen lassen, indem Sie eine kurze
              E-Mail an{" "}
              <a
                href="mailto:datenschutz@brief-nach-berlin.de"
                className="text-waldgruen hover:underline"
              >
                datenschutz@brief-nach-berlin.de
              </a>{" "}
              schreiben. Geben Sie dafür die E-Mail-Adresse an, mit der Sie
              den Brief versendet haben.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              17. KI-generierte Inhalte und Disclaimer
            </h2>
            <p className="mb-3">
              Brief nach Berlin nutzt künstliche Intelligenz, um Ihr Anliegen
              schnell und einfach in einen formalen Brief umzuwandeln. KI-Systeme
              können jedoch Fehler machen, und das sollten Sie wissen, bevor Sie
              einen Brief versenden.
            </p>
            <p className="mb-3">
              <strong className="text-waldgruen-dark">
                Ich garantiere nicht
              </strong>{" "}
              die Richtigkeit der Politikerdaten (Name, Titel, Adresse,
              Zuständigkeit). Diese Daten stammen aus öffentlichen Quellen
              (Abgeordnetenwatch, Bundeswahlleiterin) und können veraltet oder
              unvollständig sein. Ich garantiere ebenfalls nicht die
              inhaltliche Korrektheit oder Angemessenheit des generierten
              Brieftexts; KI kann Kontext falsch einschätzen, Nuancen übersehen
              oder Fehlannahmen treffen.
            </p>
            <p className="mb-3">
              <strong className="text-waldgruen-dark">
                Bitte prüfen Sie vor dem Versand:
              </strong>{" "}
              Name, Titel und Adresse des Abgeordneten anhand offizieller
              Quellen, zum Beispiel{" "}
              <a
                href="https://www.bundestag.de/abgeordnete"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                bundestag.de
              </a>
              , der Website Ihres Landtags oder der Website Ihres Rathauses.
              Lesen Sie außerdem den generierten Brieftext sorgfältig durch und
              passen Sie ihn an, wo nötig.
            </p>
            <p>
              Brief nach Berlin ist ein Werkzeug zur Beschleunigung, kein Ersatz
              für Ihre eigene Urteilsfähigkeit. Sie schreiben den Brief, das Tool
              hilft Ihnen nur, ihn schneller zu formulieren. Die Verantwortung
              für den versendeten Inhalt liegt bei Ihnen.
            </p>
          </div>

          <p className="text-sm text-warmgrau/50">Stand: April 2026</p>
        </div>
      </div>
    </div>
  );
}
