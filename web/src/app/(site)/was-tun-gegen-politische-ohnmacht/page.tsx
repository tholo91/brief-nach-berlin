import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { Prose } from "@/components/editorial/Prose";
import { PullQuote } from "@/components/editorial/PullQuote";
import { FactCallout } from "@/components/editorial/FactCallout";
import { Figure } from "@/components/editorial/Figure";

const URL_PATH = "/was-tun-gegen-politische-ohnmacht";
const PUBLISHED = "2026-05-19";
const TITLE =
  "Was tun gegen politische Ohnmacht? Sechs konkrete Schritte | Brief nach Berlin";
const DESCRIPTION =
  "Politisch ohnmächtig fühlen, aber nicht wissen wohin damit? Hier sind sechs konkrete Hebel, die heute funktionieren, vom Brief an deinen Abgeordneten bis zum Bürgerrat. Mit Empfehlung, womit du anfängst.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}${URL_PATH}` },
  openGraph: {
    title: "Was tun gegen politische Ohnmacht? Sechs konkrete Schritte",
    description: DESCRIPTION,
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}${URL_PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Was tun gegen politische Ohnmacht?",
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    q: "Bringt es wirklich etwas, einem Politiker zu schreiben?",
    a: "Ja, vor allem handgeschrieben und aus dem eigenen Wahlkreis. Abgeordnete bekommen pro Tag oft nur eine Handvoll persönlicher Briefe. Wer schreibt, taucht in der internen Themenliste des Büros auf. Was darauf häufiger landet, wird im Büro besprochen, manchmal auch im Plenum.",
  },
  {
    q: "Ich kenne mich politisch nicht aus. Reicht das überhaupt?",
    a: "Politische Bildung ist keine Voraussetzung, um zu schreiben. Es reicht, wenn du eine konkrete Situation aus deinem Alltag beschreibst und einen Wunsch formulierst. Die Recherche, wer dafür zuständig ist, kannst du dem Tool überlassen.",
  },
  {
    q: "Was hilft mehr: demonstrieren oder schreiben?",
    a: "Beides hilft, aber an unterschiedlichen Stellen. Eine Demo erzeugt öffentlichen Druck. Ein Brief erzeugt persönlichen Druck im Büro einer bestimmten Person. Wer beides macht, deckt zwei verschiedene Hebel ab.",
  },
  {
    q: "Ich habe schon mal geschrieben und nichts gehört. Bringt das was?",
    a: "Antworten sind kein guter Erfolgsmaßstab. Viele Briefe wirken über die interne Statistik der Themen, die im Büro auflaufen, nicht über die Antwort selbst. Wenn fünfzig Menschen aus deinem Wahlkreis zum gleichen Thema schreiben, ändert das die interne Wahrnehmung, auch ohne Rückbrief.",
  },
  {
    q: "Welcher Schritt ist der einfachste Einstieg?",
    a: "Der Brief. Du brauchst kein Vorwissen, keine Gruppe, keinen Termin. Du kannst ihn heute Abend schreiben und morgen abschicken. Daraus ergibt sich oft der nächste Schritt fast von selbst, eine Sprechstunde, ein Gespräch im Freundeskreis, eine Petition.",
  },
  {
    q: "Lohnt es sich für mich als Nichtwähler oder Wechselwähler?",
    a: "Ja. Abgeordnete vertreten ihren ganzen Wahlkreis, nicht nur die eigenen Wählerinnen und Wähler. Wer schreibt, signalisiert, dass ihm ein Thema wichtig genug ist, um Zeit zu investieren. Das wirkt unabhängig vom Wahlverhalten.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Was tun gegen politische Ohnmacht? Sechs konkrete Schritte",
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
};

