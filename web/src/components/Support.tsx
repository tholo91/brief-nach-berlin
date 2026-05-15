import { CONTACT } from "@/lib/contact";

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

        <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed mb-2 max-w-lg mx-auto">
          Du findest die Idee gut, hast Feedback, willst weitersagen oder mitbauen?
          Ich freu mich über jede Nachricht.
        </p>
        <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed mb-1 max-w-lg mx-auto">
          Beste Grüße aus Bremen
        </p>
        <p className="font-handwriting text-2xl text-waldgruen-dark/60 mb-10">
          Thomas
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex items-center justify-center gap-2 bg-waldgruen text-creme font-body font-semibold text-base px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/20 active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M2 8l10 7 10-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Schreib mir eine Mail
          </a>
          <a
            href="https://www.heyspeak.io/l/WIOENjqJn6z6WKtkWgDEFg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-waldgruen border-2 border-waldgruen font-body font-semibold text-base px-8 py-[14px] rounded-xl hover:bg-waldgruen/5 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M12 2a4 4 0 00-4 4v6a4 4 0 008 0V6a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Feedback geben
          </a>
        </div>
      </div>
    </section>
  );
}
