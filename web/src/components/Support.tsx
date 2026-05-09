export default function Support() {
  return (
    <section id="mitmachen" className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Mitmachen
        </p>
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-6">
          Schreib mir
        </h2>

        <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed mb-10 max-w-lg mx-auto">
          Du findest die Idee gut, hast Feedback, willst weitersagen oder mitbauen?
          Ich freu mich über jede Nachricht. Beste Grüße aus Bremen, Thomas.
        </p>

        <a
          href="mailto:thomas_lorenz@posteo.de"
          className="inline-flex items-center gap-2 bg-waldgruen text-creme font-body font-semibold text-base px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/20 active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M2 8l10 7 10-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Schreib mir eine Mail
        </a>

        <p className="font-handwriting text-2xl text-waldgruen-dark/60 mt-8">
          Thomas
        </p>
      </div>
    </section>
  );
}
