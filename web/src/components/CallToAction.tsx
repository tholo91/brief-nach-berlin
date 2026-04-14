export default function CallToAction() {
  return (
    <section id="cta" className="py-20 md:py-28 px-6 bg-waldgruen-dark relative overflow-hidden">
      {/* Subtle decorative envelope shapes */}
      <div className="absolute top-8 left-8 opacity-[0.06] rotate-12">
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
          <rect x="2" y="2" width="116" height="76" rx="4" stroke="white" strokeWidth="2" />
          <path d="M2 6 L60 45 L118 6" stroke="white" strokeWidth="2" />
        </svg>
      </div>
      <div className="absolute bottom-8 right-8 opacity-[0.06] -rotate-6">
        <svg width="100" height="66" viewBox="0 0 120 80" fill="none">
          <rect x="2" y="2" width="116" height="76" rx="4" stroke="white" strokeWidth="2" />
          <path d="M2 6 L60 45 L118 6" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="font-body text-3xl md:text-4xl font-bold text-creme mb-6 leading-snug tracking-tight">
          Bereit für deinen Brief?
        </h2>

        <p className="font-body text-base md:text-lg text-creme/85 leading-relaxed mb-10 max-w-md mx-auto">
          Beschreib dein Anliegen, wir finden die zuständige Person
          und formulieren einen Brief, der ankommt.
          <br className="hidden md:block" />
          {" "}Kostenlos, in drei Minuten.
        </p>

        <a
          href="/app"
          className="inline-block bg-creme text-waldgruen-dark font-body font-semibold text-base md:text-lg px-10 py-4 rounded-xl hover:bg-creme/90 transition-colors cursor-pointer shadow-lg active:scale-[0.98]"
        >
          Jetzt Brief schreiben &rarr;
        </a>

        <p className="mt-10 font-handwriting text-xl text-creme/50 leading-relaxed">
          Demokratie braucht deine Stimme.
          <br />
          Und vielleicht deinen Brief.
        </p>
      </div>
    </section>
  );
}
