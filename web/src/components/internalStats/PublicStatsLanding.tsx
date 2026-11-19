import { PressContactButton } from "@/components/PressContactButton";
import { KeyFigures } from "@/components/internalStats/KeyFigures";
import type { KeyFigures as KeyFiguresData } from "@/lib/internalStats/keyFigures";

const ACCESS_MAIL_SUBJECT = "Presseanfrage: Zugang Statistik";
const ACCESS_MAIL_BODY =
  "Hallo Thomas,\n\nich schreibe für [Medium] über [Thema] und hätte gern Zugang zur Statistik von Brief-nach-Berlin.\n\nViele Grüße\n";

type PublicStatsLandingProps = {
  configured: boolean;
  error: boolean;
  figures: KeyFiguresData | null;
};

export function PublicStatsLanding({ configured, error, figures }: PublicStatsLandingProps) {
  return (
    <div className="flex-1 bg-creme">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <p className="font-typewriter text-xs font-bold uppercase tracking-[0.18em] text-waldgruen/65">
          Für Presse und Partner
        </p>
        <h1 className="mt-3 font-typewriter text-3xl font-bold leading-tight text-waldgruen-dark sm:text-5xl">
          Brief-nach-Berlin in Zahlen
        </h1>
        <p className="mt-5 max-w-2xl font-body text-base leading-relaxed text-warmgrau sm:text-lg">
          Einen Brief von Hand zu schreiben aktiviert. Wer sich die Zeit nimmt, ein Anliegen
          aufzuschreiben und abzuschicken, übt sich in Mitbestimmung. Dieser Akt ist schon
          demokratisches Engagement, ob am Ende eine Antwort kommt oder nicht.
        </p>

        {figures && (
          <div className="mt-10 sm:mt-12">
            <KeyFigures figures={figures} />
          </div>
        )}

        <section className="mt-12 rounded-2xl border-2 border-waldgruen/20 bg-white/60 p-6 sm:p-8">
          <h2 className="font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl">
            Mehr Zahlen für Ihren Artikel?
          </h2>
          <p className="mt-2 max-w-xl font-body leading-relaxed text-warmgrau/80">
            Schreiben Sie mir kurz, für welches Medium Sie berichten. Ich schicke Ihnen einen Link,
            mit dem Sie die Presse-Statistik öffnen können.
          </p>
          <div className="mt-5 max-w-xs">
            <PressContactButton subject={ACCESS_MAIL_SUBJECT} body={ACCESS_MAIL_BODY} label="Zugang anfragen" />
          </div>
        </section>

        <section className="mt-8 max-w-md">
          <h2 className="font-body text-sm font-semibold text-warmgrau/80">Sie haben schon ein Passwort?</h2>
          {configured ? (
            <form action="/stats/unlock" method="post" className="mt-3 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="stats-password" className="sr-only">
                Passwort
              </label>
              <input
                id="stats-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Passwort"
                required
                className="flex-1 rounded-md border border-warmgrau/20 bg-white px-3 py-2 font-body text-warmgrau outline-none focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/20"
              />
              <button
                type="submit"
                className="rounded-md border-2 border-waldgruen-dark/30 px-4 py-2 font-body font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen-dark hover:bg-waldgruen/5"
              >
                Statistik öffnen
              </button>
            </form>
          ) : (
            <p className="mt-2 font-body text-sm text-warmgrau/70">Der Zugang ist noch nicht eingerichtet.</p>
          )}
          {error && <p className="mt-2 font-body text-sm text-airmail-rot">Das Passwort stimmt nicht.</p>}
        </section>
      </div>
    </div>
  );
}
