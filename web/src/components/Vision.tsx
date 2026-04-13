export default function Vision() {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Warum wir das bauen
        </p>
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-10">
          Die Idee dahinter
        </h2>

        <div className="font-body text-base md:text-lg text-warmgrau leading-[1.8] space-y-5 text-left md:text-center">
          <p>
            Ich habe im Bundestag gearbeitet und gesehen, was passiert, wenn ein handgeschriebener Brief auf dem Schreibtisch landet:{" "}
            <strong className="text-waldgruen-dark">Er wird gelesen. Er wird besprochen. Er wird ernst genommen.</strong>
          </p>
          <p>
            E-Mails? Oft ignoriert. Online-Petitionen? Ein Klick unter Tausenden.
            Aber ein persönlicher Brief? Das ist eine Stimme, die ankommt.
          </p>
          <p>
            Das Problem: Die meisten wissen nicht, <em>wem</em> sie schreiben sollen.
            Oder <em>was</em>. Oder glauben, es bringt eh nichts.
          </p>
          <p className="font-semibold text-waldgruen-dark text-lg md:text-xl">
            Brief nach Berlin räumt diese Hürden aus dem Weg.
            <br className="hidden md:block" />
            Du redest, wir kümmern uns um den Rest.
          </p>
        </div>
      </div>
    </section>
  );
}
