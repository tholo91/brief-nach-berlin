export default function Vision() {
  return (
    <section className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Airmail divider */}
        <div className="h-px w-24 mb-16" style={{
          background: `repeating-linear-gradient(
            90deg,
            var(--color-airmail-rot) 0px,
            var(--color-airmail-rot) 8px,
            transparent 8px,
            transparent 12px,
            var(--color-airmail-blau) 12px,
            var(--color-airmail-blau) 20px,
            transparent 20px,
            transparent 24px
          )`
        }} />

        <div className="max-w-2xl">
          {/* Large decorative quote mark */}
          <span className="font-typewriter text-8xl md:text-9xl text-waldgruen/10 leading-none block -mb-10 md:-mb-14 select-none">
            &ldquo;
          </span>

          <div className="font-body text-lg md:text-xl text-warmgrau leading-[1.8] space-y-6">
            <p>
              Ich habe im Bundestag gearbeitet und gesehen, was passiert, wenn ein handgeschriebener Brief auf dem Schreibtisch landet:{" "}
              <span className="bg-waldgruen/[0.07] px-1 rounded text-waldgruen-dark font-semibold">
                Er wird gelesen. Er wird besprochen. Er wird ernst genommen.
              </span>
            </p>
            <p>
              E-Mails? Oft ignoriert. Online-Petitionen? Ein Klick unter Tausenden.
              Aber ein persönlicher Brief? Das ist eine Stimme, die ankommt.
            </p>
            <p>
              Das Problem: Die meisten wissen nicht, <em>wem</em> sie schreiben sollen.
              Oder <em>was</em>. Oder glauben, es bringt eh nichts.
            </p>
          </div>

          <p className="font-typewriter text-2xl md:text-3xl font-bold text-waldgruen-dark tracking-tight mt-10 leading-snug">
            Brief nach Berlin räumt
            <br />
            die Hürden aus dem Weg.
          </p>
        </div>
      </div>
    </section>
  );
}
