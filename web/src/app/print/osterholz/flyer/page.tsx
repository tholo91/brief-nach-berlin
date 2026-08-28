import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Osterholz schreibt mit - Infoblatt",
  robots: { index: false, follow: false },
};

const topics = [
  "Miete und Wohnen",
  "Schule und Kita",
  "Bus und Bahn",
  "Sicherheit und Beleuchtung",
  "Pflege und Gesundheit",
  "Spielplätze und Grünflächen",
];

export default function OsterholzFlyerPage() {
  return (
    <main className="print-flyer print-sheet">
      <header className="print-flyer-header">
        <div>
          <p className="print-kicker">Brief-nach-Berlin × Osterholz</p>
          <h1>Osterholz schreibt mit.</h1>
          <p>
            Was sollte sich in deinem Viertel ändern? Aus deinem Anliegen wird
            ein konkreter Brief an die richtige politische Stelle.
          </p>
        </div>
        <div className="print-flyer-stamp">DEINE<br />STIMME<br />ZÄHLT</div>
      </header>

      <section className="print-flyer-intro">
        <p className="print-hand">Du musst kein Politikprofi sein.</p>
        <p>
          Du kennst deinen Alltag. Du weißt, wo es hakt. Brief-nach-Berlin hilft
          dir, deine Beobachtung so aufzuschreiben, dass sie bei den zuständigen
          Politiker:innen ankommen kann.
        </p>
      </section>

      <section className="print-flyer-steps">
        {[
          ["01", "Erzählen", "Was passiert? Was stört dich?"],
          ["02", "Einordnen", "Wir finden die zuständige politische Ebene."],
          ["03", "Abschicken", "Du schreibst deinen persönlichen Brief ab."],
        ].map(([number, title, body]) => (
          <article key={number}>
            <span>{number}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="print-flyer-topics">
        <h2>Zum Beispiel:</h2>
        <div>{topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
      </section>

      <section className="print-flyer-language">
        <h2>Was sollte sich in deinem Viertel ändern?</h2>
        <p>
          Mahallende ne değişmeli? &nbsp;·&nbsp; ماذا يجب أن يتغير في منطقتك؟
          &nbsp;·&nbsp; What should change in your neighbourhood?
        </p>
        <p className="print-flyer-language-note">
          Du kannst uns auch auf Türkisch, Arabisch oder Englisch ansprechen.
        </p>
      </section>

      <footer className="print-flyer-footer">
        <div>
          <p className="print-flyer-cta">Dein Anliegen. Dein Brief. Deine Stimme.</p>
          <p>Scanne den QR-Code oder gehe auf<br /><strong>www.brief-nach-berlin.de/osterholz</strong></p>
        </div>
        <Image
          src="/print/osterholz-qr.png"
          alt="QR-Code zur Osterholz-Seite"
          width={702}
          height={702}
          unoptimized
        />
      </footer>
    </main>
  );
}
