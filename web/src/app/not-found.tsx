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

          {/* Open envelope illustration */}
          <div className="relative inline-block mb-10">
            {/*
              SVG viewBox: 0 0 280 260
              Envelope body:  y=100 → y=260, x=0 → x=280  (160px tall)
              Open flap:      base at y=100 (full width), apex at y=10 center  → folded back/up
              Internal folds (visible inside open envelope):
                bottom fold:  triangle pointing up from bottom corners to center
                left fold:    triangle from top-left to bottom-left to center
                right fold:   triangle from top-right to bottom-right to center
            */}
            <svg
              viewBox="0 0 280 260"
              className="w-64 drop-shadow-md"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Drop shadow filter */}
              <defs>
                <filter id="env-shadow" x="-5%" y="-5%" width="110%" height="115%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#3D3D3D" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* ── Envelope body (white rectangle) ── */}
              <rect
                x="0" y="100" width="280" height="160"
                rx="4" ry="4"
                fill="#FFFFFF"
                stroke="rgba(61,61,61,0.18)"
                strokeWidth="1.5"
                filter="url(#env-shadow)"
              />

              {/* ── Internal folds (seen inside open envelope) ── */}
              {/* Left side fold */}
              <polygon
                points="0,100 0,260 140,180"
                fill="#F5F1EB"
                stroke="rgba(61,61,61,0.10)"
                strokeWidth="1"
              />
              {/* Right side fold */}
              <polygon
                points="280,100 280,260 140,180"
                fill="#EDEAE3"
                stroke="rgba(61,61,61,0.10)"
                strokeWidth="1"
              />
              {/* Bottom fold */}
              <polygon
                points="0,260 280,260 140,180"
                fill="#E8E4DC"
                stroke="rgba(61,61,61,0.10)"
                strokeWidth="1"
              />

              {/* ── Open flap (folded up/back above envelope top) ── */}
              {/* Flap back face (slightly darker, simulates the underside) */}
              <polygon
                points="0,100 280,100 140,10"
                fill="#DDD8CE"
                stroke="rgba(61,61,61,0.18)"
                strokeWidth="1.5"
              />
              {/* Fold crease line at base of flap */}
              <line
                x1="0" y1="100" x2="280" y2="100"
                stroke="rgba(61,61,61,0.20)"
                strokeWidth="1.5"
              />

              {/* ── 404 stamp inside envelope ── */}
              <g transform="translate(140,188) rotate(-8)">
                <rect
                  x="-44" y="-20" width="88" height="40"
                  rx="3"
                  fill="none"
                  stroke="rgba(180,40,40,0.55)"
                  strokeWidth="2"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Courier New', Courier, monospace"
                  fontSize="26"
                  fontWeight="bold"
                  fill="rgba(180,40,40,0.65)"
                  letterSpacing="4"
                >
                  404
                </text>
              </g>
            </svg>

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
