import type { Metadata } from "next";
import Image from "next/image";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Osterholz schreibt mit - Plakat",
  robots: { index: false, follow: false },
};

export default function OsterholzPosterPage() {
  return (
    <main className="print-poster print-sheet">
      <div className="print-poster-stripe" aria-hidden="true" />
      <div className="print-poster-content">
        <div className="print-postmark">BREMEN-OST</div>
        <p className="print-kicker">Brief-nach-Berlin × Osterholz</p>
        <h1>
          Was sollte sich
          <br />
          in deinem Viertel
          <br />
          ändern?
        </h1>
        <p className="print-poster-lead">
          Dein Alltag ist politisch. Wir helfen dir, dein Anliegen an die
          richtige politische Stelle zu bringen.
        </p>
        <div className="print-poster-rule" aria-hidden="true" />
        <div className="print-poster-bottom">
          <div>
            <p className="print-poster-action">In wenigen Minuten zum eigenen Brief.</p>
            <ol>
              <li>Anliegen schildern</li>
              <li>Zuständige Stelle finden</li>
              <li>Brief abschreiben und abschicken</li>
            </ol>
            <p className="print-url">www.brief-nach-berlin.de/osterholz</p>
          </div>
          <div className="print-qr-wrap">
            <Image
              src="/print/osterholz-qr.png"
              alt="QR-Code zur Osterholz-Seite"
              width={702}
              height={702}
              unoptimized
            />
            <span>Scannen und starten</span>
          </div>
        </div>
      </div>
      <p className="print-poster-footer">Kostenlos · ohne Anmeldung · für dein Viertel</p>
      <p className="print-hidden-url">{APP_URL}/osterholz</p>
    </main>
  );
}