export default function OhnmachtPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-typewriter text-sm text-waldgruen hover:text-waldgruen-dark transition-colors mb-8 inline-block"
        >
          &larr; Zurück
        </Link>

        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Antwort auf eine häufige Frage
        </p>
        <h1 className="font-body text-3xl md:text-5xl font-bold text-waldgruen-dark tracking-tight mb-6 text-balance">
          Was tun, wenn man sich politisch ohnmächtig fühlt?
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-4 text-pretty">
          Politische Ohnmacht ist kein Charakterfehler. Sie entsteht, wenn man
          weiß, dass etwas falsch läuft, aber nicht sieht, wo man hinfassen
          soll. Der erste Hebel ist meistens der kleinste.
        </p>
        <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mb-12">
          6 Minuten Lesezeit
        </p>

        <Prose>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Die kurze Antwort
          </h2>
          <p className="first-letter:float-left first-letter:font-body first-letter:text-7xl md:first-letter:text-8xl first-letter:font-bold first-letter:text-waldgruen-dark first-letter:leading-[0.85] first-letter:mr-2 first-letter:mt-1">
            Wer sich politisch ohnmächtig fühlt, hat meistens nicht zu wenig
            Macht, sondern zu wenig Adressaten. Der direkteste Hebel: ein Brief
            an die Bundestagsabgeordnete oder den Bundestagsabgeordneten aus
            deinem Wahlkreis. Daneben gibt es fünf weitere Wege, die heute
            funktionieren, ohne Parteibuch, ohne Vorwissen, ohne Bühne. Die
            Reihenfolge weiter unten ist nach Aufwand sortiert.
          </p>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Warum dieses Gefühl täuscht
          </h2>
          <Figure
            src="/images/img-aufbruch.webp"
            alt="Aquarell: ein Schreibtisch am Fenster mit Stift, Brief und Teetasse, draußen die Reichstagskuppel"
            width={1376}
            height={768}
            side="right"
            rotate="right"
          />
          <p>
            Ohnmacht ist nicht das Gegenteil von Macht. Sie ist das Gegenteil
            von Adressat. Wer keinen Adressaten hat, schreit ins Leere, und
            irgendwann hört er auf zu schreien. Politik fühlt sich groß und
            abstrakt an, weil sie in Talkshows verhandelt wird und nicht in
            deiner Straße. Aber sie wird von Menschen gemacht, die du anrufen,
            besuchen oder anschreiben kannst. Jede und jeder Bundestagsabgeordnete
            sitzt in einem konkreten Wahlkreis, mit einer Adresse und einem
            Büro. Deins eingeschlossen.
          </p>

          <PullQuote decorative>
            Ohnmacht ist nicht das Gegenteil von Macht. Sie ist das Gegenteil
            von Adressat.
          </PullQuote>

          <FactCallout
            number="630"
            label="Bundestagsabgeordnete vertreten dich gerade, von denen mindestens eine oder einer direkt aus deinem Wahlkreis kommt. Das ist deine konkreteste politische Adresse."
            source="Bundestag, Wahlperiode 21"
          />

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Sechs Dinge, die du diese Woche tun kannst
          </h2>
          <p>
            Sortiert nach Aufwand. Wenn du wenig Zeit oder wenig Energie hast,
            fang mit dem ersten an. Es ist auch der mit dem schnellsten
            Rückkopplungs-Effekt für dich selbst.
          </p>

          <ol className="list-decimal pl-6 space-y-5 marker:text-waldgruen marker:font-bold">
            <li>
              <strong className="font-body font-bold text-waldgruen-dark">
                Schreib deiner oder deinem Abgeordneten.
              </strong>
              <br />
              Zehn bis dreißig Minuten. Du brauchst eine konkrete Situation aus
              deinem Alltag und einen Wunsch. Den Rest, also die richtige
              Adresse und den formellen Ton, übernimmt das Tool. Handschriftlich
              wirkt am stärksten, weil Abgeordnete kaum noch handgeschriebene
              Briefe bekommen.
            </li>
            <li>
              <strong className="font-body font-bold text-waldgruen-dark">
                Zeichne eine Petition mit, die du wirklich teilst.
              </strong>
              <br />
              Fünf Minuten. Der Bundestag hat einen eigenen Petitionsausschuss.
              Petitionen ab 50.000 Unterzeichnungen werden öffentlich behandelt.
              Wichtig: Petition mitzeichnen ist kein Ersatz für den eigenen
              Brief. Eine Unterschrift ist ein Klick, ein Brief ist eine
              Position.
            </li>
            <li>
              <strong className="font-body font-bold text-waldgruen-dark">
                Geh in eine Bürgersprechstunde.
              </strong>
              <br />
              Eine Stunde plus Anfahrt. Fast jede oder jeder Abgeordnete bietet
              regelmäßig offene Sprechstunden im Wahlkreisbüro an. Termine
              stehen auf der jeweiligen Website oder bekommst du am Telefon.
              Eine halbe Stunde gegenüber einer Person, die in Berlin
              mitstimmt, ist Demokratie auf Augenhöhe.
            </li>
            <li>
              <strong className="font-body font-bold text-waldgruen-dark">
                Bewirb dich für einen Bürgerrat.
              </strong>
              <br />
              Wenige Minuten, dann Wartezeit auf das Losverfahren. Bürgerräte
              sind ein wachsendes Beteiligungsformat, auch auf Bundesebene. Du
              wirst zufällig ausgelost und beratest mit anderen Bürgerinnen und
              Bürgern zu einem konkreten Thema, mit Honorar und Verpflegung.
            </li>
            <li>
              <strong className="font-body font-bold text-waldgruen-dark">
                Sprich es im Freundeskreis aus.
              </strong>
              <br />
              Ein Abendessen. Politische Ohnmacht ist isolierend, weil sie
              meistens still ist. Wer einmal anfängt zu erzählen, was ihm
              gerade nicht passt, merkt schnell, wie viele genauso fühlen. Aus
              fünf stillen Frustrationen werden im Gespräch oft zwei konkrete
              Schritte.
            </li>
            <li>
              <strong className="font-body font-bold text-waldgruen-dark">
                Wähl auch bei der Kommunalwahl.
              </strong>
              <br />
              Eine Stunde alle paar Jahre. Bundestagswahlen bekommen die
              Schlagzeilen, aber Kommunalpolitik entscheidet, was vor deiner
              Haustür passiert. Die Wahlbeteiligung bei Kommunalwahlen liegt
              oft unter 50 Prozent. Hier zählt deine Stimme rechnerisch am
              meisten.
            </li>
          </ol>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Warum der Brief der niedrigschwelligste Einstieg ist
          </h2>
          <p>
            Du brauchst keine Gruppe, kein Datum, keinen freien Tag. Du
            brauchst zehn Minuten und einen Stift. Und du bekommst etwas
            zurück, das die anderen Wege nicht so direkt geben: das Gefühl,
            etwas Konkretes weggeschickt zu haben. Eine Adresse, ein Anliegen,
            ein Datum auf dem Umschlag. Das verändert etwas in dir, bevor es
            irgendetwas in Berlin verändert.
          </p>
          <p>
            Wenn dann nach drei Wochen eine Antwort im Briefkasten liegt, oder
            das eigene Anliegen plötzlich in einer Plenardebatte fällt, ist
            das Gefühl schwer zu beschreiben. Mut nennen es manche. Aufmerksamkeit
            nennen es andere. Häufig folgt darauf ein zweiter Brief, ein
            Gespräch im Freundeskreis, eine Petition. Selbstwirksamkeit baut
            sich nicht aus Theorie auf, sondern aus genau solchen kleinen
            Bestätigungen.
          </p>

          <PullQuote>
            Selbstwirksamkeit baut sich nicht aus Theorie auf, sondern aus
            kleinen Bestätigungen.
          </PullQuote>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Häufige Fragen
          </h2>
          <div className="space-y-6 mt-4">
            {faqs.map((item) => (
              <div key={item.q}>
                <h3 className="font-body text-lg md:text-xl font-bold text-waldgruen-dark mb-2">
                  {item.q}
                </h3>
                <p className="text-warmgrau">{item.a}</p>
              </div>
            ))}
          </div>

          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark pt-4">
            Weiterlesen
          </h2>
          <ul className="space-y-3">
            <li>
              <Link
                href="/lohnt-sich-brief-an-politiker"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Lohnt es sich, einem Politiker zu schreiben?
              </Link>
            </li>
            <li>
              <Link
                href="/warum-ein-brief"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Warum ein Brief mehr ist als ein Brief
              </Link>
            </li>
            <li>
              <Link
                href="/treppe-der-selbstwirksamkeit"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Die Treppe der politischen Selbstwirksamkeit
              </Link>
            </li>
            <li>
              <Link
                href="/aktiv-werden"
                className="font-body text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-4 hover:decoration-waldgruen"
              >
                Was du sonst noch tun kannst
              </Link>
            </li>
          </ul>
        </Prose>

        <div className="mt-16 p-8 border-2 border-waldgruen/20 bg-creme/50 rounded-sm">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
            Wenn du jetzt anfangen willst
          </p>
          <p className="font-body text-lg text-waldgruen-dark mb-6">
            Beschreib dein Anliegen in ein paar Sätzen, gib deine
            Postleitzahl ein, und du bekommst einen Briefentwurf an genau
            die richtige Adresse. Kostenlos, ohne Konto, in unter drei
            Minuten.
          </p>
          <Link
            href="/"
            className="inline-block font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen px-6 py-3 rounded-sm transition-colors"
          >
            Brief schreiben &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
