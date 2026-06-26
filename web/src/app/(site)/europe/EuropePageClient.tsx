import Image from "next/image";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FactCallout } from "@/components/editorial/FactCallout";
import { Prose } from "@/components/editorial/Prose";
import { PullQuote } from "@/components/editorial/PullQuote";

type Language = "de" | "en";

type Copy = {
  back: string;
  eyebrow: string;
  title: string;
  lead: string;
  imageAlt: string;
  answerKicker: string;
  answer: string;
  sections: {
    whyTitle: string;
    why1: string;
    why2: string;
    openTitle: string;
    open1: string;
    open2: string;
    neededTitle: string;
    needed1: string;
    needed2: string;
    nextTitle: string;
    next1: string;
  };
  quote: string;
  factNumber: string;
  factLabel: string;
  factSource: string;
  countriesTitle: string;
  countries: Array<{ name: string; status: string; body: string }>;
  contactTitle: string;
  contactBody: string;
  contactCta: string;
  githubCta: string;
  linksTitle: string;
  links: Array<{ href: string; label: string }>;
  faqTitle: string;
  faqs: Array<{ q: string; a: string }>;
};

const copy: Record<Language, Copy> = {
  de: {
    back: "Zurück",
    eyebrow: "Open Source für Europa",
    title: "Bring Brief-nach-Berlin in ein weiteres Land",
    lead:
      "Brief nach Berlin ist ein offener Ansatz für Bürgerbriefe an die richtige politische Stelle. Wenn du Kontakte, Datenquellen oder lokale Erfahrung aus Österreich, Portugal, den Niederlanden oder einem anderen europäischen Land hast, melde dich. Ich suche Menschen, die das Prinzip sauber übertragen wollen.",
    imageAlt:
      "Handgeschriebene Briefe fliegen über Europa, vorbei an Städten, Flüssen, Bahnlinien und Bergen.",
    answerKicker: "Wie kann ich Brief nach Berlin in ein anderes Land bringen?",
    answer:
      "Am besten mit 3 Dingen: belastbaren Daten zu Zuständigkeiten, jemandem mit lokalem Demokratieverständnis und einem kleinen Kreis von Testerinnen und Testern. Der Code ist offen. Was jedes Land braucht, ist die Übersetzung in seine Institutionen, seine Sprache und seine politischen Gewohnheiten.",
    sections: {
      whyTitle: "Warum diese Seite existiert",
      why1:
        "Brief nach Berlin begann als deutsches Werkzeug: Postleitzahl eingeben, Anliegen beschreiben, zuständige Bundestagsabgeordnete finden, Brief formulieren. Der eigentliche Gedanke ist größer. Demokratie wird greifbarer, wenn Menschen wissen, wen sie ansprechen können, und wenn der erste Schritt nicht an Formularen, Zuständigkeiten oder Unsicherheit scheitert.",
      why2:
        "Europa ist für mich kein abstraktes Projekt. Es ist die Erfahrung, dass Nachbarländer voneinander lernen können, ohne gleich alles gleichzumachen. Ein Tool für Deutschland muss in Österreich, Portugal oder den Niederlanden nicht kopiert werden. Es muss übersetzt werden.",
      openTitle: "Was ist daran Open Source?",
      open1:
        "Der Code von Brief nach Berlin liegt offen bei GitHub. Du kannst sehen, wie Postleitzahlen, Zuständigkeiten, Brieflogik, Datenschutz und KI-Transparenz zusammenspielen. Die Idee ist nicht, eine zentrale Plattform für ganz Europa zu kontrollieren. Die Idee ist, dass lokale Teams das Muster übernehmen und besser an ihr Land anpassen als ich es von Deutschland aus könnte.",
      open2:
        "Wenn du eine Version für dein Land bauen willst, brauchst du keine Erlaubnis. Eine Nachricht hilft trotzdem, weil ich Erfahrungen, Fallstricke und technische Entscheidungen teilen kann.",
      neededTitle: "Was braucht ein Land konkret?",
      needed1:
        "Zuerst braucht es eine saubere Datenquelle: Wahlkreise, Mandate, Büroadressen, Anreden und Zuständigkeiten. Danach braucht es Texte, die kulturell passen. Ein österreichischer Brief an den Nationalrat klingt anders als ein deutscher Brief an den Bundestag. Eine niederländische Version muss andere Institutionen erklären als eine portugiesische.",
      needed2:
        "Wichtig ist auch Datenschutz. Brief nach Berlin speichert keine Nutzerkonten und baut bewusst keine politische Profildatenbank auf. Wer das Konzept übernimmt, sollte diese Linie halten: so wenig Daten wie möglich, so transparent wie möglich.",
      nextTitle: "Welche Länder sind schon im Gespräch?",
      next1:
        "Österreich ist im Gespräch. Portugal, die Niederlande und weitere Länder sind Beispiele für Orte, an denen der Ansatz spannend sein könnte. Ich bin offen für Kontakte, Datenhinweise, Übersetzungshilfe, lokale Einschätzungen und Entwicklerinnen oder Entwickler, die eine eigene Variante bauen wollen.",
    },
    quote:
      "Demokratie wird stärker, wenn Menschen wissen: Ich darf schreiben. Ich weiß wohin. Und meine Stimme ist konkret genug, um anzukommen.",
    factNumber: "1",
    factLabel:
      "Codebasis kann der Startpunkt für viele lokale Versionen sein, wenn Daten, Sprache und Institutionen vor Ort geprüft werden.",
    factSource: "Open Source, lokal angepasst",
    countriesTitle: "Mögliche nächste Länder",
    countries: [
      {
        name: "Österreich",
        status: "Im Gespräch",
        body:
          "Nationalrat, Bundesrat, Länder und Gemeinden haben eigene Wege. Genau deshalb braucht es lokale Prüfung, bevor aus einer Idee ein Werkzeug wird.",
      },
      {
        name: "Portugal",
        status: "Beispiel",
        body:
          "Spannend für Kontakte, Datenquellen und Menschen, die wissen, wie Bürgerinnen und Bürger dort politische Stellen erreichen.",
      },
      {
        name: "Niederlande",
        status: "Beispiel",
        body:
          "Ein gutes Land, um zu prüfen, wie parlamentarische Zuständigkeit, direkte Ansprache und klare Sprache zusammenpassen.",
      },
    ],
    contactTitle: "Hast du Kontakte oder willst du mitbauen?",
    contactBody:
      "Schreib mir, wenn du Datenquellen kennst, in einem Land politisch vernetzt bist, übersetzen willst oder den Code für eine eigene Version nutzen möchtest. Eine kurze Mail reicht.",
    contactCta: "Mail schreiben",
    githubCta: "Code auf GitHub ansehen",
    linksTitle: "Mehr Kontext",
    links: [
      { href: "/was-noch-kommt", label: "Was noch kommt: die Roadmap" },
      { href: "/ki-transparenz", label: "Wie KI transparent eingesetzt wird" },
      { href: "/warum", label: "Wer hinter Brief nach Berlin steht" },
    ],
    faqTitle: "Häufige Fragen",
    faqs: [
      {
        q: "Kann ich Brief nach Berlin für mein Land übernehmen?",
        a:
          "Ja. Der Code ist offen. Wichtig ist, dass du die Daten, Zuständigkeiten, Anreden und Datenschutzfragen deines Landes eigenständig prüfst, statt die deutsche Logik einfach zu kopieren.",
      },
      {
        q: "Welche Hilfe ist gerade am wertvollsten?",
        a:
          "Am wertvollsten sind Kontakte zu Menschen, die lokale Institutionen gut kennen, sowie Hinweise auf belastbare Datenquellen für Mandate, Wahlkreise, Büroadressen und Zuständigkeiten.",
      },
      {
        q: "Ist Österreich schon geplant?",
        a:
          "Österreich ist im Gespräch, aber noch nicht live. Wenn du dort Kontakte, Datenquellen oder Erfahrung mit Nationalrat, Ländern oder Gemeinden hast, ist das besonders hilfreich.",
      },
      {
        q: "Warum keine zentrale Europa-Version?",
        a:
          "Politische Systeme unterscheiden sich stark. Eine zentrale Version würde schnell ungenau. Besser sind lokale Varianten, die den offenen Ansatz nutzen und ihn für die jeweiligen Institutionen sauber übersetzen.",
      },
      {
        q: "Muss eine neue Version den Namen Brief nach Berlin tragen?",
        a:
          "Nein. Der Name passt zu Deutschland. Für andere Länder kann ein eigener Name sinnvoller sein, solange der Grundgedanke bleibt: Menschen helfen, konkrete demokratische Briefe an die richtige Stelle zu schreiben.",
      },
    ],
  },
  en: {
    back: "Back",
    eyebrow: "Open source for Europe",
    title: "Bring Brief-nach-Berlin to your country",
    lead:
      "Brief nach Berlin is an open approach for helping people write civic letters to the right political office. If you have contacts, data sources, or local knowledge from Austria, Portugal, the Netherlands, or another European country, get in touch. I am looking for people who want to adapt the idea properly.",
    imageAlt:
      "Handwritten letters fly across Europe, passing cities, rivers, railway lines, and mountains.",
    answerKicker: "How can I bring Brief nach Berlin to another country?",
    answer:
      "Start with 3 things: reliable data about political responsibility, someone who understands the local democratic system, and a small group of testers. The code is open. What each country needs is a translation into its own institutions, language, and civic habits.",
    sections: {
      whyTitle: "Why this page exists",
      why1:
        "Brief nach Berlin started as a German tool: enter a postal code, describe an issue, find the right member of parliament, and draft a letter. The underlying idea is larger. Democracy becomes easier to use when people know whom to contact and when the first step is not blocked by forms, uncertainty, or institutional complexity.",
      why2:
        "Europe is not an abstract project to me. It is the experience that neighboring countries can learn from each other without becoming the same. A tool built for Germany should not be copied into Austria, Portugal, or the Netherlands. It should be translated.",
      openTitle: "What is open source about it?",
      open1:
        "The Brief nach Berlin code is public on GitHub. You can inspect how postal codes, responsibility checks, letter drafting, privacy, and AI transparency work together. The point is not to control one central platform for Europe. The point is to let local teams reuse the pattern and adapt it better than I could from Germany.",
      open2:
        "If you want to build a version for your country, you do not need permission. A message still helps, because I can share lessons, tradeoffs, and technical decisions.",
      neededTitle: "What does a country need?",
      needed1:
        "First, it needs a reliable data source: constituencies, mandates, office addresses, forms of address, and responsibilities. Then it needs writing that fits the local culture. An Austrian letter to the National Council sounds different from a German letter to the Bundestag. A Dutch version has to explain different institutions than a Portuguese one.",
      needed2:
        "Privacy matters too. Brief nach Berlin does not store user accounts and deliberately avoids building a political profile database. Any adaptation should keep that line: as little data as possible, as much transparency as possible.",
      nextTitle: "Which countries are being discussed?",
      next1:
        "Austria is being discussed. Portugal, the Netherlands, and other countries are examples where the approach could be useful. I am open to contacts, data pointers, translation help, local judgement, and developers who want to build their own version.",
    },
    quote:
      "Democracy gets stronger when people know: I am allowed to write. I know where to send it. And my voice is concrete enough to arrive.",
    factNumber: "1",
    factLabel:
      "Codebase can become the starting point for many local versions when data, language, and institutions are checked locally.",
    factSource: "Open source, locally adapted",
    countriesTitle: "Possible next countries",
    countries: [
      {
        name: "Austria",
        status: "Being discussed",
        body:
          "National Council, Federal Council, states, and municipalities each have their own paths. That is why local review has to come before a public tool.",
      },
      {
        name: "Portugal",
        status: "Example",
        body:
          "Useful for contacts, data sources, and people who understand how citizens can reach political offices there.",
      },
      {
        name: "The Netherlands",
        status: "Example",
        body:
          "A strong candidate for testing how parliamentary responsibility, direct contact, and plain language fit together.",
      },
    ],
    contactTitle: "Do you have contacts or want to build?",
    contactBody:
      "Write to me if you know data sources, understand a local political system, want to translate, or want to use the code for your own version. A short email is enough.",
    contactCta: "Write an email",
    githubCta: "View the code on GitHub",
    linksTitle: "More context",
    links: [
      { href: "/was-noch-kommt", label: "What comes next: the roadmap" },
      { href: "/ki-transparenz", label: "How AI is used transparently" },
      { href: "/warum", label: "Who is behind Brief nach Berlin" },
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        q: "Can I adapt Brief nach Berlin for my country?",
        a:
          "Yes. The code is open. The important part is to independently check your country's data, responsibilities, forms of address, and privacy questions instead of copying the German logic.",
      },
      {
        q: "What kind of help is most useful right now?",
        a:
          "The most useful help is contact with people who know local institutions, plus pointers to reliable data sources for mandates, constituencies, office addresses, and responsibilities.",
      },
      {
        q: "Is Austria already planned?",
        a:
          "Austria is being discussed, but it is not live yet. If you have contacts, data sources, or experience with the National Council, states, or municipalities, that is especially useful.",
      },
      {
        q: "Why not build one central European version?",
        a:
          "Political systems differ too much. One central version would become inaccurate quickly. Local versions are better: they can use the open approach and translate it carefully for their institutions.",
      },
      {
        q: "Does a new version have to use the name Brief nach Berlin?",
        a:
          "No. The name fits Germany. Another country may need its own name, as long as the principle remains: help people write concrete democratic letters to the right office.",
      },
    ],
  },
};

