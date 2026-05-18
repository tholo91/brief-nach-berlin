import Link from "next/link";
import Header from "@/components/Header";

export const metadata = {
  title: "Seite nicht gefunden | Brief nach Berlin",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-creme">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center">

          {/* Airmail envelope illustration */}
          <div className="relative inline-block mb-10">
            {/* Envelope body */}
            <div
              className="w-64 h-44 mx-auto rounded-md border-2 border-warmgrau/20 bg-white shadow-md relative overflow-hidden"
            >
              {/* Airmail corner stripes */}
              <div
                className="absolute inset-x-0 bottom-0 h-2"
                style={{
                  background: `repeating-linear-gradient(
                    -45deg,
                    var(--color-airmail-rot),
                    var(--color-airmail-rot) 5px,
                    var(--color-creme) 5px,
                    var(--color-creme) 8px,
                    var(--color-airmail-blau) 8px,
                    var(--color-airmail-blau) 13px,
                    var(--color-creme) 13px,
                    var(--color-creme) 16px
                  )`,
                }}
              />
              <div
                className="absolute inset-y-0 right-0 w-2"
                style={{
                  background: `repeating-linear-gradient(
                    -45deg,
                    var(--color-airmail-rot),
                    var(--color-airmail-rot) 5px,
                    var(--color-creme) 5px,
                    var(--color-creme) 8px,
                    var(--color-airmail-blau) 8px,
                    var(--color-airmail-blau) 13px,
                    var(--color-creme) 13px,
                    var(--color-creme) 16px
                  )`,
                }}
              />

              {/* Envelope flap (folded down) */}
              <div className="absolute inset-x-0 top-0">
                <svg
                  viewBox="0 0 256 80"
                  className="w-full"
                  preserveAspectRatio="none"
                >
                  <polygon
                    points="0,0 256,0 128,72"
                    fill="#F0EDE8"
                    stroke="rgba(61,61,61,0.15)"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* "404" stamp-style text */}
              <div className="absolute inset-0 flex items-center justify-center mt-8">
                <div className="border-2 border-airmail-rot/60 rounded px-3 py-1 rotate-[-8deg]">
                  <span
                    className="font-typewriter text-3xl font-bold text-airmail-rot/70 tracking-widest"
                  >
                    404
                  </span>
                </div>
              </div>
            </div>

            {/* "Unzustellbar" stamp beneath */}
            <div className="mt-3 flex justify-center">
              <span
                className="font-typewriter text-xs uppercase tracking-[0.3em] text-airmail-rot/60 border border-airmail-rot/40 px-3 py-1 rounded rotate-[-3deg] inline-block"
              >
                Unzustellbar
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-typewriter text-2xl md:text-3xl font-bold text-waldgruen-dark mb-4 leading-snug">
            Diese Seite ist verloren gegangen
          </h1>

          {/* Subtext */}
          <p className="font-body text-warmgrau/70 text-base md:text-lg leading-relaxed mb-8">
            Genau wie Briefe, die nie ankommen, gibt es diese Seite leider
            nicht. Vielleicht wurde die Adresse falsch geschrieben?
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/app"
              className="font-body text-sm font-semibold text-creme bg-waldgruen hover:bg-waldgruen-dark px-6 py-3 rounded-lg transition-colors"
            >
              Brief schreiben
            </Link>
            <Link
              href="/"
              className="font-body text-sm font-semibold text-waldgruen-dark border border-waldgruen/30 hover:border-waldgruen px-6 py-3 rounded-lg transition-colors"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
