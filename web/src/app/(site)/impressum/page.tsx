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
              Angaben gemäß § 5 DDG
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
              Projektträgerschaft
            </h2>
            <p>
              Brief-nach-Berlin steht als gemeinnütziges Projekt unter der
              Trägerschaft der{" "}
              <a
                href="https://www.we-aid.org/de/impressum/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline"
              >
                WE AID gGmbH
              </a>
              . Für die Annahme und Verwaltung von Spenden und Fördermitteln
              ist WE AID gGmbH als Projektträgerin zuständig.
            </p>
            <p className="mt-2">
              WE AID gGmbH
              <br />
              Anna-Louisa-Karsch-Str. 2
              <br />
              10178 Berlin
              <br />
              Registergericht: Amtsgericht Charlottenburg
              <br />
              Registernummer: HRB 241239 B
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
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
              Ich bin nicht bereit oder verpflichtet, an
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
              die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann
              ich jedoch keine Gewähr übernehmen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
