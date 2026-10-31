import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, DEFAULT_OG_IMAGES } from "@/lib/config";

const TITLE = "Grundsätze für Kampagnen";
const DESCRIPTION =
  "Nach welchen Grundsätzen ich Kampagnen auf Brief-nach-Berlin freigebe: vereinbar mit dem Grundgesetz, im Einklang mit dem Stand der Wissenschaft, keine Parteiwerbung.";
const URL_PATH = "/kampagnen-grundsaetze";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: {
    canonical: `${APP_URL}${URL_PATH}`,
  },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
};

export default function KampagnenGrundsaetze() {
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
          {TITLE}
        </h1>

        <div className="font-body text-warmgrau space-y-6 leading-relaxed">
          <p>
            Einen Brief kann bei Brief-nach-Berlin jede und jeder schreiben, zu
            jedem Anliegen. Für Kampagnen gelten zusätzliche Regeln. Hier steht,
            nach welchen Grundsätzen ich entscheide, welche Kampagnen online
            gehen.
          </p>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Briefe für alle, Kampagnen mit Auswahl
            </h2>
            <p>
              Wer einen eigenen Brief schreibt, muss sich nur an die{" "}
              <Link href="/nutzungsbedingungen" className="text-waldgruen hover:underline">
                Nutzungsbedingungen
              </Link>{" "}
              halten. Ich prüfe Briefe nicht auf ihre politische Richtung. Eine
              Kampagne bekommt dagegen eine eigene Seite unter dem Namen
              Brief-nach-Berlin, und ich mache sie mit sichtbar. Getragen wird
              das Projekt von der gemeinnützigen WE AID gGmbH. Deshalb schaue
              ich mir jede Kampagne an, bevor sie online geht.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Was eine Kampagne mitbringen muss
            </h2>
            <p className="mb-2">Ich gebe eine Kampagne frei, wenn sie</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                mit dem Grundgesetz vereinbar ist. Dazu gehören die Würde jedes
                Menschen (Art. 1), die Gleichheit vor dem Gesetz und das Verbot
                von Diskriminierung (Art. 3) und der Schutz der natürlichen
                Lebensgrundlagen (Art. 20a). Zu Letzterem zählt nach dem
                Klimabeschluss des Bundesverfassungsgerichts von 2021 auch der
                Klimaschutz für künftige Generationen,
              </li>
              <li>
                dem Stand der Wissenschaft nicht widerspricht. Wer Fakten nennt,
                sollte sie belegen können,
              </li>
              <li>
                sich an eine Stelle richtet, die etwas ändern kann, und sagt,
                was sich ändern soll,
              </li>
              <li>
                sachlich bleibt und keine einzelnen Menschen angreift. Politische
                Entscheidungen zu kritisieren gehört natürlich dazu.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Parteien und Wahlen
            </h2>
            <p>
              Ich veröffentliche keine Wahlwerbung und keine Kampagne, die für
              oder gegen eine Partei mobilisiert. Gemeinnützige Organisationen
              müssen parteipolitisch neutral bleiben, und das gilt auch für
              Brief-nach-Berlin. Möglich sind Kampagnen, die ein
              rechtsstaatliches Verfahren fordern, etwa eine Prüfung durch ein
              Gericht. Wenn darin eine Partei genannt wird, prüfe ich die
              Kampagne im Einzelfall besonders genau.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-waldgruen-dark mb-2">
              Ich entscheide im Einzelfall
            </h2>
            <p>
              Auch wenn eine Kampagne alle Punkte erfüllt, gibt es keinen
              Anspruch darauf, dass ich sie veröffentliche. Brief-nach-Berlin ist
              ein kleines Projekt, das ich allein betreibe, und ich entscheide,
              wofür es seinen Namen hergibt. Wenn ich eine Kampagne nicht
              freigebe, schreibe ich der Person dahinter eine Mail und nenne den
              Grundsatz, an dem es hängt. Du kannst darauf antworten und
              widersprechen. Öffentlich mache ich solche Entscheidungen nicht.
            </p>
            <p className="mt-3">
              Dein Anliegen kannst du trotzdem jederzeit als eigenen Brief
              schreiben.{" "}
              <Link href="/" className="text-waldgruen hover:underline">
                Zum Brief-Tool
              </Link>
            </p>
          </div>

          <p className="text-sm text-warmgrau/50">Stand: 19. Oktober 2026</p>
        </div>
      </div>
    </div>
  );
}
