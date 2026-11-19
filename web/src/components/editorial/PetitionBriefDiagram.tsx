const SIGNATURES = 48;

const LETTERS = [
  { text: "Unser Jugendtreff schließt im Januar.", rotate: "-rotate-2" },
  { text: "Ich leite die Gruppe seit acht Jahren.", rotate: "rotate-1" },
  { text: "Meine Tochter war jede Woche dort.", rotate: "-rotate-1" },
];

export function PetitionBriefDiagram() {
  return (
    <figure
      className="not-prose my-12 rounded-xl border border-waldgruen/15 bg-surface/70 p-5 shadow-sm sm:p-8"
      aria-labelledby="petition-brief-diagram-caption"
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-8">
        <div className="flex flex-col">
          <p className="font-typewriter text-[0.7rem] font-bold uppercase tracking-widest text-waldgruen/60 sm:text-xs">
            Petition
          </p>
          <p className="mt-1 font-body text-base font-bold leading-snug text-waldgruen-dark sm:text-lg">
            zeigt die Masse
          </p>
          <div
            className="mt-4 grid grid-cols-8 sm:flex-1 content-start gap-1.5 rounded-lg bg-creme p-3 sm:gap-2 sm:p-4"
            aria-hidden="true"
          >
            {Array.from({ length: SIGNATURES }, (_, i) => (
              <span
                key={i}
                className="aspect-square rounded-full bg-waldgruen/45"
              />
            ))}
          </div>
          <p className="mt-3 font-body text-sm leading-snug text-warmgrau/80">
            Tausende Unterschriften, eine Zahl, eine Übergabe.
          </p>
        </div>

        <div className="flex flex-col">
          <p className="font-typewriter text-[0.7rem] font-bold uppercase tracking-widest text-airmail-rot sm:text-xs">
            Briefe
          </p>
          <p className="mt-1 font-body text-base font-bold leading-snug text-waldgruen-dark sm:text-lg">
            zeigen die Menschen
          </p>
          <ul className="mt-4 flex flex-1 flex-col gap-2.5" aria-hidden="true">
            {LETTERS.map((letter) => (
              <li
                key={letter.text}
                className={`${letter.rotate} rounded-md border-l-4 border-airmail-rot/70 bg-creme px-3 py-2 font-handwriting text-base leading-snug text-warmgrau shadow-sm sm:text-lg`}
              >
                {letter.text}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-body text-sm leading-snug text-warmgrau/80">
            Jeder Brief aus einem Wahlkreis, mit eigener Geschichte.
          </p>
        </div>
      </div>

      <svg
        viewBox="0 0 400 56"
        className="mx-auto mt-2 block h-12 w-full text-waldgruen/50"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M100 4 C100 30 200 24 200 48 M300 4 C300 30 200 24 200 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mx-auto max-w-md rounded-lg bg-waldgruen px-5 py-4 text-center">
        <p className="font-typewriter text-[0.7rem] font-bold uppercase tracking-widest text-creme/75 sm:text-xs">
          Zusammen mehr Druck
        </p>
        <p className="mt-1 font-body text-base font-bold leading-snug text-creme sm:text-lg">
          Abgeordnete, Landesregierung, Ministerium
        </p>
      </div>

      <figcaption
        id="petition-brief-diagram-caption"
        className="mt-5 text-center font-body text-sm leading-relaxed text-warmgrau/75"
      >
        Die Petition sagt, wie viele es sind. Die Briefe sagen, wen es trifft.
        Beides landet bei denselben Entscheidungsträger:innen.
      </figcaption>
    </figure>
  );
}
