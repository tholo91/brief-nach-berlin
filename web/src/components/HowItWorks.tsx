const steps = [
  {
    number: "01",
    title: "Erzähl, was dich nervt",
    description:
      "Tipp es ein oder sprich es aus. Du brauchst kein politisches Vorwissen. Nur eine Meinung.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        className="text-waldgruen"
      >
        <path
          d="M8 8h24v20H18l-6 5v-5H8V8z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
        />
        <line x1="14" y1="15" x2="26" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="21" x2="22" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Wir finden, wer zuständig ist",
    description:
      "Deine PLZ reicht. Wir finden den richtigen Abgeordneten: Bundestag, Landtag oder Rathaus.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        className="text-waldgruen"
      >
        <circle cx="20" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M20 24c-7 0-12 4-12 8h24c0-4-5-8-12-8z" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M28 12l4-4m0 0l4 4m-4-4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Brief abschreiben, abschicken",
    description:
      "Wir formulieren. Du schreibst ab, per Hand, eine Seite. Fünf Minuten, die wirklich etwas bewegen.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        className="text-waldgruen"
      >
        <rect x="8" y="4" width="24" height="32" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <line x1="13" y1="12" x2="27" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="17" x2="27" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="22" x2="24" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="27" x2="20" y2="27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 30l5-5 3 3-5 5H22v-3z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="so-funktionierts" className="py-20 md:py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="font-body text-sm font-semibold tracking-widest uppercase text-waldgruen text-center mb-3">
          In drei Schritten
        </p>
        <h2 className="font-typewriter text-3xl md:text-4xl font-bold text-waldgruen-dark text-center mb-4">
          So einfach geht&apos;s
        </h2>
        <p className="font-body text-base md:text-lg text-warmgrau/70 text-center mb-14 md:mb-16 max-w-lg mx-auto">
          Kein Formulardschungel. Kein Amtsdeutsch. Nur du, dein Anliegen und fünf Minuten.
        </p>

        <div className="grid md:grid-cols-3 gap-6 md:gap-10">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl p-7 md:p-8 shadow-sm border border-warmgrau/5 hover:shadow-md hover:border-waldgruen/15 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-waldgruen/10 flex items-center justify-center flex-shrink-0">
                  {step.icon}
                </div>
                <span className="font-typewriter text-xs tracking-wider text-waldgruen/40 font-bold uppercase">
                  Schritt {step.number}
                </span>
              </div>
              <h3 className="font-typewriter text-lg md:text-xl font-bold text-waldgruen-dark mb-3 leading-snug">
                {step.title}
              </h3>
              <p className="font-body text-base text-warmgrau/80 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
