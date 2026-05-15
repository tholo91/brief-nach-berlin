import { CONTACT } from "@/lib/contact";

const features = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-waldgruen">
        <circle cx="18" cy="13" r="5" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <path d="M6 30c0-6 5.4-10 12-10s12 4 12 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M26 6l2 2-2 2m2-2H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Richtiges politisches Level",
    title: "Kommunal, Landes-, Bundes- oder Europapolitik",
    description:
      "Nicht jedes Anliegen gehört nach Berlin. Wir möchten automatisch erkennen, welches politische Level zuständig ist, damit dein Brief dort landet, wo er wirklich etwas bewirken kann.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-waldgruen">
        <rect x="6" y="5" width="24" height="26" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" />
        <line x1="11" y1="12" x2="25" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="11" y1="17" x2="25" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="11" y1="22" x2="19" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="27" cy="27" r="5" fill="white" stroke="currentColor" strokeWidth="1.5" />
        <path d="M25 27l1.5 1.5L29 25.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Stärkere Argumente",
    title: "Persönlicher Kontext macht den Unterschied",
    description:
      "Ein Brief von einer Lehrerin über Bildung wirkt anders als ein anonymes Schreiben. Wir möchten dir erlauben, deinen Hintergrund einzubringen, damit dein Anliegen noch überzeugender formuliert wird.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-waldgruen">
        <path d="M18 4l3.6 7.3 8 1.2-5.8 5.6 1.4 8L18 22.3 10.8 26l1.4-8L6.4 12.5l8-1.2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M12 30h12M15 33h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    label: "Mitgestalten",
    title: "Dein Feedback formt neue Briefe",
    description:
      "Wir validieren gerade. Jede Rückmeldung, jede Idee, jeder Hinweis hilft uns, Brief nach Berlin zu dem zu machen, was es sein kann. Demokratie lebt vom Mitmachen, und das gilt auch hier.",
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-20 md:py-28 px-6 bg-waldgruen-dark/[0.03]">
      <div className="max-w-5xl mx-auto">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Wo wir hinwollen
        </p>
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-4 max-w-xl">
          Brief nach Berlin wird noch smarter
        </h2>
        <p className="font-body text-base md:text-lg text-warmgrau/80 leading-relaxed mb-14 max-w-2xl">
          Wir bauen gerade und lernen mit jedem Brief. Hier ist, worauf wir uns als nächstes konzentrieren:
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-14">
          {features.map((f) => (
            <div
              key={f.label}
              className="bg-white rounded-xl border border-waldgruen/10 p-7 flex flex-col gap-4"
            >
              <div>{f.icon}</div>
              <div>
                <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-2">
                  {f.label}
                </p>
                <h3 className="font-body text-lg font-bold text-waldgruen-dark leading-snug mb-3">
                  {f.title}
                </h3>
                <p className="font-body text-sm text-warmgrau/80 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-waldgruen/10 pt-10 flex flex-col md:flex-row md:items-center gap-6">
          <p className="font-body text-base text-warmgrau/80 leading-relaxed flex-1">
            Hast du Ideen, was fehlt? Schreib mir direkt. Je mehr Menschen mitmachen und mitdenken, desto besser wird das hier.
          </p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-block shrink-0 font-body text-sm font-bold text-waldgruen border-2 border-waldgruen rounded-lg px-6 py-3 hover:bg-waldgruen hover:text-white transition-colors"
          >
            Idee mitteilen
          </a>
        </div>
      </div>
    </section>
  );
}
