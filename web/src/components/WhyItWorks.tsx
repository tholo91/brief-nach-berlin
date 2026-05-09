import Image from "next/image";

const stats = [
  {
    number: "9.260",
    label:
      "Petitionen gingen 2024 beim Bundestag ein. Nur 607 wurden im Ausschuss einzeln beraten. Ein Brief an deinen Wahlkreisabgeordneten landet nicht in dieser Schlange.",
    source: "Petitionsausschuss, Jahresbericht 2024",
  },
  {
    number: "~50",
    label:
      "Anfragen kommen täglich in einem Abgeordnetenbüro an. Wer mit Handschrift und Wahlkreisbezug auffällt, landet oben auf dem Stapel.",
    source: "Deutscher Bundestag",
  },
];

export default function WhyItWorks() {
  return (
    <section id="warum-briefe" className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-14 md:mb-16 max-w-xl">
          Warum ein Brief mehr bewegt
          <br />
          als tausend Klicks
        </h2>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left column: Ghibli illustration */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-[0_24px_60px_-24px_rgba(45,80,22,0.35)] ring-1 ring-warmgrau/10">
              <Image
                src="/images/letter-on-desk.webp"
                alt="Ein handgeschriebener Brief wird in einem Berliner Abgeordnetenbüro gelesen, mit Blick auf grüne Altbau-Fassaden."
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority={false}
              />
            </div>
          </div>

          {/* Right column: stats */}
          <div className="space-y-10 md:space-y-12">
            {stats.map((stat) => (
              <div key={stat.number} className="pl-5 border-l-2 border-airmail-rot/50">
                <div className="font-typewriter text-5xl md:text-6xl font-bold text-waldgruen mb-3 leading-none">
                  {stat.number}
                </div>
                <p className="font-body text-base md:text-[17px] text-warmgrau leading-relaxed mb-2">
                  {stat.label}
                </p>
                <p className="font-body text-xs text-warmgrau/40 uppercase tracking-wide">
                  Quelle: {stat.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
