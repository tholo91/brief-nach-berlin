type Fill = "full" | "partial" | "none";

const AGES = [14, 15, 16, 17, 18];

const rows: { label: string; text: string; fills: Fill[]; highlight?: boolean }[] = [
  {
    label: "Brief schreiben",
    text: "in jedem Alter, also auch heute",
    fills: ["full", "full", "full", "full", "full"],
    highlight: true,
  },
  {
    label: "Kommunalwahl",
    text: "ab 16 in vielen Ländern, sonst ab 18",
    fills: ["none", "none", "partial", "partial", "full"],
  },
  {
    label: "Landtagswahl",
    text: "ab 16 in 6 Ländern, sonst ab 18",
    fills: ["none", "none", "partial", "partial", "full"],
  },
  {
    label: "Europawahl",
    text: "ab 16",
    fills: ["none", "none", "full", "full", "full"],
  },
  {
    label: "Bundestagswahl",
    text: "ab 18",
    fills: ["none", "none", "none", "none", "full"],
  },
];

function cellClass(fill: Fill, highlight?: boolean) {
  if (highlight) return "bg-bernstein";
  if (fill === "full") return "bg-waldgruen";
  if (fill === "partial") return "border-2 border-dashed border-waldgruen bg-waldgruen/10";
  return "bg-warmgrau/10";
}

export function WahlalterLeiste() {
  return (
    <figure className="my-8">
      <div className="rounded-xl border border-waldgruen/20 bg-creme px-4 py-5 sm:px-6">
        <div className="mb-3 grid grid-cols-5 gap-1 text-center font-typewriter text-xs font-bold text-waldgruen-dark" aria-hidden="true">
          {AGES.map((age) => (
            <span key={age}>{age}</span>
          ))}
        </div>
        <ul className="space-y-5">
          {rows.map((row) => (
            <li key={row.label}>
              <p className="mb-1.5 font-body text-base leading-snug text-warmgrau">
                <strong className={row.highlight ? "font-bold text-waldgruen-dark" : "font-semibold text-waldgruen-dark"}>
                  {row.label}
                </strong>{" "}
                <span>{row.text}</span>
              </p>
              <div className="grid grid-cols-5 gap-1" aria-hidden="true">
                {row.fills.map((fill, i) => (
                  <span key={AGES[i]} className={`h-6 rounded-sm ${cellClass(fill, row.highlight && fill === "full")}`} />
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 font-body text-sm leading-relaxed text-warmgrau/80">
          Oben steht dein Alter in Jahren. Ausgefüllt heißt: überall möglich. Gestrichelt heißt: nur in manchen Ländern. Grau heißt: noch nicht.
        </p>
      </div>
      <figcaption className="mt-2 font-body text-sm text-warmgrau/70">
        Wahlalter in Deutschland, Stand Oktober 2026. In NRW gilt 16 für die Landtagswahl ab 2027.
      </figcaption>
    </figure>
  );
}
