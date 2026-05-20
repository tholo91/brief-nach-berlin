import Link from "next/link";
import { Figure } from "@/components/editorial/Figure";
import { Prose } from "@/components/editorial/Prose";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

const TITLE = "Erwähnt in der Lage der Nation";
const DESCRIPTION =
  "Im April 2026 wurde Brief-nach-Berlin in Folge 478 der Lage der Nation erwähnt. Seitdem hat sich die Nutzung versechsfacht. Eine kleine Notiz.";
const URL_PATH = "/lage-der-nation";
const PUBLISHED = "2026-04-18";

export const metadata: Metadata = {
  title: `${TITLE} | Brief nach Berlin`,
  description: DESCRIPTION,
  alternates: {
    canonical: `${APP_URL}${URL_PATH}`,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: { "@type": "Organization", name: "Brief nach Berlin" },
  publisher: {
    "@type": "Organization",
    name: "Brief nach Berlin",
    url: APP_URL,
  },
  mainEntityOfPage: `${APP_URL}${URL_PATH}`,
  inLanguage: "de-DE",
  mentions: {
    "@type": "PodcastEpisode",
    name: "Lage der Nation Folge 478",
    url: "https://lagedernation.org/podcast/ldn478-hantavirus-warum-wir-heute-schlechter-dastehen-als-vor-corona/",
  },
};

export default function LageDerNationPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Eine kleine Notiz
          </p>
          <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
            Erwähnt in der Lage der Nation
          </h1>

          <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-2 text-pretty">
            Philip Banse und Ulf Buermeyer haben Brief-nach-Berlin in Folge 478
            erwähnt. Was danach passiert ist, hat mich selbst überrascht.
          </p>

        <Prose>
          <div className="bg-waldgruen/5 border-l-4 border-waldgruen/40 px-6 py-5 rounded-r-lg">
            <p className="font-handwriting text-lg md:text-xl text-waldgruen-dark leading-relaxed">
              Brief-nach-Berlin wurde in{" "}
              <a
                href="https://lagedernation.org/podcast/ldn478-hantavirus-warum-wir-heute-schlechter-dastehen-als-vor-corona/?t=1%3A19%3A23"
                target="_blank"
                rel="noopener noreferrer"
                className="text-waldgruen hover:underline font-bold"
              >
                Folge 478 der Lage der Nation
              </a>{" "}
              vorgestellt, ab 1 Std. 19 Min.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10">
            <div className="bg-waldgruen/8 border border-waldgruen/15 rounded-xl px-6 py-8 text-center hover:-translate-y-1 transition-transform">
              <p className="font-body text-5xl md:text-6xl font-bold text-waldgruen-dark mb-2">
                6&times;
              </p>
              <p className="font-typewriter text-sm tracking-wide text-warmgrau/80">
                so viele Briefe pro Tag
              </p>
              <p className="font-body text-xs text-warmgrau/60 mt-1">
                seit der Erwähnung
              </p>
            </div>
            <div className="bg-airmail-blau/8 border border-airmail-blau/20 rounded-xl px-6 py-8 text-center hover:-translate-y-1 transition-transform">
              <p className="font-body text-5xl md:text-6xl font-bold text-waldgruen-dark mb-2">
                #478
              </p>
              <p className="font-typewriter text-sm tracking-wide text-warmgrau/80">
                Lage der Nation
              </p>
              <p className="font-body text-xs text-warmgrau/60 mt-1">
                ab 1 Std. 19 Min.
              </p>
            </div>
          </div>

          <Figure
            src="/images/img-brief-schwebt.webp"
            width={260}
            height={175}
            side="right"
            rotate="left"
          />

          <p>
            Ich baue Brief-nach-Berlin als kleines, ehrenamtliches Projekt.
            Kein Marketing-Budget, keine Werbung, keine Investoren. Ein paar
            Sätze in einem Podcast, den viele politisch interessierte Menschen
            hören, und plötzlich kommen sechsmal so viele Briefe zustande wie
            vorher.
          </p>
          <p>
            Das ist für mich vor allem eines: ein Zeichen, dass es Bedarf gibt.
            Dass viele Menschen den Schritt vom Frust zum konkreten Brief zwar
            machen wollen, aber Hilfe brauchen, um anzufangen. Genau diese
            Hürde versuche ich so klein wie möglich zu machen.
          </p>
          <p>
            Danke an Philip Banse, Ulf Buermeyer und das ganze Lage-Team für
            die Erwähnung. Und danke an alle, die seitdem einen Brief
            geschrieben haben. Jeder einzelne zählt.
          </p>
        </Prose>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl hover:bg-waldgruen/10 transition-colors">
          <p className="font-body text-warmgrau leading-relaxed mb-6">
            Drei Minuten, kein Account, kein Tracking. Wir schicken dir den
            fertigen Brief per Mail, du schreibst ihn ab und steckst ihn in den
            Briefkasten.
          </p>
          <Link
            href="/app"
            className="inline-block bg-waldgruen text-creme font-body font-semibold text-base md:text-lg px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors shadow-lg shadow-waldgruen/25"
          >
            Mit deinem Brief anfangen &rarr;
          </Link>
        </div>

        <div className="mt-12 font-body text-sm text-warmgrau/70 leading-relaxed">
          <p>
            Mehr über die Idee dahinter:{" "}
            <Link
              href="/warum-ein-brief"
              className="text-waldgruen hover:underline"
            >
              Warum ein Brief mehr ist als ein Brief
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
