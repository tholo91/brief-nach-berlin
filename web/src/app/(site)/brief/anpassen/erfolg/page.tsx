import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Angepasster Brief verschickt | Brief nach Berlin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BriefAnpassenErfolgPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20 overflow-x-clip">
      <div className="mx-auto w-full max-w-xl">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Verschickt
        </p>
        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-3">
          Angepasster Brief wurde dir zugeschickt.
        </h1>
        <p className="font-body text-sm text-warmgrau/70 leading-relaxed mb-8">
          Prüfe dein Postfach. Die Anschrift findest du weiterhin in deiner ursprünglichen
          Brief-Mail.
        </p>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-waldgruen px-6 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
