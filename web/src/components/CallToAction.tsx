export default function CallToAction() {
  return (
    <section id="cta" className="py-20 md:py-28 px-6 md:px-10 bg-waldgruen-dark relative overflow-hidden">
      {/* Large decorative airmail envelope — right side */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.12]">
        <svg width="500" height="340" viewBox="0 0 500 340" fill="none">
          <rect x="10" y="10" width="480" height="320" rx="12" stroke="white" strokeWidth="3" />
          <path d="M10 30 L250 200 L490 30" stroke="white" strokeWidth="3" strokeLinejoin="round" />
          {/* Stamp area */}
          <rect x="380" y="20" width="60" height="72" rx="4" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="max-w-xl">
          <h2 className="font-typewriter text-3xl md:text-4xl lg:text-5xl font-bold text-creme tracking-tight leading-snug mb-6">
            Wir bauen gerade an
            <br />
            Brief nach Berlin.
          </h2>

          <p className="font-body text-base md:text-lg text-creme/80 leading-relaxed mb-10 max-w-md">
            Bald kannst du deinen ersten Brief schreiben.
            <br />
            An den Abgeordneten, der für dein Anliegen zuständig ist.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
            <a
              href="mailto:thomas_lorenz@posteo.de"
              className="inline-flex items-center gap-2 bg-creme text-waldgruen-dark font-body font-semibold text-base px-7 py-3.5 rounded-xl hover:bg-white transition-colors cursor-pointer active:scale-[0.98]"
            >
              Schreib mir &rarr;
            </a>
            <div className="inline-flex items-center gap-3 text-creme/60 text-sm font-body">
              <div className="w-2.5 h-2.5 rounded-full bg-waldgruen-light animate-pulse flex-shrink-0" />
              In Entwicklung
            </div>
          </div>

          <p className="font-handwriting text-xl text-creme/40 leading-relaxed">
            Demokratie braucht deine Stimme.
            <br />
            Und vielleicht deinen Brief.
          </p>
        </div>
      </div>
    </section>
  );
}