export function EuropePageContent({
  contactEmail,
  language,
}: {
  contactEmail: string;
  language: Language;
}) {
  const t = copy[language];
  const subject =
    language === "de"
      ? "Brief nach Berlin nach Europa bringen"
      : "Bringing Brief nach Berlin to Europe";
  const mailHref = `mailto:${contactEmail}?subject=${encodeURIComponent(
    subject
  )}`;

  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-typewriter text-sm text-waldgruen transition-colors hover:text-waldgruen-dark"
          >
            &larr; {t.back}
          </Link>
          <div
            className="flex rounded-full border border-waldgruen/20 bg-white/70 p-1"
            aria-label="Language"
          >
            {(["de", "en"] as const).map((item) => (
              <Link
                key={item}
                href={`/europe?lang=${item}`}
                className={`rounded-full px-3 py-1.5 font-typewriter text-xs font-bold uppercase tracking-widest transition-colors ${
                  language === item
                    ? "bg-waldgruen text-creme"
                    : "text-waldgruen hover:bg-waldgruen/10"
                }`}
                aria-current={language === item ? "page" : undefined}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <p className="mb-3 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
          {t.eyebrow}
        </p>
        <h1 className="mb-6 font-body text-3xl font-bold tracking-tight text-waldgruen-dark text-balance md:text-5xl">
          {t.title}
        </h1>
        <p className="mb-10 font-body text-lg leading-relaxed text-warmgrau/85 md:text-xl">
          {t.lead}
        </p>

        <figure className="mb-12 -mx-2 sm:mx-0">
          <Image
            src="/images/europe-correspondence.webp"
            alt={t.imageAlt}
            width={1376}
            height={768}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="h-auto w-full rounded-2xl shadow-sm"
            priority
          />
        </figure>

        <div className="mb-14 border-l-4 border-waldgruen py-2 pl-6">
          <p className="mb-3 font-typewriter text-xs uppercase tracking-widest text-waldgruen/60">
            {t.answerKicker}
          </p>
          <p className="font-body text-base leading-relaxed text-waldgruen-dark md:text-lg">
            {t.answer}
          </p>
        </div>

        <Prose>
          <h2>{t.sections.whyTitle}</h2>
          <p>{t.sections.why1}</p>
          <p>{t.sections.why2}</p>

          <PullQuote>{t.quote}</PullQuote>

          <h2>{t.sections.openTitle}</h2>
          <p>{t.sections.open1}</p>
          <p>{t.sections.open2}</p>

          <FactCallout
            number={t.factNumber}
            label={t.factLabel}
            source={t.factSource}
          />

          <h2>{t.sections.neededTitle}</h2>
          <p>{t.sections.needed1}</p>
          <p>{t.sections.needed2}</p>

          <h2>{t.sections.nextTitle}</h2>
          <p>{t.sections.next1}</p>
        </Prose>

        <section className="mt-14">
          <h2 className="mb-6 font-body text-2xl font-bold text-waldgruen-dark md:text-3xl">
            {t.countriesTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {t.countries.map((country) => (
              <article
                key={country.name}
                className="rounded-2xl border border-waldgruen/15 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex flex-col gap-2">
                  <h3 className="font-body text-xl font-bold text-waldgruen-dark">
                    {country.name}
                  </h3>
                  <span className="w-fit rounded-full bg-waldgruen/10 px-3 py-1 font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen-dark">
                    {country.status}
                  </span>
                </div>
                <p className="font-body text-sm leading-relaxed text-warmgrau">
                  {country.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-sm border-2 border-waldgruen/20 bg-creme/40 p-6 sm:p-8">
          <h2 className="mb-3 font-body text-2xl font-bold text-waldgruen-dark">
            {t.contactTitle}
          </h2>
          <p className="mb-6 font-body text-base leading-relaxed text-warmgrau">
            {t.contactBody}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={mailHref}
              className="inline-block rounded-sm bg-waldgruen-dark px-6 py-3 text-center font-body font-bold text-creme transition-colors hover:bg-waldgruen"
            >
              {t.contactCta}
            </a>
            <a
              href="https://github.com/tholo91/brief-nach-berlin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-sm border border-waldgruen/25 px-6 py-3 text-center font-body font-bold text-waldgruen-dark transition-colors hover:border-waldgruen hover:bg-white"
            >
              {t.githubCta}
            </a>
          </div>
        </section>

        <section className="mt-16 border-t border-warmgrau/10 pt-8">
          <p className="mb-4 font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/50">
            {t.linksTitle}
          </p>
          <ul className="flex flex-col gap-3">
            {t.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-waldgruen underline underline-offset-2 transition-colors hover:text-waldgruen-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 font-body text-xl font-bold text-waldgruen-dark">
            {t.faqTitle}
          </h2>
          <FAQAccordion items={t.faqs} />
        </section>
      </div>
    </div>
  );
}
