const FAQ_ITEMS = [
  {
    question: "Ist das wirklich kostenlos?",
    answer:
      "Ja. Du zahlst nichts, kein Abo, keine Premium-Stufe. Brief-nach-Berlin läuft auf einer kleinen Infrastruktur, die Thomas selbst trägt. Die KI-Kosten pro Brief liegen im Cent-Bereich. Wenn das Projekt mal teurer wird, sagen wir Bescheid.",
  },
  {
    question: "Was passiert mit meinen Daten?",
    answer:
      "Dein Anliegen wird einmalig an die KI geschickt, der Brief kommt zurück, danach speichern wir nichts. Kein Account, kein Tracking, keine Werbung. Was du eingibst, sehen wir nicht.",
  },
  {
    question: "Wirken handgeschriebene Briefe wirklich?",
    answer:
      "Ja, in einem Maß, das viele unterschätzen. In einem Bundestagsbüro landen täglich Dutzende Mails und Online-Petitionen. Ein handgeschriebener Brief mit Wahlkreisbezug ist die Ausnahme und landet oben auf dem Stapel. Genau dafür ist Brief-nach-Berlin gebaut.",
  },
  {
    question: "Welche politischen Ebenen sind dabei?",
    answer:
      "Aktuell der Bundestag, abhängig von deiner Postleitzahl. Landtag und kommunale Ebene kommen schrittweise dazu. Wenn dein Anliegen vor Ort liegt, sagen wir dir das.",
  },
  {
    question: "Wer steckt dahinter?",
    answer:
      "Thomas Lorenz, Produktentwickler aus Bremen mit politikwissenschaftlichem Hintergrund. Brief-nach-Berlin ist ein unabhängiges, parteiloses Projekt. Keine Lobby, kein NGO-Apparat, kein Werbebudget.",
  },
];

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-waldgruen transition-transform duration-200"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-28 px-6 bg-creme">
      <div className="max-w-2xl mx-auto">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Häufige Fragen
        </p>
        <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark tracking-tight mb-12">
          Fragen, die wir öfter hören
        </h2>

        <div className="divide-y divide-waldgruen/15 border-y border-waldgruen/15">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group [&[open]_svg]:rotate-180 [&[open]]:bg-waldgruen/[0.03] rounded-lg transition-colors duration-150 -mx-3 px-3"
            >
              <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-body text-base md:text-lg font-semibold text-waldgruen-dark pr-2 transition-colors duration-150 group-open:text-waldgruen">
                  {item.question}
                </span>
                <ChevronIcon />
              </summary>
              <p className="font-body text-base text-warmgrau leading-relaxed pb-6 pr-8">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
