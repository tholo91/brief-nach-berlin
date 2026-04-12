export default function Support() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="font-body text-sm font-semibold tracking-widest uppercase text-airmail-rot mb-3">
          Ein Projekt für alle
        </p>
        <h2 className="font-typewriter text-3xl md:text-4xl lg:text-5xl font-bold text-waldgruen-dark tracking-tight mb-12 md:mb-16 max-w-lg">
          Unterstützen, mitmachen, fördern
        </h2>

        {/* Offset grid: first item full-width, then 2 columns */}
        <div className="space-y-6">
          {/* Primary card — full width */}
          <div className="bg-creme rounded-2xl p-8 md:p-10 border-l-4 border-airmail-rot">
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-airmail-rot">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  <h3 className="font-typewriter text-xl font-bold text-waldgruen-dark">
                    Feedback geben
                  </h3>
                </div>
                <p className="font-body text-base text-warmgrau/80 leading-relaxed max-w-lg">
                  Du findest die Idee gut? Oder hast Verbesserungsvorschläge?
                  Jede Rückmeldung hilft uns, das Richtige zu bauen.
                </p>
              </div>
              <a
                href="mailto:thomas_lorenz@posteo.de"
                className="inline-flex items-center gap-2 bg-waldgruen text-creme font-body font-semibold text-base px-7 py-3.5 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer active:scale-[0.98] whitespace-nowrap"
              >
                Schreib mir &rarr;
              </a>
            </div>
          </div>

          {/* Two smaller cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-creme rounded-2xl p-8 border-l-4 border-waldgruen">
              <div className="flex items-center gap-3 mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-waldgruen">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <h3 className="font-typewriter text-xl font-bold text-waldgruen-dark">
                  Weitersagen
                </h3>
              </div>
              <p className="font-body text-base text-warmgrau/80 leading-relaxed">
                Erzähl Freund:innen, Familie oder deiner Bürgerinitiative davon.
                Je mehr Menschen schreiben, desto mehr bewegt sich.
              </p>
            </div>

            <div className="bg-creme rounded-2xl p-8 border-l-4 border-airmail-blau">
              <div className="flex items-center gap-3 mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-airmail-blau">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <h3 className="font-typewriter text-xl font-bold text-waldgruen-dark">
                  Fördern
                </h3>
              </div>
              <p className="font-body text-base text-warmgrau/80 leading-relaxed">
                Brief nach Berlin ist gemeinnützig gedacht und werbefrei.
                Wir finanzieren uns über Fördermittel und Spenden, nicht über Daten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
