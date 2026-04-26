import Link from "next/link";
import { FOUNDER_FEEDBACK_URL } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-creme">
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

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-typewriter text-sm text-warmgrau/40">
          Brief-nach-Berlin &copy; {new Date().getFullYear()}
        </span>

        <div className="flex gap-6">
          <a
            href={FOUNDER_FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm text-warmgrau/40 hover:text-warmgrau transition-colors duration-200"
          >
            Feedback
          </a>
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
