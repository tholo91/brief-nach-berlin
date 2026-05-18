import { CONTACT } from "@/lib/contact";

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-20 md:py-28 px-6 bg-waldgruen-dark/[0.03]">
      <div className="max-w-5xl mx-auto">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Wo wir hinwollen
        </p>
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-4 max-w-xl">
          Brief nach Berlin wird mit euch immer besser
        </h2>
        <p className="font-body text-base md:text-lg text-warmgrau/80 leading-relaxed mb-14 max-w-2xl">
          Wir bauen gerade und lernen mit jedem Brief. Hier ist, worauf wir uns als nächstes konzentrieren:
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-waldgruen/10 p-7 flex flex-col gap-4">
            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-waldgruen">
                <line x1="13" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="7" y1="22" x2="29" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="28" x2="32" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-2">
                Richtiges politisches Level
              </p>
              <h3 className="font-body text-lg font-bold text-waldgruen-dark leading-snug mb-3">
                Kommunal, Landes-, Bundes- oder Europapolitik
              </h3>
              <p className="font-body text-sm text-warmgrau/80 leading-relaxed mb-4">
                Nicht jedes Anliegen gehört nach Berlin. Wir möchten automatisch erkennen, welches politische Level zuständig ist, damit dein Brief dort landet, wo er wirklich etwas bewirken kann.
              </p>
              <span className="inline-block font-typewriter text-[10px] font-bold tracking-wider uppercase text-waldgruen bg-waldgruen/10 px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            </div>
          </div>

          <div
            id="mitmachen"
            className="md:col-span-2 bg-white rounded-xl border border-waldgruen/10 p-7 md:p-10 flex flex-col gap-5"
          >
            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-waldgruen">
                <path d="M18 4l3.6 7.3 8 1.2-5.8 5.6 1.4 8L18 22.3 10.8 26l1.4-8L6.4 12.5l8-1.2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
                <path d="M12 30h12M15 33h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50">
              Mitgestalten
            </p>
            <h3 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark leading-snug">
              Dein Feedback formt den nächsten Brief
            </h3>
            <p className="font-body text-base text-warmgrau leading-relaxed max-w-xl">
              Jede Rückmeldung hilft uns, Brief-nach-Berlin zu verbessern. Demokratie lebt vom Mitmachen, und das gilt auch hier: Wenn Du Feedback hast, uns weiterempfehlen oder mitwirken willst, freu ich mich über jede Nachricht.
            </p>
            <div className="mt-1">
              <p className="font-body text-base text-warmgrau leading-relaxed mb-1">
                Beste Grüße aus Bremen
              </p>
              <p className="font-handwriting text-2xl text-waldgruen-dark/60">
                Thomas
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mt-2">
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex items-center justify-center gap-2 bg-waldgruen text-creme font-body font-semibold text-base px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/20 active:scale-[0.98]"
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
                className="inline-flex items-center justify-center gap-2 bg-white text-waldgruen border-2 border-waldgruen font-body font-semibold text-base px-7 py-[12px] rounded-xl hover:bg-waldgruen/5 transition-colors cursor-pointer active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M12 2a4 4 0 00-4 4v6a4 4 0 008 0V6a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 11a7 7 0 0014 0M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Feedback geben
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
