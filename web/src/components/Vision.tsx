import Image from "next/image";
import Link from "next/link";

export default function Vision() {
  return (
    <section id="idee" className="py-20 md:py-28 px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div className="text-center md:text-left">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
            Warum wir das bauen
          </p>
          <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-10">
            Die Idee dahinter
          </h2>

          {/* Airmail divider */}
          <div
            className="w-16 h-1 mx-auto md:mx-0 mb-10 rounded-full"
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

          <div className="font-body text-base md:text-lg text-warmgrau leading-[1.8] space-y-5 text-left">
            <p>
              Ich habe selbst im Bundestag gearbeitet und gesehen, was passiert,
              wenn ein persönlicher Brief auf einem Schreibtisch landet. Er wird
              gelesen. Mit der Hand. Oft im Team besprochen.
            </p>
            <p>
              Die meisten Leute wissen nur nicht, an wen sie schreiben sollen.
              Oder wie sie ihr Anliegen so formulieren, dass es ankommt.{" "}
              <span className="text-waldgruen-dark font-semibold">
                Brief-nach-Berlin nimmt dir diese Hürden.
              </span>
            </p>
            <p className="font-body text-sm md:text-base text-warmgrau/80 pt-2">
              Die Idee brachte mir meine Mutter in Duisburg.{" "}
              <Link
                href="/warum"
                prefetch={false}
                className="text-waldgruen hover:text-waldgruen-dark underline decoration-waldgruen/40 underline-offset-4 hover:decoration-waldgruen transition-colors"
              >
                Die ganze Geschichte dahinter
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="relative aspect-square w-full max-w-md mx-auto md:max-w-none rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/images/bundestag-team-besprechung.webp"
            alt="Drei Mitarbeitende in einem Bundestagsbüro besprechen gemeinsam einen handgeschriebenen Brief, der aufgeschlagen auf dem Schreibtisch liegt."
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
