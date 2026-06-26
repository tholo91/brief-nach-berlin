import Link from "next/link";
import { FOUNDER_FEEDBACK_URL } from "@/lib/config";
import { getLetterCount } from "@/lib/counter";

const footerSections = [
  {
    title: "Nutzen",
    links: [
      { label: "Der Guide", href: "/guide" },
      { label: "Beispiele", href: "/beispiele" },
      { label: "Tipps", href: "/tipps" },
      { label: "Warum ein Brief?", href: "/warum-ein-brief" },
      {
        label: "Treppe der Selbstwirksamkeit",
        href: "/treppe-der-selbstwirksamkeit",
      },
      { label: "Wer darf MdBs schreiben?", href: "/wer-darf-mdb-schreiben" },
    ],
  },
  {
    title: "Projekt",
    links: [
      { label: "Wer dahintersteht", href: "/warum" },
      { label: "KI & Transparenz", href: "/ki-transparenz" },
      { label: "Andere Demokratie-Tools", href: "/andere-tools" },
      { label: "Was bisher geschah", href: "/was-bisher-geschah" },
      { label: "Was noch kommt", href: "/was-noch-kommt" },
      { label: "Lage der Nation", href: "/lage-der-nation" },
      { label: "Presse", href: "/presse" },
    ],
  },
  {
    title: "Mitmachen",
    links: [
      { label: "Feedback", href: FOUNDER_FEEDBACK_URL, external: true },
      { label: "Weitersagen", href: "/weitersagen" },
      {
        label: "Open Source",
        href: "https://github.com/tholo91/brief-nach-berlin",
        external: true,
      },
      { label: "Europa", href: "/europe" },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
    ],
  },
] as const;

export default async function Footer() {
  const letterCount = await getLetterCount();
  return (
    <footer className="bg-creme">
      {/* Airmail stripe */}
      <div
        className="h-2 w-full"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            var(--color-airmail-rot),
            var(--color-airmail-rot) 8px,
            var(--color-creme) 8px,
            var(--color-creme) 12px,
            var(--color-airmail-blau) 12px,
            var(--color-airmail-blau) 20px,
            var(--color-creme) 20px,
            var(--color-creme) 24px
          )`,
        }}
      />

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_3fr]">
          <div>
            <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
              Brief nach Berlin
            </p>
            <p className="font-body text-sm leading-relaxed text-warmgrau/65 max-w-sm">
              Ein Freizeitprojekt, das Menschen hilft, politische Anliegen als
              Brief an die richtige Stelle zu formulieren.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8"
          >
            {footerSections.map((section) => (
              <div key={section.title}>
                <h2 className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
                  {section.title}
                </h2>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-sm text-warmgrau/70 hover:text-waldgruen-dark transition-colors duration-200"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          prefetch={false}
                          className="font-body text-sm text-warmgrau/70 hover:text-waldgruen-dark transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-warmgrau/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-typewriter text-sm text-warmgrau/40">
            Brief-nach-Berlin &copy; {new Date().getFullYear()}
            {letterCount > 0 && (
              <span className="ml-1"> · {letterCount} Briefe</span>
            )}
          </span>

          <Link
            href="/app"
            prefetch={false}
            className="font-body text-sm text-warmgrau/40 hover:text-warmgrau transition-colors duration-200"
          >
            Brief schreiben
          </Link>
        </div>
      </div>
    </footer>
  );
}
