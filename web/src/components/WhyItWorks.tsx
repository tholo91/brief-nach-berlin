const stats = [
  {
    number: "96\u00A0%",
    label:
      "der Abgeordneten im US-Kongress sagen: Handschriftliche Briefe sind das wirkungsvollste Mittel, das die Bevölkerung hat.",
    source: "Congressional Management Foundation",
  },
  {
    number: "5\u20137",
    label:
      "Briefe zum selben Thema reichen aus, damit ein Abgeordnetenbüro anfängt, das Thema ernsthaft zu verfolgen.",
    source: "Congressional Management Foundation",
  },
];

export default function WhyItWorks() {
  return (
    <section id="warum-briefe" className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 text-center mb-3">
          Belegt, nicht behauptet
        </p>
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark text-center tracking-tight mb-14 md:mb-16">
          Warum ein Brief mehr bewegt
          <br />
          als tausend Klicks
        </h2>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 mb-16">
          {stats.map((stat) => (
            <div key={stat.number} className="text-center md:text-left">
              <div className="font-typewriter text-5xl md:text-7xl font-bold text-waldgruen mb-3 leading-none">
                {stat.number}
              </div>
              <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed mb-2">
                {stat.label}
              </p>
              <p className="font-body text-xs text-warmgrau/40 uppercase tracking-wide">
                Quelle: {stat.source}
              </p>
            </div>
          ))}
        </div>

        {/* Pull quote — divider line + quote */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-px bg-waldgruen/20 mx-auto mb-8" />
          <blockquote>
            <p className="font-handwriting text-2xl md:text-3xl text-waldgruen-dark leading-snug mb-4">
              &ldquo;Handgeschriebene Briefe landen
              <br className="hidden md:block" />
              {" "}auf dem Schreibtisch.
              <br />
              E-Mails landen im Spam.&rdquo;
            </p>
            <cite className="font-body text-sm text-warmgrau/50 not-italic">
              Erfahrung aus einem Bundestags-Praktikum
            </cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
