const steps = [
  {
    number: "01",
    title: "Erzähl, was dich beschäftigt",
    description:
      "Stichpunkte oder Gedanken per Sprachnachricht, wir übernehmen die Formulierung. Egal ob Müll auf dem Spielplatz, bezahlbarer Wohnraum oder Sorgen um die Demokratie.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-waldgruen">
        <path d="M10 10h28v24H22l-7 6v-6h-5V10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <line x1="17" y1="19" x2="31" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="17" y1="25" x2="27" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Wir finden die passende Adresse",
    description:
      "Anhand deiner PLZ ermitteln wir, wer politisch zuständig ist. Datenschutzkonform, ohne Account.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-waldgruen">
        <circle cx="24" cy="18" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M24 26c-8 0-14 5-14 10h28c0-5-6-10-14-10z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M36 10l-4 4m4-4l4 4m-4-4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Dein Brief, fertig zum Abschicken",
    description:
      "Wir formulieren einen persönlichen, sachlichen Brief mit den besten Argumenten. Eine Seite, in deinem Postfach.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="text-waldgruen">
        <rect x="8" y="6" width="28" height="36" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="14" y1="14" x2="30" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="26" x2="26" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="32" x2="22" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="32" y="4" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="so-funktionierts" className="py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
            In drei Schritten
          </p>
          <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark tracking-tight">
            So einfach geht&apos;s
          </h2>
        </div>

        <ol className="grid md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step, i) => (
            <li key={step.number} className="relative">
              {/* Connector line between steps (desktop only) */}
              {i > 0 && (
                <div
                  className="hidden md:block absolute top-5 -left-4 w-8 h-px"
                  style={{
                    background: `repeating-linear-gradient(
                      90deg,
                      var(--color-airmail-rot) 0px,
                      var(--color-airmail-rot) 4px,
                      transparent 4px,
                      transparent 6px,
                      var(--color-airmail-blau) 6px,
                      var(--color-airmail-blau) 10px,
                      transparent 10px,
                      transparent 12px
                    )`,
                  }}
                  aria-hidden="true"
                />
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-waldgruen/10 shrink-0">
                  {step.icon}
                </div>
                <span className="font-typewriter text-[11px] tracking-widest text-warmgrau/50 font-bold uppercase">
                  Schritt {step.number}
                </span>
              </div>

              <h3 className="font-body text-lg md:text-xl font-bold text-waldgruen-dark mb-3 tracking-tight leading-snug">
                {step.title}
              </h3>

              <p className="font-body text-[15px] text-warmgrau/80 leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
