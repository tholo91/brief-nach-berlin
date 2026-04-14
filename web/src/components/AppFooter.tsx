import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="bg-creme mt-auto">
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

      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-typewriter text-sm text-warmgrau/40">
          Brief-nach-Berlin &copy; {new Date().getFullYear()}
        </span>

        <div className="flex gap-6">
          <Link
            href="/"
            className="font-body text-sm text-warmgrau/40 hover:text-warmgrau transition-colors duration-200"
          >
            Startseite
          </Link>
          <Link
            href="/impressum"
            className="font-body text-sm text-warmgrau/40 hover:text-warmgrau transition-colors duration-200"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="font-body text-sm text-warmgrau/40 hover:text-warmgrau transition-colors duration-200"
          >
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}
