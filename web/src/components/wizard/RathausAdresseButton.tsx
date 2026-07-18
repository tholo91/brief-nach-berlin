// Google-Adresshilfe für den Kommune-Brief (LOCK-3). Die generische Anschrift
// ohne Straße ist nur Orientierung; der User prüft und ergänzt die vollständige
// Postanschrift selbst. Ein Klick öffnet die Google-Suche in neuem Tab.

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
  const isBezirksamt = recipientKind === "bezirksamt";
  const kindLabel = isBezirksamt ? "Bezirksamts" : "Rathauses";
  const searchLabel = isBezirksamt ? "Bezirksamt-Adresse finden" : "Rathaus-Adresse finden";
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${isBezirksamt ? "Bezirksamt" : "Rathaus"} Adresse ${plz} ${ortsname}`
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
        Die Anschrift im Brief ist nur eine Orientierung und ohne Straße möglicherweise
        nicht vollständig. Prüfe die genaue Adresse deines {kindLabel} und übernimm
        Straße und Hausnummer auf den Umschlag.
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
        {searchLabel}
      </a>
    </div>
  );
}
