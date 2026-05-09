import type { ExampleLetter, Recipient } from "@/lib/example-letters";

type Props = {
  letter: ExampleLetter;
  rotate?: "left" | "right" | "none";
  /** Override the recipient (used by landing teaser to rotate names). */
  recipientOverride?: Recipient;
  /** When true, body is clipped and a fade gradient is layered at the bottom. */
  truncated?: boolean;
  /** Compact paddings for teaser placement. */
  size?: "default" | "compact";
};

export default function LetterPaper({
  letter,
  rotate = "none",
  recipientOverride,
  truncated = false,
  size = "default",
}: Props) {
  const recipient = recipientOverride ?? letter.recipient;
  const fromCity = recipientOverride?.senderCity ?? letter.fromCity;

  const rotateClass =
    rotate === "left"
      ? "md:-rotate-[1deg]"
      : rotate === "right"
        ? "md:rotate-[1deg]"
        : "";

  const padding =
    size === "compact"
      ? "px-6 md:px-8 py-6 md:py-8"
      : "px-7 md:px-10 py-8 md:py-10";

  const bodyParagraphs = letter.body.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <article
      className={`relative bg-white rounded-sm shadow-[0_18px_40px_-20px_rgba(45,80,22,0.25),0_4px_12px_-4px_rgba(45,80,22,0.15)] ring-1 ring-warmgrau/10 ${rotateClass} transition-transform`}
    >
      {/* Airmail stripe top */}
      <div
        className="h-1 rounded-t-sm"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            var(--color-airmail-rot) 0px,
            var(--color-airmail-rot) 6px,
            #ffffff 6px,
            #ffffff 10px,
            var(--color-airmail-blau) 10px,
            var(--color-airmail-blau) 16px,
            #ffffff 16px,
            #ffffff 20px
          )`,
        }}
      />

      <div className={`relative ${padding}`}>
        {/* Recipient header */}
        <div
          className={`${size === "compact" ? "mb-4 pb-3" : "mb-7 pb-5"} border-b border-warmgrau/15`}
        >
          <p className="font-typewriter text-[11px] tracking-widest uppercase text-warmgrau/50 mb-1">
            Aus {fromCity} an
          </p>
          <p className="font-body text-base font-semibold text-waldgruen-dark transition-opacity duration-500">
            {recipient.name}
          </p>
          <p className="font-body text-sm text-warmgrau/70 transition-opacity duration-500">
            {recipient.role} · {recipient.party}
          </p>
        </div>

        {/* Letter body */}
        <div
          className={`font-body ${size === "compact" ? "text-[14px] leading-[1.75]" : "text-[15px] md:text-base leading-[1.85]"} text-warmgrau`}
        >
          <p className={size === "compact" ? "mb-3" : "mb-5"}>
            {recipient.salutation},
          </p>
          {bodyParagraphs.map((para, i) => (
            <p key={i} className={size === "compact" ? "mb-3" : "mb-5"}>
              {para}
            </p>
          ))}
          {!truncated && (
            <>
              <p className={size === "compact" ? "mb-2" : "mb-5"}>
                Mit freundlichen Grüßen,
              </p>
              <p
                className={`font-handwriting ${size === "compact" ? "text-xl" : "text-xl md:text-2xl"} text-waldgruen-dark leading-snug`}
              >
                [Ihr Name]
              </p>
            </>
          )}
        </div>

        {/* Truncation fade */}
        {truncated && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 rounded-b-sm"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 60%, #ffffff 100%)",
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </article>
  );
}
