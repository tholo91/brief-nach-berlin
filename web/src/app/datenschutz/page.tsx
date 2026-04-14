import Link from "next/link";

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
              Zur Plangemühle 5
              <br />
              47198 Duisburg
              <br />
              Deutschland
              <br />
              E-Mail:{" "}
              <a
                href="mailto:thomas_lorenz@posteo.de"
                className="text-waldgruen hover:underline"
              >
                thomas_lorenz@posteo.de
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              2. Allgemeines zur Datenverarbeitung
            </h2>
            <p>
              Brief nach Berlin verarbeitet personenbezogene Daten
              ausschließlich zur Erbringung des Dienstes: die Erstellung eines
              personalisierten Briefs an Ihren zuständigen Abgeordneten. Wir
              speichern keine Nutzerdaten dauerhaft auf unseren Servern. Alle
              eingegebenen Daten (Postleitzahl, E-Mail-Adresse, Anliegen) werden
              ausschließlich während der Verarbeitung Ihrer Anfrage verwendet
              und danach verworfen. Es werden keine Cookies gesetzt, kein
              Tracking eingesetzt und keine Nutzerkonten angelegt.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              3. Hosting (Vercel)
            </h2>
            <p>
              Diese Website wird bei Vercel Inc., 340 S Lemon Ave #4133,
              Walnut, CA 91789, USA gehostet. Vercel verarbeitet technisch
              notwendige Verbindungsdaten (IP-Adresse, Zugriffszeitpunkt).
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse an zuverlässigem Hosting). Drittlandtransfer: USA — auf
              Basis von EU-Standardvertragsklauseln (SCCs) und dem EU-US Data
              Privacy Framework. Weitere Informationen finden Sie in der{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                Datenschutzerklärung von Vercel
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              4. Verarbeitung von Postleitzahlen
            </h2>
            <p>
              Zweck: Zuordnung Ihrer Postleitzahl zum zuständigen
              Bundestagswahlkreis und dem dortigen Abgeordneten.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Durchführung
              vorvertraglicher Maßnahmen auf Anfrage der betroffenen Person).
              Verarbeitete Daten: Postleitzahl (5 Ziffern). Empfänger: Keine —
              die Zuordnung erfolgt vollständig lokal anhand statischer Daten
              auf dem Server. Speicherdauer: Keine Speicherung. Die
              Postleitzahl wird ausschließlich während der Verarbeitung Ihrer
              Anfrage verwendet.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              5. Verarbeitung der E-Mail-Adresse
            </h2>
            <p>
              Zweck: Zustellung des generierten Briefs per E-Mail.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Durchführung
              vorvertraglicher Maßnahmen). Verarbeitete Daten: E-Mail-Adresse.
              Empfänger: Brevo SAS (siehe Abschnitt 10). Speicherdauer: Ihre
              E-Mail-Adresse wird ausschließlich für den einmaligen Versand des
              Briefs an Brevo übermittelt und nicht auf unseren Servern
              gespeichert. Brevo speichert Transaktionsprotokolle gemäß eigener
              Aufbewahrungsfristen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              6. Verarbeitung des Anliegens (Freitext und Spracheingabe)
            </h2>
            <p className="mb-3">
              Zweck: Erstellung eines personalisierten Briefs auf Basis Ihres
              beschriebenen Anliegens. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
              DSGVO.
            </p>
            <p className="mb-3">
              <strong className="text-waldgruen-dark">Freitexteingabe:</strong>{" "}
              Ihr Anliegen wird in Textform an Mistral AI (siehe Abschnitt 8)
              zur Brieferstellung und an OpenAI (siehe Abschnitt 9) zur
              Inhaltsprüfung übermittelt. Der Text wird nicht auf unseren
              Servern gespeichert.
            </p>
            <p>
              <strong className="text-waldgruen-dark">
                Spracheingabe (optional):
              </strong>{" "}
              Wenn Sie die Spracheingabe nutzen, wird Ihre Audioaufnahme an die
              Mistral Voxtral API zur Transkription übermittelt. Die
              Audioaufnahme wird ausschließlich im Browser während der Aufnahme
              gehalten und nach der Transkription verworfen. Sie wird nicht auf
              unseren Servern gespeichert.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              7. Politikerdaten
            </h2>
            <p>
              Die auf dieser Website angezeigten Politikerdaten (Name, Titel,
              Parteizugehörigkeit, Wahlkreis, Postadresse) stammen aus öffentlich
              zugänglichen Quellen: der Datenbank von Abgeordnetenwatch.de
              (Lizenz: CC0) sowie den offenen Daten der Bundeswahlleiterin.
              Diese Daten sind keine personenbezogenen Daten der
              Websitenutzer, sondern öffentliche Informationen über Amtsträger.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              8. KI-gestützte Briefgenerierung (Mistral AI)
            </h2>
            <p>
              Zweck: Erstellung eines formalen, persönlichen Briefs auf Basis
              Ihres Anliegens. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
              Verarbeitete Daten: Ihr Anliegen (Freitext oder transkribierte
              Spracheingabe), optionale Angaben (Name, Parteimitgliedschaft,
              Organisationszugehörigkeit). Empfänger: Mistral AI, 15 rue des
              Halles, 75001 Paris, Frankreich. Serverstandort: EU.
              Drittlandtransfer: Keiner — Mistral AI ist ein französisches
              Unternehmen mit Servern in der EU. Speicherdauer: Keine
              dauerhafte Speicherung auf unseren Servern. Mistral AI
              verarbeitet die Daten gemäß ihrer eigenen Datenschutzrichtlinie
              und ihrem Auftragsverarbeitungsvertrag (AVV). Weitere
              Informationen:{" "}
              <a
                href="https://legal.mistral.ai/terms/data-processing-addendum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                legal.mistral.ai/terms/data-processing-addendum
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              9. Inhaltsprüfung (OpenAI Moderation API)
            </h2>
            <p>
              Zweck: Sicherheitsprüfung der Nutzereingabe und des generierten
              Briefs auf beleidigende, bedrohliche oder schädliche Inhalte.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse an der Verhinderung von Missbrauch). Verarbeitete
              Daten: Ihr Anliegen (Freitext) und der generierte Brieftext.
              Empfänger: OpenAI, L.L.C., 3180 18th Street, San Francisco, CA
              94110, USA. Serverstandort: USA. Drittlandtransfer: USA — auf
              Basis von EU-Standardvertragsklauseln (SCCs). Speicherdauer:
              Keine Speicherung auf unseren Servern. OpenAI verarbeitet die
              Daten gemäß dem Auftragsverarbeitungsvertrag (DPA). Weitere
              Informationen:{" "}
              <a
                href="https://openai.com/policies/data-processing-addendum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                openai.com/policies/data-processing-addendum
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              10. E-Mail-Versand (Brevo)
            </h2>
            <p>
              Zweck: Zustellung des generierten Briefs per E-Mail an Sie.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Verarbeitete Daten:
              Ihre E-Mail-Adresse, der generierte Brieftext, die Postadresse
              des Abgeordneten. Empfänger: Brevo SAS (ehemals Sendinblue), 106
              boulevard Haussmann, 75008 Paris, Frankreich. Serverstandort: EU
              (OVH-Rechenzentren in Frankreich und Deutschland).
              Drittlandtransfer: Keiner — Brevo ist ein französisches
              Unternehmen mit Servern in der EU. Speicherdauer: Brevo
              speichert Transaktionsprotokolle gemäß eigener
              Aufbewahrungsrichtlinien. Wir speichern keine E-Mail-Daten auf
              unseren Servern. Auftragsverarbeitung: Es besteht ein
              Auftragsverarbeitungsvertrag (AVV) mit Brevo.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              11. Ihre Rechte
            </h2>
            <p>
              Sie haben gemäß DSGVO das Recht auf Auskunft (Art. 15),
              Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
              Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie das
              Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77).
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              12. Streitschlichtung
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
              13. KI-generierte Inhalte und Disclaimer
            </h2>
            <p className="mb-3">
              Brief nach Berlin nutzt künstliche Intelligenz, um Ihr Anliegen
              schnell und einfach in einen formalen Brief umzuwandeln.
              KI-Systeme können jedoch Fehler machen — und das sollten Sie
              wissen, bevor Sie einen Brief versenden.
            </p>
            <p className="mb-3">
              <strong className="text-waldgruen-dark">Wir garantieren nicht</strong> die
              Richtigkeit der Politikerdaten (Name, Titel, Adresse, Zuständigkeit).
              Diese Daten stammen aus öffentlichen Quellen (Abgeordnetenwatch,
              Bundeswahlleiter) und können veraltet oder unvollständig sein.
              Wir garantieren ebenfalls nicht die inhaltliche Korrektheit oder
              Angemessenheit des generierten Brieftexts — KI kann Kontext
              falsch einschätzen, Nuancen übersehen oder Fehlannahmen treffen.
            </p>
            <p className="mb-3">
              <strong className="text-waldgruen-dark">Bitte prüfen Sie vor dem Versand:</strong>{" "}
              Name, Titel und Adresse des Abgeordneten anhand offizieller
              Quellen — zum Beispiel{" "}
              <a
                href="https://www.bundestag.de/abgeordnete"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                bundestag.de
              </a>
              , die Website Ihres Landtags oder die Website Ihres Rathauses.
              Lesen Sie außerdem den generierten Brieftext sorgfältig durch und
              passen Sie ihn an, wo nötig.
            </p>
            <p>
              Brief nach Berlin ist ein Werkzeug zur Beschleunigung — kein
              Ersatz für Ihre eigene Urteilsfähigkeit. Sie schreiben den Brief,
              wir helfen Ihnen nur, ihn schneller zu formulieren.
              Die Verantwortung für den versendeten Inhalt liegt bei Ihnen.
            </p>
          </div>

          <p className="text-sm text-warmgrau/50">Stand: April 2026</p>
        </div>
      </div>
    </div>
  );
}
