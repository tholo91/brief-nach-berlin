import Image from "next/image";

export default function CallToAction() {
  return (
    <section
      id="cta"
      className="py-20 md:py-28 px-6 bg-waldgruen-dark relative overflow-hidden"
    >
      {/* Ghibli vignette: letterbox in Berlin */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <Image
          src="/images/letterbox-berlin.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25 mix-blend-luminosity"
          priority={false}
        />
        <div className="absolute inset-0 bg-waldgruen-dark/60" />
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="font-body text-3xl md:text-4xl font-bold text-creme mb-6 leading-snug tracking-tight">
          Bereit für deinen Brief?
        </h2>

        <p className="font-body text-base md:text-lg text-creme/85 leading-relaxed mb-10 max-w-md mx-auto">
          Beschreib uns in Stichpunkten, was dich bewegt. Wir finden die
          zuständigen Abgeordneten und formulieren einen Brief, der ankommt.
        </p>

        <a
          href="/app"
          className="inline-block bg-creme text-waldgruen-dark font-body font-semibold text-base md:text-lg px-10 py-4 rounded-xl hover:bg-creme/90 transition-colors cursor-pointer shadow-lg active:scale-[0.98]"
        >
          Jetzt Brief schreiben &rarr;
        </a>

        <p className="mt-5 font-body text-sm text-creme/70">
          Kostenlos · In 3 Minuten · Ohne Anmeldung
        </p>
      </div>
    </section>
  );
}
