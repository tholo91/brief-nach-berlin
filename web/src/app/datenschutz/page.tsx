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
              Diese Website erhebt und verarbeitet derzeit keine
              personenbezogenen Daten. Es werden keine Cookies gesetzt, kein
              Tracking eingesetzt und keine Nutzerdaten gespeichert.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              3. Hosting
            </h2>
            <p>
              Diese Website wird bei Vercel Inc. gehostet. Beim Aufruf der Seite
              werden technisch notwendige Verbindungsdaten (z.B. IP-Adresse)
              kurzzeitig verarbeitet. Weitere Informationen finden Sie in der{" "}
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
              4. Ihre Rechte
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
              5. Streitschlichtung
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
              6. KI-generierte Inhalte und Disclaimer
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
