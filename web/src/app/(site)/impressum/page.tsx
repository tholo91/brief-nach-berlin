import Link from "next/link";
import { CONTACT } from "@/lib/contact";

export const metadata = {
  title: "Impressum | Brief-nach-Berlin",
};

export default function Impressum() {
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
          Impressum
        </h1>

        <div className="font-body text-warmgrau space-y-6 leading-relaxed">
          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Angaben gemäß § 5 TMG
            </h2>
            <p>
              Thomas Lorenz
              <br />
              A.d. Schleifmühle 44
              <br />
              28203 Bremen
              <br />
              Deutschland
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
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p>
              Thomas Lorenz
              <br />
              A.d. Schleifmühle 44
              <br />
              28203 Bremen
              <br />
              Deutschland
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Streitschlichtung
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
            <p className="mt-2">
              Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Haftungsausschluss
            </h2>
            <p>
              Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für
              die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können
              wir jedoch keine Gewähr übernehmen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
