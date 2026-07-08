// Google-Adresshilfe für den Kommune-Brief (LOCK-3): die generische
// Postanschrift ("Stadtverwaltung Köln, 50667 Köln") ist zustellbar, aber die
// exakte Straßenadresse ergänzt der User selbst im handschriftlichen Brief.
// Ein Klick öffnet die Google-Suche in neuem Tab.

interface RathausAdresseButtonProps {
  ortsname: string;
  plz: string;
  recipientKind: "stadtverwaltung" | "bezirksamt";
  className?: string;
}

export function RathausAdresseButton({
  ortsname,
  plz,
  recipientKind,
  className,
}: RathausAdresseButtonProps) {
  const kindLabel = recipientKind === "bezirksamt" ? "Bezirksamts" : "Rathauses";
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `Rathaus Adresse ${plz} ${ortsname}`
  )}`;
  return (
    <div
      role="note"
      className={[
        "rounded-xl border border-warmgrau/25 bg-creme/70 p-4",
        "flex flex-col gap-2.5 text-sm font-body",
        className ?? "",
      ].join(" ")}
    >
      <span className="text-warmgrau leading-relaxed">
        Die Anschrift im Brief erreicht die Verwaltung auch ohne Straße zuverlässig.
        Noch besser: ergänze die genaue Adresse deines {kindLabel} (Straße + Hausnummer)
        selbst auf dem Umschlag.
      </span>
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg bg-waldgruen px-4 py-2 font-semibold text-creme hover:bg-waldgruen-dark transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Rathaus-Adresse finden
      </a>
    </div>
  );
}
