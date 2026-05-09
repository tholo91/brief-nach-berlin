export default function Vision() {
  return (
    <section id="idee" className="py-20 md:py-28 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Warum wir das bauen
        </p>
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-10">
          Die Idee dahinter
        </h2>

        {/* Airmail divider */}
        <div
          className="w-16 h-1 mx-auto mb-10 rounded-full"
          style={{
            background: `repeating-linear-gradient(
              90deg,
              var(--color-airmail-rot) 0px,
              var(--color-airmail-rot) 4px,
              transparent 4px,
              transparent 6px,
              var(--color-airmail-blau) 6px,
              var(--color-airmail-blau) 10px,
              transparent 10px,
              transparent 12px
            )`,
          }}
          aria-hidden="true"
        />

        <div className="font-body text-base md:text-lg text-warmgrau leading-[1.8] space-y-5 text-left md:text-center">
          <p>
            Ich habe selbst im Bundestag gearbeitet und gesehen, was passiert,
            wenn ein persönlicher Brief auf einem Schreibtisch landet. Er wird
            gelesen. Mit der Hand. Oft im Team besprochen.
          </p>
          <p>
            Die meisten Leute wissen nur nicht, an wen sie schreiben sollen.
            Oder wie sie ihr Anliegen so formulieren, dass es ankommt.{" "}
            <span className="text-waldgruen-dark font-semibold">
              Brief-nach-Berlin nimmt diese beiden Hürden weg.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
