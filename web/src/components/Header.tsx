"use client";

export default function Header() {
  return (
    <>
      {/* Airmail stripe */}
      <div
        className="h-2 w-full"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            var(--color-airmail-rot),
            var(--color-airmail-rot) 8px,
            var(--color-creme) 8px,
            var(--color-creme) 12px,
            var(--color-airmail-blau) 12px,
            var(--color-airmail-blau) 20px,
            var(--color-creme) 20px,
            var(--color-creme) 24px
          )`,
        }}
      />
      <header className="sticky top-0 z-50 bg-creme/95 backdrop-blur-sm border-b border-warmgrau/8">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-typewriter text-base md:text-lg font-bold text-waldgruen-dark tracking-tight">
            Brief nach Berlin
          </span>
          <button
            onClick={() =>
              document
                .getElementById("cta")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="font-body text-sm font-semibold text-creme bg-waldgruen hover:bg-waldgruen-dark px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Mehr erfahren
          </button>
        </nav>
      </header>
    </>
  );
}
