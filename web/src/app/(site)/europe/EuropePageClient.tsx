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
  guideTitle: string;
  guideIntro: string;
  guideSteps: Array<{ title: string; body: string }>;
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
  guideCta: string;
  githubCta: string;
  linksTitle: string;
  links: Array<{ href: string; label: string }>;
  faqTitle: string;
  faqs: Array<{ q: string; a: string }>;
};

const copy: Record<Language, Copy> = {
  de: {
    back: "Zurück",
    eyebrow: "Open Source für Europa und darüber hinaus",
    title: "Bring Brief nach Berlin in dein Land",
    lead:
      "Der Code ist offen. Wenn du eine lokale Version bauen willst: Repository forken, KI-Anbieter wählen, Zuständigkeiten mappen, Sprache und Design anpassen. Mistral ist empfohlen, aber nicht Pflicht. Ich helfe gern mit Erfahrung, kann aber nicht jedes Land kulturell, rechtlich und politisch selbst übersetzen.",
    imageAlt:
      "Handgeschriebene Briefe fliegen über Europa, vorbei an Städten, Flüssen, Bahnlinien und Bergen.",
    answerKicker: "Kurz gesagt",
    answer:
      "Es braucht keinen zentralen Europa-Rollout. Es braucht lokale Menschen, die Institutionen, Ton und Daten vor Ort sauber prüfen. Genau dafür ist der offene Code da.",
    guideTitle: "Kleine Anleitung für eine lokale Version",
    guideIntro:
      "So würde ich anfangen, ohne daraus ein riesiges Projekt zu machen:",
    guideSteps: [
      {
        title: "Code forken",
        body:
          "Repo klonen, App lokal starten und die deutsche Logik als Muster lesen.",
      },
      {
        title: "KI-Anbieter wählen",
        body:
          "Mistral AI ist der empfohlene Standard. Du kannst auch einen anderen passenden LLM-Anbieter nutzen, musst dann aber den Adapter sauber austauschen.",
      },
      {
        title: "Zuständigkeiten mappen",
        body:
          "Postleitzahlen, Wahlkreise oder Gemeinden den richtigen Abgeordneten und Büros zuordnen. AI-Coding hilft, ersetzt aber keine lokale Prüfung.",
      },
      {
        title: "Sprache und Design anpassen",
        body:
          "Name, Ton, Output-Sprache, Anreden, Beispiele und Trust-Signale so ändern, dass es im jeweiligen Land natürlich wirkt. Bei mehreren Amtssprachen bewusst entscheiden.",
      },
      {
        title: "Mit echten Menschen testen",
        body:
          "10 bis 20 Menschen mit echten Anliegen durchschicken. Erst danach weiter polieren.",
      },
    ],
    sections: {
      whyTitle: "Warum diese Seite existiert",
      why1:
        "Brief nach Berlin begann als deutsches Werkzeug: Postleitzahl eingeben, Anliegen beschreiben, zuständige Bundestagsabgeordnete finden, Brief formulieren. Der Gedanke dahinter ist größer: Menschen sollen wissen, wen sie konkret ansprechen können.",
      why2:
        "Das Muster ist übertragbar, aber nicht 1:1. Ein Tool für Österreich, Portugal, die Niederlande oder ein anderes Land muss in die eigenen Institutionen übersetzt werden.",
      openTitle: "Was du nutzen kannst",
      open1:
        "Der Code liegt offen bei GitHub. Du kannst sehen, wie Postleitzahlen, Zuständigkeiten, Brieflogik, Datenschutz und KI-Transparenz zusammenspielen.",
      open2:
        "Wenn du eine Version für dein Land bauen willst, brauchst du keine Erlaubnis. Eine kurze Nachricht hilft trotzdem, weil ich Erfahrungen, Fallstricke und technische Entscheidungen teilen kann.",
      neededTitle: "Was lokal angepasst werden muss",
      needed1:
        "Zuerst braucht es verlässliche Daten: Welche Postleitzahl, Gemeinde oder welcher Wahlkreis führt zu welchen Abgeordneten, Büros und Zuständigkeiten? In manchen Ländern reicht die Postleitzahl nicht.",
      needed2:
        "Dann kommt die kulturelle Übersetzung: Anrede, Ton, politische Ebenen, Datenschutz, Beispiele, Startseite. Ein guter Prompt kann helfen, aber echte lokale Menschen müssen es prüfen.",
      nextTitle: "Was ich leisten kann",
      next1:
        "Ich kann erklären, wie Brief nach Berlin aufgebaut ist, welche Entscheidungen gut funktioniert haben und wo ich vorsichtig wäre. Ich kann aber nicht ganz Europa lokal anpassen. Dafür braucht es Menschen vor Ort.",
    },
    quote:
      "Demokratie wird stärker, wenn Menschen wissen: Ich darf schreiben. Ich weiß wohin. Meine Stimme kann konkret ankommen.",
    factNumber: "1",
    factLabel:
      "Eine verantwortliche Person vor Ort ist wichtiger als eine zentrale Plattform für alle.",
    factSource: "Open-Source-Ansatz, lokal angepasst",
    countriesTitle: "Wo es anfangen könnte",
    countries: [
      {
        name: "Österreich",
        status: "Im Gespräch",
        body:
          "Nationalrat, Bundesrat, Länder und Gemeinden haben eigene Wege. Gute Kontakte und Datenquellen wären hier besonders hilfreich.",
      },
      {
        name: "Portugal",
        status: "Mitbauende gesucht",
        body:
          "Interessant, wenn jemand die politischen Ebenen, Adressen und passende Ansprache vor Ort prüfen kann.",
      },
      {
        name: "Niederlande",
        status: "Mitbauende gesucht",
        body:
          "Ein gutes Beispiel für die Frage, wie parlamentarische Zuständigkeit, direkte Ansprache und klare Sprache zusammenpassen.",
      },
    ],
    contactTitle: "Hast du Kontakte oder willst du mitbauen?",
    contactBody:
      "Schreib mir, wenn du konkret eine lokale Version bauen willst oder belastbare Datenquellen kennst. Am hilfreichsten: Land, politisches Level, Datenquelle und ob du selbst bauen oder testen kannst.",
    contactCta: "Mail schreiben",
    guideCta: "Fork-Anleitung lesen",
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
          "Ja. Der Code ist offen. Du kannst ihn forken, Mistral AI oder einen anderen passenden LLM-Anbieter nutzen, lokale Abgeordnete mappen und Copy, Design, Output-Sprache, Anreden und Datenschutzdetails anpassen.",
      },
      {
        q: "Welche Hilfe ist gerade am wertvollsten?",
        a:
          "Am wertvollsten sind Menschen vor Ort: verlässliche Datenquellen, Verständnis für die Institutionen und Tests mit echten Nutzerinnen und Nutzern.",
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
        q: "Kann Thomas bei meiner Version helfen?",
        a:
          "Ja, in vernünftigem Rahmen. Ich kann technischen Kontext und Feedback geben, aber nicht die länderspezifische Anpassung für ganz Europa übernehmen.",
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
    eyebrow: "Open source for Europe and beyond",
    title: "Bring Brief-nach-Berlin to your country",
    lead:
      "The code is open. If you want to build a local version: fork it, choose an AI provider, map local responsibilities, adapt language and design. Mistral is recommended, but not required. I am happy to share lessons, but I cannot culturally, legally, and politically localize every country myself.",
    imageAlt:
      "Handwritten letters fly across Europe, passing cities, rivers, railway lines, and mountains.",
    answerKicker: "Short version",
    answer:
      "This does not need one central European rollout. It needs local people who can verify institutions, tone, and data on the ground. That is what the open code is for.",
    guideTitle: "Small guide for a local version",
    guideIntro:
      "This is how I would start without turning it into a huge project:",
    guideSteps: [
      {
        title: "Fork the code",
        body:
          "Clone the repository, run the app locally, and use the German logic as a working pattern.",
      },
      {
        title: "Choose an AI provider",
        body:
          "Mistral AI is the recommended default. You can use another suitable LLM provider, but then you need to replace the adapter cleanly.",
      },
      {
        title: "Map responsibilities",
        body:
          "Connect postal codes, constituencies, or municipalities to the right representatives and offices. AI coding helps, but local validation is required.",
      },
      {
        title: "Adapt language and design",
        body:
          "Change the name, tone, output language, forms of address, examples, and trust signals until it feels natural in the country. For multiple official languages, decide deliberately.",
      },
      {
        title: "Test with real people",
        body:
          "Send 10 to 20 people with real issues through it. Polish only after that.",
      },
    ],
    sections: {
      whyTitle: "Why this page exists",
      why1:
        "Brief nach Berlin started as a German tool: enter a postal code, describe an issue, find the right member of parliament, and draft a letter. The larger idea is simple: people should know whom they can contact.",
      why2:
        "The pattern can travel, but not one-to-one. A version for Austria, Portugal, the Netherlands, or any other country has to be translated into its own institutions.",
      openTitle: "What you can reuse",
      open1:
        "The code is public on GitHub. You can inspect how postal codes, responsibility checks, letter drafting, privacy, and AI transparency work together.",
      open2:
        "If you want to build a version for your country, you do not need permission. A short message still helps, because I can share lessons, pitfalls, and technical decisions.",
      neededTitle: "What has to change locally",
      needed1:
        "First, you need reliable data: which postal code, municipality, or constituency points to which representatives, offices, and responsibilities? In some countries, a postal code will not be enough.",
      needed2:
        "Then comes cultural translation: forms of address, tone, political levels, privacy, examples, homepage. A good prompt helps, but real local people have to review it.",
      nextTitle: "How I can help",
      next1:
        "I can explain how Brief nach Berlin is built, what worked, and where I would be careful. I cannot localize all of Europe myself. That needs people on the ground.",
    },
    quote:
      "Democracy gets stronger when people know: I am allowed to write. I know where to send it. My voice can arrive somewhere concrete.",
    factNumber: "1",
    factLabel:
      "Local owner per country matters more than one central platform for everyone.",
    factSource: "Open source approach, locally adapted",
    countriesTitle: "Where it could start",
    countries: [
      {
        name: "Austria",
        status: "Being discussed",
        body:
          "National Council, Federal Council, states, and municipalities each have their own paths. Good contacts and data sources would help most here.",
      },
      {
        name: "Portugal",
        status: "Local owners wanted",
        body:
          "Interesting if someone can check political levels, office addresses, and the right way to address representatives locally.",
      },
      {
        name: "The Netherlands",
        status: "Local owners wanted",
        body:
          "A useful example for testing how parliamentary responsibility, direct contact, and plain language fit together.",
      },
    ],
    contactTitle: "Do you have contacts or want to build?",
    contactBody:
      "Write to me if you want to build a local version or know reliable data sources. Most helpful: country, political level, data source, and whether you can build or test it yourself.",
    contactCta: "Write an email",
    guideCta: "Read the fork guide",
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
          "Yes. The code is open. You can fork it, use Mistral AI or another suitable LLM provider, map local representatives, and adapt copy, design, output language, forms of address, and privacy details.",
      },
      {
        q: "What kind of help is most useful right now?",
        a:
          "The most useful help is local ownership: people who know reliable data sources, understand the institutions, and can test whether the tool feels natural in that country.",
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
        q: "Can Thomas help with my version?",
        a:
          "Yes, within reason. I can share technical context and feedback, but I cannot run country-specific localization for all of Europe myself.",
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
  const adaptationGuideHref =
    "https://github.com/tholo91/brief-nach-berlin/blob/main/ADAPT_TO_YOUR_COUNTRY.md";

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
            className="h-auto w-full rounded-lg shadow-sm"
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

        <section className="mb-14 border-y border-waldgruen/15 py-8">
          <div className="mb-6">
            <h2 className="mb-2 font-body text-2xl font-bold text-waldgruen-dark">
              {t.guideTitle}
            </h2>
            <p className="font-body text-base leading-relaxed text-warmgrau">
              {t.guideIntro}
            </p>
          </div>
          <div className="grid gap-3">
            {t.guideSteps.map((step, index) => (
              <article
                key={step.title}
                className="grid gap-3 rounded-lg border border-waldgruen/10 bg-white p-4 shadow-sm sm:grid-cols-[3rem_1fr] sm:items-start"
              >
                <span className="font-typewriter text-sm font-bold text-waldgruen/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="mb-1 font-body text-lg font-bold text-waldgruen-dark">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-warmgrau">
                    {step.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

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
                className="rounded-lg border border-waldgruen/15 bg-white p-5 shadow-sm"
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
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={mailHref}
              className="inline-block rounded-sm bg-waldgruen-dark px-6 py-3 text-center font-body font-bold text-creme transition-colors hover:bg-waldgruen"
            >
              {t.contactCta}
            </a>
            <a
              href={adaptationGuideHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-sm border border-waldgruen/25 bg-white px-6 py-3 text-center font-body font-bold text-waldgruen-dark transition-colors hover:border-waldgruen hover:bg-creme"
            >
              {t.guideCta}
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
