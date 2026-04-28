const steps = [
  {
    number: "01",
    title: "Erzähl, was dich beschäftigt",
    description:
      "Schilder dein Anliegen so detailliert wie möglich: Zu viel Müll auf dem Spielplatz um die Ecke? Mehr Förderung nachhaltiger Projekte? Du hast Angst vor dem Rechtsruck?",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-waldgruen">
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
      "Anhand deiner PLZ ermitteln wir, wer politisch zuständig ist: Bundestag, Landtag oder Rathaus. Und das alles datenschutzkonform.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-waldgruen">
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
      "Wir formulieren einen persönlichen, sachlichen Brief mit den besten Argumenten. Eine Seite, per E-Mail in deinem Postfach.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-waldgruen">
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

function AirmailDivider() {
  return (
    <div className="h-px w-full my-2" style={{
      background: `repeating-linear-gradient(
        90deg,
        var(--color-airmail-rot) 0px,
        var(--color-airmail-rot) 8px,
        transparent 8px,
        transparent 12px,
        var(--color-airmail-blau) 12px,
        var(--color-airmail-blau) 20px,
        transparent 20px,
        transparent 24px
      )`
    }} />
  );
}

export default function HowItWorks() {
  return (
    <section id="so-funktionierts" className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          In drei Schritten
        </p>
        <h2 className="font-body text-3xl md:text-4xl lg:text-5xl font-bold text-waldgruen-dark tracking-tight mb-16 md:mb-20 max-w-lg">
          So einfach geht&apos;s
        </h2>

        <div className="space-y-16 md:space-y-0">
          {steps.map((step, i) => (
            <div key={step.number}>
              {i > 0 && (
                <div className="hidden md:block py-10">
                  <AirmailDivider />
                </div>
              )}
              <div
                className="grid md:grid-cols-[1fr_1fr] gap-8 md:gap-16 items-center"
                style={i % 2 === 1 ? { direction: "rtl" } : undefined}
              >
                {/* Text side */}
                <div style={i % 2 === 1 ? { direction: "ltr" } : undefined}>
                  <div className="flex items-center gap-4 mb-4">
                    {step.icon}
                    <span className="font-typewriter text-xs tracking-widest text-warmgrau/40 font-bold uppercase">
                      Schritt {step.number}
                    </span>
                  </div>
                  <h3 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark mb-4 tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <p className="font-body text-base md:text-lg text-warmgrau/80 leading-relaxed max-w-[50ch]">
                    {step.description}
                  </p>
                </div>

                {/* Number side */}
                <div
                  className="hidden md:flex items-center justify-center"
                  style={i % 2 === 1 ? { direction: "ltr" } : undefined}
                >
                  <span className="font-typewriter text-[12rem] lg:text-[16rem] font-bold text-waldgruen/[0.06] leading-none select-none">
                    {step.number}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
