import type { Metadata } from "next";
import { APP_URL } from "@/lib/config";
import { VariantForm } from "./VariantForm";

export const metadata: Metadata = {
  title: "Brief anpassen | Brief nach Berlin",
  description:
    "Formuliere einen bestehenden Briefentwurf neu, ohne einen neuen Brief zu erzeugen.",
  alternates: {
    canonical: `${APP_URL}/brief/anpassen`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function BriefAnpassenPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-16 overflow-x-clip">
      <div className="mx-auto w-full max-w-xl">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/60 mb-3">
          Brief anpassen
        </p>
        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-3">
          Nicht ganz dein Ton?
        </h1>
        <p className="font-body text-sm text-warmgrau/70 leading-relaxed mb-8">
          Der Brief wird aus Datenschutzgründen nicht gespeichert. Kopiere deshalb
          den Entwurf aus deiner E-Mail hier hinein, wähle eine Tonalität und wir
          schicken dir eine umformulierte Variante.
        </p>

        <VariantForm />
      </div>
    </div>
  );
}
