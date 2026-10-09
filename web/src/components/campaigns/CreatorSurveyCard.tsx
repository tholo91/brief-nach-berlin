import Link from "next/link";

const FEEDBACK_HREF = "/kampagne/verwalten/feedback";

const linkClasses =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen";

export function CreatorSurveyCard({ status }: { status: "open" | "submitted" }) {
  return (
    <section
      id="creator-survey"
      aria-labelledby="creator-survey-heading"
      className="scroll-mt-32 rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-7"
    >
      {status === "open" ? (
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end md:gap-8">
          <div>
            <h2
              id="creator-survey-heading"
              className="text-balance font-typewriter text-lg font-bold leading-snug text-waldgruen-dark md:text-xl"
            >
              Hast du 90 Sekunden für mich?
            </h2>
            <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-warmgrau/80 md:text-base">
              Erzähl mir kurz, wie eure Kampagne gelaufen ist. Deine Antworten helfen mir, Brief
              nach Berlin besser zu machen und anderen Initiativen den Start leichter.
            </p>
          </div>
          <Link
            href={FEEDBACK_HREF}
            className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-md bg-waldgruen px-5 py-2.5 text-center font-body text-base font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px motion-reduce:transition-none ${linkClasses}`}
          >
            Feedback geben
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <h2
            id="creator-survey-heading"
            className="font-typewriter text-lg font-bold leading-snug text-waldgruen-dark"
          >
            Danke, dein Feedback ist angekommen
          </h2>
          <Link
            href={FEEDBACK_HREF}
            className={`font-body text-sm font-semibold text-waldgruen-dark underline underline-offset-2 hover:text-waldgruen ${linkClasses}`}
          >
            Antworten ändern
          </Link>
        </div>
      )}
    </section>
  );
}
