import Link from "next/link";

export const metadata = {
  title: "Brief Generator | Brief nach Berlin",
};

export default function AppPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20 flex flex-col items-center justify-center">
      <div className="max-w-2xl text-center">
        {/* Envelope icon */}
        <div className="inline-block mb-6">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="text-waldgruen rotate-[-5deg]"
          >
            <rect x="4" y="10" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M4 13 L24 28 L44 13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark mb-4 tracking-tight">
          Brief nach Berlin
        </h1>

        <p className="font-handwriting text-2xl text-waldgruen mb-8 leading-relaxed">
          Dein Brief-Generator wird vorbereitet.
        </p>

        <p className="font-body text-base md:text-lg text-warmgrau leading-relaxed mb-10 max-w-md mx-auto">
          Wir arbeiten daran, dass du dein Anliegen in drei Minuten
          in einen wirkungsvollen Brief an die richtige Person
          verwandeln kannst.
        </p>

        <Link
          href="/"
          className="inline-block border border-waldgruen/30 text-waldgruen-dark font-body font-semibold text-base px-8 py-4 rounded-xl hover:bg-waldgruen/8 transition-colors"
        >
          &larr; Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
