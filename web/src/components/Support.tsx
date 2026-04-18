export default function Support() {
  return (
    <section id="mitmachen" className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 text-center mb-3">
          Ein Projekt für alle
        </p>
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark text-center tracking-tight mb-12">
          Unterstützen, mitmachen, mitgestalten
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
          <div className="bg-creme rounded-2xl p-7 border border-warmgrau/5">
            <div className="w-10 h-10 rounded-xl bg-waldgruen/10 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-waldgruen">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h3 className="font-typewriter text-lg font-bold text-waldgruen-dark mb-2">
              Feedback geben
            </h3>
            <p className="font-body text-base text-warmgrau/80 leading-relaxed">
              Du findest die Idee gut? Oder hast Verbesserungsvorschläge?
              Jede Rückmeldung hilft uns, das Richtige zu bauen.
            </p>
          </div>

          <div className="bg-creme rounded-2xl p-7 border border-warmgrau/5">
            <div className="w-10 h-10 rounded-xl bg-waldgruen/10 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-waldgruen">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h3 className="font-typewriter text-lg font-bold text-waldgruen-dark mb-2">
              Weitersagen
            </h3>
            <p className="font-body text-base text-warmgrau/80 leading-relaxed">
              Erzähl Freunden, Familie oder deiner Bürgerinitiative davon.
              Je mehr Menschen schreiben, desto mehr bewegt sich.
            </p>
          </div>

          <div className="bg-creme rounded-2xl p-7 border border-warmgrau/5">
            <div className="w-10 h-10 rounded-xl bg-waldgruen/10 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-waldgruen">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h3 className="font-typewriter text-lg font-bold text-waldgruen-dark mb-2">
              Mitgestalten
            </h3>
            <p className="font-body text-base text-warmgrau/80 leading-relaxed">
              Du möchtest mitbauen, bist Teil einer Organisation oder hast eine Idee, die hier reinpasst? Schreib mir — ich bin Thomas, Gründer hinter Brief-nach-Berlin.
            </p>
          </div>
        </div>

        <div className="text-center flex flex-col items-center gap-4">
          <a
            href="mailto:thomas_lorenz@posteo.de"
            className="inline-flex items-center gap-2 bg-waldgruen text-creme font-body font-semibold text-base px-8 py-4 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M2 8l10 7 10-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Schreib uns gerne eine Mail
          </a>
          <p className="font-body text-sm text-warmgrau/60 leading-relaxed max-w-sm italic">
            Du hast Ideen, willst dich einfach mal melden oder möchtest mitmachen? Ich freu mich über deine Nachricht.<br />Beste Grüße aus Bremen – Thomas ✌️
          </p>
        </div>
      </div>
    </section>
  );
}
