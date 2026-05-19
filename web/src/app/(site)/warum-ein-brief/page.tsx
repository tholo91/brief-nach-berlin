import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title:
    "Warum ein Brief mehr ist als ein Brief | Brief-nach-Berlin",
  description:
    "Wer einmal einen Brief an seinen Abgeordneten geschrieben hat, gibt seine Stimme nicht mehr nur ab. Er erhebt sie. Über politische Selbstwirksamkeit, das Demokratie-Muskel-Prinzip und warum Lobbyisten gerade auf deine Beteiligung hoffen, dass sie ausbleibt.",
  alternates: {
    canonical: `${APP_URL}/warum-ein-brief`,
  },
  openGraph: {
    title: "Warum ein Brief mehr ist als ein Brief",
    description:
      "Wer einmal einen Brief an seinen Abgeordneten geschrieben hat, gibt seine Stimme nicht mehr nur ab. Er erhebt sie.",
    type: "article",
    locale: "de_DE",
    url: `${APP_URL}/warum-ein-brief`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Warum ein Brief mehr ist als ein Brief",
    description:
      "Wer einmal einen Brief an seinen Abgeordneten geschrieben hat, gibt seine Stimme nicht mehr nur ab. Er erhebt sie.",
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
          Ein Essay
        </p>
        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Warum ein Brief mehr ist als ein Brief
        </h1>
        <p className="font-handwriting text-xl md:text-2xl text-warmgrau leading-relaxed mb-12 text-pretty">
          Wer einmal einen Brief an seinen Abgeordneten geschrieben hat, gibt
          seine Stimme nicht mehr nur ab. Er erhebt sie. Und merkt dabei etwas,
          das sich danach schwer wieder vergessen lässt.
        </p>

        <article className="font-body text-warmgrau leading-[1.85] space-y-7 text-base md:text-lg">
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            &bdquo;Stimme abgeben&ldquo; ist ein verräterisches Wort
          </h2>
          <p>
            Im Deutschen gehst du wählen und gibst deine Stimme ab. Du legst sie
            weg. Du übergibst sie. Vier Jahre lang gehört sie nicht mehr dir,
            sondern jemand anderem. Allein das Wort beschreibt eigentlich schon,
            was viele danach fühlen: Ohnmacht. Du hast etwas Wertvolles
            weggegeben und bekommst dafür nicht zwangsläufig zurück, was du
            wolltest.
          </p>
          <p>
            Demokratie ist aber kein Pfand-Geschäft. Sie ist ein Verhältnis. Und
            Verhältnisse leben davon, dass beide Seiten sich melden, nicht nur
            an einem Tag im Februar oder September.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Was passiert, wenn du tatsächlich schreibst
          </h2>
          <p>
            Etwas Komisches passiert, sobald du dich hinsetzt und einen Brief
            formulierst. Dein Anliegen wird konkret. Du musst es benennen. Du
            musst entscheiden, wer dafür eigentlich zuständig ist. Du recherchierst
            kurz, wer dein Wahlkreisabgeordneter ist, vielleicht auch, wer im
            Bundestagsausschuss zu diesem Thema sitzt. Du wirst, fast nebenbei,
            informiert.
          </p>
          <p>
            Forscher nennen das, was dabei mit dir passiert, politische
            Selbstwirksamkeit. Das Gefühl, dass dein Handeln einen Unterschied
            macht. Studien aus der politischen Bildung zeigen seit Jahren das
            Gleiche: Menschen, die einmal eine politische Handlung jenseits des
            Wählens vollzogen haben, schätzen ihre eigene Wirksamkeit dauerhaft
            höher ein. Sie tun danach mehr. Sie geben weniger schnell auf. Sie
            sprechen anders im Bekanntenkreis darüber.
          </p>
          <p>
            Der Brief verändert also nicht nur die Welt da draußen, sondern auch
            dich.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Warum gerade Briefe und nicht E-Mails
          </h2>
          <p>
            Ein Bundestagsabgeordneter bekommt am Tag dutzende, manchmal hunderte
            E-Mails. Die meisten sind Massenversand. Postfächer haben Filter,
            Sekretariate sortieren in Antwortschablonen. Eine Mail ist billig.
            Genau deshalb ist sie wenig wert.
          </p>
          <p>
            Ein Brief ist anders. Er liegt physisch auf einem Schreibtisch.
            Niemand hat einen Spam-Filter für Papier. Jemand hat ihn aufgemacht,
            jemand hat ihn überflogen, vielleicht weitergegeben. Wenn er
            handgeschrieben ist, ist klar: Da hat sich jemand zwanzig Minuten
            hingesetzt, in einer Welt, in der zwanzig Minuten teuer sind. In
            vielen Wahlkreisbüros werden Briefe nach Thema und Region sortiert
            und der Abgeordnete bekommt am Wochenende den Stapel.
          </p>
          <p>
            Ich habe selbst im Bundestag gearbeitet. Wir haben Briefe gelesen.
            Wir haben sie besprochen. Manchmal haben sie eine kleine Anfrage
            ausgelöst.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Die Lobbyisten haben Vollzeit dafür. Du nicht. Aber du bist Wähler.
          </h2>
          <p>
            In Berlin sind über 5.000 Lobbyisten registriert. Ihr Job ist es,
            jeden Tag mit Abgeordneten zu reden, Positionspapiere zu schicken,
            Hintergrundgespräche zu führen. Sie sind gut. Sie werden dafür
            bezahlt. Sie haben Zeit.
          </p>
          <p>
            Du hast keine Zeit. Aber du hast etwas, das kein Lobbyist hat: eine
            Stimme bei der nächsten Wahl. Genau deine, im Wahlkreis dieses
            Abgeordneten. Wenn ein Abgeordneter zwanzig Briefe aus seinem
            eigenen Wahlkreis zum gleichen Thema bekommt, wird er nervös. Sehr
            zu Recht. Zwanzig Briefe sind oft das, was zwischen einem sicheren
            und einem knappen Direktmandat liegt.
          </p>
          <p>
            Lobbyisten verlassen sich darauf, dass du das nicht weißt. Oder dass
            du es weißt und trotzdem nicht schreibst, weil es sich zu klein
            anfühlt. Dieses Sich-zu-klein-fühlen ist die wichtigste Ressource
            jeder geschlossenen Politik.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Demokratie ist ein Muskel
          </h2>
          <p>
            Wer nur alle vier Jahre in die Wahlkabine geht, trainiert seinen
            demokratischen Muskel zwei Mal pro Jahrzehnt. Das reicht nicht, um
            Bewegungen zu spüren. Das reicht nicht, um in der Familie ruhig zu
            erklären, warum dir etwas wichtig ist. Das reicht nicht, um einer
            Schwägerin zu widersprechen, die behauptet, dass &bdquo;eh nichts
            mehr funktioniert&ldquo;.
          </p>
          <p>
            Wer einmal einen Brief geschrieben hat, redet danach anders. Nicht
            lauter, nicht moralischer. Sondern handfester. Du weißt jetzt, an
            wen man sich wendet. Du weißt, wie eine Antwort aus einem
            Abgeordnetenbüro aussieht. Du hast gelernt, dass die Maschine
            Demokratie nicht abstrakt ist, sondern aus Menschen besteht, die in
            Büros sitzen und auf Post reagieren. Mit dieser Erfahrung kannst du
            andere mitnehmen.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Was passiert, wenn 100.000 das Gleiche tun
          </h2>
          <p>
            Ein Brief ist ein Brief. Hundert Briefe sind eine Sortier-Aufgabe.
            Tausend Briefe zum gleichen Thema sind eine Pressemitteilung. Zehntausend
            Briefe sind eine Bewegung, der ein Abgeordneter im Wahlkampf nicht
            ausweichen kann. Die Frage ist nicht, ob ein einzelner Brief die
            Welt rettet. Die Frage ist, ob du den Mut hast, der erste in deinem
            Bekanntenkreis zu sein, der schreibt.
          </p>

          <h2 className="font-body text-2xl font-bold text-waldgruen-dark pt-4">
            Worauf wartest du?
          </h2>
          <p>
            Der schwerste Teil ist nicht das Schreiben. Es ist das Anfangen.
            Genau deshalb haben wir Brief-nach-Berlin gebaut. Du sagst uns, was
            dich stört. Wir finden den richtigen Adressaten und schlagen dir
            einen Brief vor, den du selbst noch in der Hand hast, anpassen
            kannst und dann unterschreibst.
          </p>
          <p>
            Aus &bdquo;Stimme abgeben&ldquo; wird &bdquo;Stimme erheben&ldquo;.
            Aus Ohnmacht wird Übung. Aus dir wird jemand, der weiß, wie das
            funktioniert.
          </p>
        </article>

        <div className="mt-16 p-8 bg-waldgruen/5 border border-waldgruen/15 rounded-xl">
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
            Wenn du danach noch eine Stufe weiter willst, gibt es{" "}
            <Link
              href="/treppe-der-selbstwirksamkeit"
              className="text-waldgruen hover:underline"
            >
              die Treppe der politischen Selbstwirksamkeit
            </Link>{" "}
            mit zehn weiteren Stufen.
          </p>
        </div>
      </div>
    </div>
  );
}
