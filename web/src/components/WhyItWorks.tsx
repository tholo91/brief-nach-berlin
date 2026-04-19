const stats = [
  {
    number: "9.260",
    label:
      "Petitionen gingen 2024 beim Petitionsausschuss des Bundestags ein – nur 607 wurden im Ausschuss einzeln beraten. Ein direkter Brief an deinen Wahlkreisabgeordneten landet nicht in dieser Warteschlange.",
    source: "Petitionsausschuss, Jahresbericht 2024",
  },
  {
    number: "~50",
    label:
      "Anfragen treffen täglich in einem Abgeordnetenbüro ein. Wer durch Handschrift, Wahlkreisbezug und ein konkretes Anliegen auffällt, landet oben auf dem Stapel.",
    source: "Deutscher Bundestag",
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
              &ldquo;Handgeschriebene Briefe landen auf dem Schreibtisch.
              <br />
              E-Mails landen im Spam.&rdquo;
            </p>
            <cite className="font-body text-sm text-warmgrau/50 not-italic">
              Thomas Lorenz, Gründer – aus seiner Zeit im Bundestag (2011)
            </cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
