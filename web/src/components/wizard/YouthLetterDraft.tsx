export function YouthLetterDraft({ letterText }: { letterText: string }) {
  return (
    <section aria-labelledby="youth-draft-heading" className="mt-6">
      <h2 id="youth-draft-heading" className="font-typewriter text-xl font-bold text-waldgruen-dark m-0">
        Dein Entwurf
      </h2>
      <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau">
        Schreib ihn von Hand ab und ergänze ein eigenes Erlebnis. Die Anschrift für den Umschlag steht in der Mail.
      </p>
      <div className="mt-3 overflow-hidden rounded-sm border border-warmgrau/15 bg-white shadow-[0_20px_50px_-30px_rgba(27,67,50,0.45)]">
        <div
          aria-hidden="true"
          className="h-2 w-full"
          style={{
            background:
              "repeating-linear-gradient(-45deg, #c1121f 0 10px, #faf8f5 10px 15px, #1d3557 15px 25px, #faf8f5 25px 30px)",
          }}
        />
        <p className="m-0 max-w-prose whitespace-pre-line p-5 text-left font-body text-[17px] leading-[1.75] text-warmgrau sm:p-7">
          {letterText}
        </p>
      </div>
    </section>
  );
}
