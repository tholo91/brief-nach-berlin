import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { APP_URL, FOUNDER_LINKEDIN, FOUNDER_FEEDBACK_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Warum es Brief-nach-Berlin gibt | Brief-nach-Berlin",
  description:
    "Die Geschichte hinter Brief-nach-Berlin. Viele Menschen beschweren sich über Politik, aber kaum jemand schreibt. Brief-nach-Berlin nimmt die Hürden zwischen Frust und Briefkasten weg.",
  alternates: {
    canonical: `${APP_URL}/warum`,
  },
  openGraph: {
    title: "Warum es Brief-nach-Berlin gibt",
    description:
      "Viele Menschen beschweren sich über Politik, aber kaum jemand schreibt. Brief-nach-Berlin nimmt die Hürden zwischen Frust und Briefkasten weg.",
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}/warum`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Warum es Brief-nach-Berlin gibt",
    description:
      "Viele Menschen beschweren sich über Politik, aber kaum jemand schreibt. Brief-nach-Berlin nimmt die Hürden zwischen Frust und Briefkasten weg.",
  },
};

export default function WarumPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Hinter dem Projekt
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Warum es Brief-nach-Berlin gibt
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Viele Menschen beschweren sich über Politik. Wenige schreiben. Nicht,
          weil sie nichts zu sagen hätten, sondern weil zwischen Frust und
          Briefkasten zu viele kleine Hürden liegen.
        </p>

        <article className="font-body text-warmgrau leading-[1.85] space-y-7 text-base md:text-lg">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Frust ohne Adresse
          </h2>
          <p>
            Mir ist über die Zeit aufgefallen: Fast alle Menschen, mit denen
            ich rede, regen sich über irgendetwas in der Politik auf. Über das
            Bahnchaos, über die Schule der Tochter, über den Zustand des
            eigenen Stadtteils. Aber kaum jemand schreibt deswegen einen Brief
            an die zuständige Person. Der Frust ist da, der Adressat fehlt.
          </p>
          <p>
            Dabei sind die Hürden alle technischer Natur: Wer ist eigentlich
            mein Abgeordneter? Wie spreche ich den an? Was schreibe ich? Wie
            lang? Wohin schicken? Lohnt sich das? Bis man das geklärt hat, ist
            der Abend vorbei und die Tagesschau läuft schon. Beim nächsten Mal
            das gleiche Spiel.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Der Auslöser: ein Telefonat mit meiner Mutter
          </h2>
          <p>
            Ein konkretes Beispiel dafür war meine Mutter. Sie wohnt in
            Duisburg und hat irgendwann am Telefon über ein paar Probleme im
            Ruhrgebiet gesprochen. Ich habe gesagt: &bdquo;Warum schreibst du
            nicht mal einen Brief an deine Abgeordneten? Das dauert doch nur
            zehn, fünfzehn Minuten.&ldquo;
          </p>
          <p>
            Sie hat es nicht gemacht. Nicht aus Desinteresse, sondern weil der
            Aufwand sich für sie nicht nach fünfzehn Minuten anfühlte: Erst
            mal recherchieren, wer überhaupt für was zuständig ist. Dann die
            richtige Adresse finden. Dann den Brief so formulieren, dass er
            ernst genommen wird und nicht wie ein verärgerter Leserbrief
            klingt. Dann die Argumente sauber aufbauen. Das wurde Woche um
            Woche aufgeschoben.
          </p>
          <p>
            Genau an dieser Stelle setzt Brief-nach-Berlin an. Nicht für meine
            Mutter speziell, sondern für alle, denen es so geht.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Aus fünf Hürden wird eine
          </h2>
          <p>
            Du sagst uns, was dich stört, und deine Postleitzahl. Den Rest
            übernehmen wir. Wir finden die richtige Ansprechperson, wir
            schlagen einen Brief vor, der zu deinem Anliegen passt, und du
            schreibst ihn in Ruhe ab. Du bleibst die Autorin, die
            Unterzeichnerin, der Mensch dahinter. Wir sind nur die Brücke
            zwischen dem Anliegen und dem Schreibtisch der richtigen Person.
          </p>
          <p>
            Meine Mutter war übrigens die erste Nutzerin. Sie hat ihren Brief
            geschrieben, abgeschickt und sagt seitdem, dass sich politisch
            etwas verändert hat: nicht in Duisburg, sondern in ihr selbst. Aus
            &bdquo;da müsste mal jemand etwas tun&ldquo; ist &bdquo;ich habe
            etwas getan&ldquo; geworden. Genau dieses kleine Empowerment ist
            der eigentliche Effekt, um den es geht.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Das hier ist keine Petitionsseite
          </h2>
          <p>
            Petitionen sind eine andere Sache. Da unterschreiben tausend Leute
            denselben Text, und am Ende landet das Ergebnis in einem
            Ausschuss, der es wohlwollend zur Kenntnis nimmt. Das ist nicht,
            was hier passiert.
          </p>
          <p>
            Brief-nach-Berlin produziert echte, individuelle Briefe. Jeder
            Brief ist deiner, mit deinen Worten, an deinen konkreten
            Wahlkreisabgeordneten. Du schreibst ihn von Hand ab und schickst
            ihn selbst los. Das ist mehr Aufwand als ein Klick auf
            &bdquo;Unterschreiben&ldquo; und genau deshalb wirkt es. Ein
            persönlicher Brief landet auf einem Schreibtisch. Eine
            Unterschrift in einer Liste landet in einer Statistik.
          </p>

          <div className="not-prose my-10 p-6 md:p-8 bg-waldgruen/[0.06] border-l-4 border-waldgruen rounded-r-xl">
            <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/70 mb-3">
              Empfehlung in der Lage der Nation
            </p>
            <p className="font-handwriting text-xl md:text-2xl text-waldgruen-dark leading-snug mb-3">
              Seitdem Brief-nach-Berlin in der{" "}
              <a
                href="https://lagedernation.org/podcast/ldn478-hantavirus-warum-wir-heute-schlechter-dastehen-als-vor-corona/#shownotes"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-waldgruen/40 underline-offset-4 hover:decoration-waldgruen"
              >
                Lage der Nation (Folge 478)
              </a>{" "}
              empfohlen wurde, haben sich die Nutzerzahlen versechsfacht.
            </p>
            <p className="font-body text-sm text-warmgrau">
              Wenn das Tool für dich funktioniert hat, erzähl es weiter. Genau
              so verbreitet sich das hier.
            </p>
          </div>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Wer dahintersteht
          </h2>

          <div className="not-prose flex flex-col sm:flex-row gap-6 items-start sm:items-center my-6">
            <div className="shrink-0">
              <Image
                src="/images/thomas-portrait.webp"
                alt="Thomas Lorenz, der hinter Brief-nach-Berlin steht"
                width={400}
                height={360}
                className="w-[200px] h-auto rounded-2xl border-4 border-creme shadow-lg shadow-waldgruen/20"
              />
            </div>
            <div className="font-body text-warmgrau leading-relaxed text-base md:text-lg">
              <p className="font-body text-lg font-bold text-waldgruen-dark mb-1">
                Thomas Lorenz
              </p>
              <p className="font-typewriter text-sm text-waldgruen/70 mb-2">
                Indie Builder, Bremen
              </p>
              <p className="mb-4">
                Geboren in Duisburg, gelandet in Bremen. Politikwissenschaft
                studiert in Lissabon, Leipzig und Bologna. Seitdem baue ich
                Tools, die gute Initiativen voranbringen und Spaß machen
                sollen.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={FOUNDER_LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-waldgruen text-creme font-body text-sm font-semibold px-4 py-2 rounded-lg hover:bg-waldgruen-dark transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.23 0z" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href={FOUNDER_FEEDBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-creme border-2 border-waldgruen text-waldgruen font-body text-sm font-semibold px-4 py-2 rounded-lg hover:bg-waldgruen/5 transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  Kontakt
                </a>
              </div>
            </div>
          </div>

          <p>
            Ich arbeite mit einem Tech-for-Good-Ansatz. Das heißt: Nicht alles,
            was technisch geht, sollte auch gebaut werden. Aber wenn Technik
            eine Hürde senken kann, die sonst Leute davon abhält, etwas
            Sinnvolles zu tun, dann ist das genau der Punkt, an dem es sich
            lohnt. Brief-nach-Berlin ist so ein Punkt. Es ersetzt kein
            politisches Engagement. Es ersetzt nur die Stunde Recherche, die
            zwischen meiner Mutter und ihrem ersten Brief gestanden hat.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Warum ich das aus eigener Tasche bezahle
          </h2>
          <p>
            Brief-nach-Berlin ist kostenlos, ohne Werbung, ohne Bezahlschranke.
            Server, KI-Kosten, Domain, alles läuft über mich. Ich verdiene
            hier nichts, und das ist Absicht.
          </p>
          <p>
            Der Grund: Ich schätze unser politisches System in Deutschland
            sehr. Es ist nicht perfekt, aber es ist eines der wenigen, in dem
            ein einzelner Mensch mit einem einzelnen Brief tatsächlich in
            einem Abgeordnetenbüro landen und gehört werden kann. Das ist eine
            seltene Errungenschaft, und sie funktioniert nur, solange Menschen
            sie auch nutzen.
          </p>
          <p>
            Was mich antreibt, ist das, was ich Selbstgesundheit in der
            Demokratie nenne. Demokratie ist kein Zuschauersport. Sie
            funktioniert nur, wenn Menschen das Gefühl haben, dass sie wirken
            können, und dieses Gefühl entsteht nicht im Kopf, sondern in der
            Handlung. Einmal einen Brief geschrieben zu haben, einmal eine
            Antwort aus einem Abgeordnetenbüro gelesen zu haben, einmal
            erlebt zu haben, dass das System auf einen reagiert: das
            verändert etwas.
          </p>
          <p>
            Solange dieses Tool Leuten dabei hilft, trage ich die Kosten
            gerne selbst. Sollte es eines Tages zu groß werden, frage ich um
            Unterstützung. Bis dahin läuft es einfach weiter.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Was mir bei den Daten wichtig ist
          </h2>
          <p>
            Brief-nach-Berlin sammelt keine Daten, die es nicht braucht. Kein
            Account, kein Tracking, keine Profile. Dein Anliegen und dein
            Brief bleiben bei dir. Das ist nicht nur DSGVO-konform, es ist
            die einzige Art, wie eine politische Anwendung in meinen Augen
            funktionieren darf.
          </p>
        </article>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark mb-4">
            Probier es aus
          </h2>
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Sag uns, was dich stört, und deine Postleitzahl. Drei Minuten
            später hast du einen Brief, den du in Ruhe abschreiben kannst.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Mit deinem Brief anfangen &rarr;
          </Link>
          <p className="mt-4 font-body text-sm text-warmgrau/60">
            Kostenlos, ohne Anmeldung, ohne Tracking.
          </p>
        </div>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed space-y-3">
          <p>
            Wenn dich interessiert, warum gerade ein handgeschriebener Brief
            mehr bewirkt als eine E-Mail, lies{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              Warum ein Brief mehr ist als ein Brief
            </Link>
            .
          </p>
          <p>
            Wer noch nicht weiß, wie man so einen Brief eigentlich aufsetzt,
            findet alles im{" "}
            <Link href="/guide" className="text-waldgruen hover:underline">
              Guide
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
