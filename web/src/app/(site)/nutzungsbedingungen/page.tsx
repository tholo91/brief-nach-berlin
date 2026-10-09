import Link from "next/link";
import { CONTACT } from "@/lib/contact";

export const metadata = {
  title: "Nutzungsbedingungen | Brief-nach-Berlin",
};

// PRÜFEN (Anwalt): Anbieter Thomas persönlich oder WE AID gGmbH? Haftungsklausel bei
// unentgeltlicher Nutzung ohne Account? Mail als Meldeweg nach DSA Art. 16 ausreichend?
// Verbotsliste gleichwertig zu Mistral Commercial Terms Ziff. 2.2?
// Deckt die Satzung der WE AID gGmbH ab, dass sie als Anbieter auftritt? Welche DSGVO-Pflichten gelten für personenbezogene
// Daten in Kampagnentexten nach EuGH C-492/23?

export default function Nutzungsbedingungen() {
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
          Nutzungsbedingungen
        </h1>

        <div className="font-body text-warmgrau space-y-6 leading-relaxed">
          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">Wer ich bin</h2>
            <p>
              Brief-nach-Berlin ist ein kostenloses Werkzeug von Thomas Lorenz
              (Anbieterangaben im{" "}
              <Link href="/impressum" className="text-waldgruen hover:underline">
                Impressum
              </Link>
              ). Die WE AID gGmbH ist Trägerin des Projekts für Spenden und
              Fördermittel. Mit der Nutzung des Tools akzeptierst du diese
              Bedingungen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Was das Tool macht
            </h2>
            <p>
              Du beschreibst dein Anliegen und gibst deine Postleitzahl an.
              Daraus schlage ich dir eine zuständige Person aus Politik oder
              Verwaltung vor, und eine KI von Mistral formuliert einen
              Briefentwurf. Den Entwurf bekommst du per Mail. Ich verschicke
              keine Briefe an Politikerinnen und Politiker. Das machst du
              selbst, von Hand.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Deine Verantwortung
            </h2>
            <p>
              Der Brief ist dein Brief. Du entscheidest, was drinsteht, prüfst
              und änderst den Entwurf, schreibst ihn ab, unterschreibst ihn und
              schickst ihn ab. Die Verantwortung für den Inhalt liegt bei dir.
              Ich mache mir dein Anliegen und den Inhalt deines Briefs nicht zu
              eigen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              KI-Entwürfe ohne Gewähr
            </h2>
            <p>
              Der Entwurf ist ein Vorschlag, den eine KI geschrieben hat. Er
              kann Fehler enthalten: falsche Fakten, eine falsche Zuständigkeit,
              eine veraltete Adresse oder einen Ton, der nicht zu dir passt.
              Prüfe Name, Amt und Adresse vor dem Versand bei einer offiziellen
              Quelle, zum Beispiel bundestag.de, der Seite deines Landtags oder
              deines Rathauses. Ich kann nicht zusagen, dass dein Brief
              ankommt, gelesen oder beantwortet wird.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Was nicht erlaubt ist
            </h2>
            <p className="mb-2">Du darfst das Tool nicht nutzen, um</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>jemanden zu bedrohen, zu beleidigen oder zu verleumden,</li>
              <li>
                zu Hass oder Gewalt gegen Menschen oder Gruppen aufzustacheln,
                etwa wegen Herkunft, Religion, Geschlecht oder Behinderung,
              </li>
              <li>dich als jemand anderes auszugeben,</li>
              <li>Straftaten vorzubereiten oder dazu aufzurufen,</li>
              <li>
                das Tool automatisiert oder massenhaft abzufragen oder seine
                Schutzmechanismen zu umgehen.
              </li>
            </ul>
            <p className="mt-3">
              Meinungen sind ausdrücklich erlaubt, auch unbequeme, zugespitzte
              oder unpopuläre. Ich prüfe Briefe nicht auf ihre politische
              Richtung.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Wie ich prüfe
            </h2>
            <p>
              Die KI ist angewiesen, keine Beleidigungen oder Unterstellungen
              zu formulieren. Öffentliche Kampagnentexte prüft zusätzlich ein
              automatischer Filter von Mistral. Bevor eine neue Kampagne online
              geht, schaue ich sie kurz durch. Das ist eine grobe Prüfung auf
              offensichtliche Verstöße und Spam, keine inhaltliche Prüfung.
              Filter machen Fehler. Wenn du glaubst, dass etwas zu
              Unrecht geblockt wurde, schreib mir.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Sperren und Löschen
            </h2>
            <p>
              Wer gegen diese Regeln verstößt, dem kann ich die Nutzung
              einschränken oder sperren, zum Beispiel über die E-Mail-Adresse.
              Kampagnen kann ich pausieren, sperren oder löschen. Wenn ich eine
              Kampagne sperre oder einschränke, sage ich dir per Mail, was ich
              gemacht habe und warum. Du kannst darauf antworten und
              widersprechen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">Kampagnen</h2>
            <p>
              Wer eine Kampagne startet, ist für alle Inhalte der
              Kampagnenseite verantwortlich: Titel, Texte, Name, Logo und Link.
              Du brauchst die Rechte an Logo und Bildern. Eine Kampagne geht
              erst online, wenn du deine E-Mail-Adresse bestätigt hast und ich
              sie freigegeben habe. Wer über eine Kampagne einen Brief
              schreibt, schreibt einen eigenen Brief. Dafür gelten dieselben
              Regeln wie für alle Briefe.
            </p>
            <p className="mt-3">
              <strong className="text-waldgruen-dark">
                Rechtswidrige Inhalte melden:
              </strong>{" "}
              Auf jeder Kampagnenseite findest du ganz unten den Link
              „Stimmt was nicht?“. Deine Meldung geht an die Person hinter der
              Kampagne und an mich. Alternativ schreib eine Mail an{" "}
              <a
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Kampagne melden")}`}
                className="text-waldgruen hover:underline"
              >
                {CONTACT.email}
              </a>
              . Nenn die Kampagne, das Problem und warum du den Inhalt für
              rechtswidrig hältst. Wenn du deine E-Mail-Adresse angibst oder mir
              schreibst, bestätige ich den Eingang und prüfe die Meldung
              zügig.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">Haftung</h2>
            <p>
              Das Tool ist kostenlos. Für Vorsatz und grobe Fahrlässigkeit
              hafte ich unbeschränkt, ebenso für Schäden an Leben, Körper oder
              Gesundheit und nach dem Produkthaftungsgesetz. Bei leichter
              Fahrlässigkeit hafte ich nur, wenn ich eine Pflicht verletze, ohne
              die das Tool nicht funktionieren kann, und nur für den Schaden,
              mit dem man typischerweise rechnen muss. Im Übrigen ist die
              Haftung ausgeschlossen. Ich kann nicht zusagen, dass das Tool
              immer erreichbar ist.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Änderungen
            </h2>
            <p>
              Ich kann diese Bedingungen ändern, etwa wenn sich das Tool oder
              die Rechtslage ändert. Es gilt die Fassung, die zum Zeitpunkt
              deiner Nutzung hier steht. Wer eine Kampagne betreibt, bekommt bei
              wesentlichen Änderungen eine Mail.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">Kontakt</h2>
            <p>
              E-Mail:{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-waldgruen hover:underline"
              >
                {CONTACT.email}
              </a>
              . Diese Adresse ist auch die Kontaktstelle für Behörden und
              Nutzende nach Art. 11 und 12 des Digital Services Act. Du kannst
              mir auf Deutsch oder Englisch schreiben. Mehr zum Datenschutz
              steht in der{" "}
              <Link href="/datenschutz" className="text-waldgruen hover:underline">
                Datenschutzerklärung
              </Link>
              , mehr zur KI unter{" "}
              <Link href="/ki-transparenz" className="text-waldgruen hover:underline">
                KI &amp; Transparenz
              </Link>
              .
            </p>
          </div>

          <p className="text-sm text-warmgrau/50">Stand: 9. Oktober 2026</p>
        </div>
      </div>
    </div>
  );
}
