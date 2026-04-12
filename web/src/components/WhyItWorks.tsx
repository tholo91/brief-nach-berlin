export default function WhyItWorks() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="font-body text-sm font-semibold tracking-widest uppercase text-airmail-rot mb-3">
          Belegt, nicht behauptet
        </p>
        <h2 className="font-typewriter text-3xl md:text-4xl lg:text-5xl font-bold text-waldgruen-dark tracking-tight mb-16 md:mb-20 max-w-xl">
          Warum ein Brief mehr bewegt
          <br />
          als tausend Klicks
        </h2>

        <div className="grid md:grid-cols-[1fr_1fr] gap-12 md:gap-20">
          {/* Left: Stats stacked */}
          <div className="space-y-12">
            <div>
              <div className="font-typewriter text-6xl md:text-7xl lg:text-8xl font-bold text-waldgruen tracking-tighter leading-none mb-3">
                96&thinsp;%
              </div>
              <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed max-w-[45ch]">
                der Mitarbeiter:innen im US-Kongress sagen: Handschriftliche Briefe sind das wirkungsvollste Mittel, das Bürger:innen haben.
              </p>
              <p className="font-body text-xs text-warmgrau/40 uppercase tracking-widest mt-2">
                Congressional Management Foundation
              </p>
            </div>

            <div>
              <div className="font-typewriter text-6xl md:text-7xl lg:text-8xl font-bold text-waldgruen tracking-tighter leading-none mb-3">
                5&#8211;7
              </div>
              <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed max-w-[45ch]">
                Briefe zum selben Thema reichen aus, damit ein Abgeordnetenbüro anfängt, das Thema ernsthaft zu verfolgen.
              </p>
              <p className="font-body text-xs text-warmgrau/40 uppercase tracking-widest mt-2">
                Congressional Management Foundation
              </p>
            </div>
          </div>

          {/* Right: Editorial pull-quote styled as letter excerpt */}
          <div className="flex items-center">
            <div
              className="relative bg-creme rounded-xl p-8 md:p-10"
              style={{
                borderLeft: `4px solid`,
                borderImage: `repeating-linear-gradient(
                  to bottom,
                  var(--color-airmail-rot) 0px,
                  var(--color-airmail-rot) 8px,
                  var(--color-creme) 8px,
                  var(--color-creme) 12px,
                  var(--color-airmail-blau) 12px,
                  var(--color-airmail-blau) 20px,
                  var(--color-creme) 20px,
                  var(--color-creme) 24px
                ) 1`,
              }}
            >
              {/* Decorative quote mark */}
              <span className="font-typewriter text-7xl text-waldgruen/15 leading-none absolute -top-2 left-4 select-none">
                &ldquo;
              </span>

              <blockquote className="relative z-10">
                <p className="font-handwriting text-2xl md:text-3xl text-waldgruen-dark leading-snug mb-6">
                  Handgeschriebene Briefe landen auf dem Schreibtisch.
                  <br />
                  E-Mails landen im Spam.
                </p>
                <cite className="font-body text-sm text-warmgrau/50 not-italic block">
                  Erfahrung aus einem Bundestags-Praktikum
                </cite>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
