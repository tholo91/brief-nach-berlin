import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/schule/PrintButton";
import { APP_URL, DEFAULT_OG_IMAGES } from "@/lib/config";
import {
  LESSON_45,
  LESSON_90_EXTRAS,
  PRECHECK_ITEMS,
  TAFELBILD,
  TAFELBILD_MERKSATZ,
  WORKSHEET_CHECKLIST,
  formatMinuteRange,
} from "@/lib/schule/lessonPlan";

const CANONICAL_URL = `${APP_URL}/unterricht/ablauf`;
const TITLE = "Ablauf und Arbeitsblatt für den Unterricht | Brief-nach-Berlin";
const DESCRIPTION =
  "Zum Ausdrucken: Stundenablauf, Arbeitsblatt und Tafelbild für Briefe an Abgeordnete im Unterricht.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "de_DE",
    url: CANONICAL_URL,
  },
};

// Liegt bewusst außerhalb von app/(site): Die globale Druckregel blendet alles
// außer einem <main> direkt unter <body> aus, das Site-Layout würde leer drucken.
// Das Tafelbild steht im Druck als drei Zeilen hochkant (lesbarer als drei schmale
// Spalten auf A4 hoch), am Bildschirm nebeneinander.
// Echte Linien statt Hintergrundverlauf: Browser drucken Hintergründe standardmäßig nicht.
function WritingLines({ count }: { count: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="lesson-line" />
      ))}
    </div>
  );
}

export default function SchuleAblaufPage() {
  return (
    <main className="lesson-print">
      <header className="lesson-screen-only">
        <Link href="/" className="lesson-brand">
          Brief-nach-Berlin
        </Link>
        <div className="lesson-toolbar">
          <Link href="/unterricht" className="lesson-link">
            Zurück zur Seite für Schulen
          </Link>
          <PrintButton />
        </div>
      </header>

      <section className="lesson-sheet" aria-labelledby="lesson-ablauf">
        <h1 id="lesson-ablauf">Stundenablauf</h1>
        <h2>45 Minuten</h2>
        <table className="lesson-table">
          <thead>
            <tr>
              <th scope="col">Minuten</th>
              <th scope="col">Phase</th>
              <th scope="col">Was passiert</th>
            </tr>
          </thead>
          <tbody>
            {LESSON_45.map((row) => (
              <tr key={row.from}>
                <td>{formatMinuteRange(row)}</td>
                <th scope="row">{row.phase}</th>
                <td>{row.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Für 90 Minuten zusätzlich</h2>
        <ul>
          {LESSON_90_EXTRAS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h2>Vorher kurz prüfen</h2>
        <ul>
          {PRECHECK_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="lesson-sheet" aria-labelledby="lesson-arbeitsblatt">
        <h1 id="lesson-arbeitsblatt">Arbeitsblatt: Mach den Brief zu deinem</h1>
        <p className="lesson-nameline">
          <span>Name, Klasse:</span>
          <span className="lesson-fill" aria-hidden="true" />
        </p>
        <p>
          Schreib den Entwurf von Hand ab. Hak beim Abschreiben ab, was dein
          Brief schon hat.
        </p>
        <ul className="lesson-checklist">
          {WORKSHEET_CHECKLIST.map((item) => (
            <li key={item}>
              <span className="lesson-box" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <div className="lesson-field">
          <h2>Ein Satz in meinen eigenen Worten</h2>
          <WritingLines count={3} />
        </div>
        <div className="lesson-field">
          <h2>Peer-Feedback (90 Minuten)</h2>
          <p>Was ist an diesem Brief stark? Was fehlt noch?</p>
          <WritingLines count={5} />
        </div>
      </section>

      <section className="lesson-sheet" aria-labelledby="lesson-tafel">
        <h1 id="lesson-tafel">Tafelbild: Wer ist zuständig?</h1>
        <div className="lesson-tafel">
          {TAFELBILD.map((col) => (
            <article key={col.level}>
              <h2>{col.level}</h2>
              <h3>Wer entscheidet</h3>
              <p>{col.decides}</p>
              <h3>Beispiele</h3>
              <ul>
                {col.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="lesson-merksatz">
          <strong>Merksatz:</strong> {TAFELBILD_MERKSATZ}
        </p>
      </section>
    </main>
  );
}
