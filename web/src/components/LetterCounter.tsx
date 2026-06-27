const COUNTER_DISPLAY_THRESHOLD = 20;

export default function LetterCounter() {
  const count = 0; // Phase 2: wire to real counter

  // Hide the section until we have meaningful numbers — a "0" (or very low number)
  // reads as anti-social-proof on the landing page.
  if (count < COUNTER_DISPLAY_THRESHOLD) return null;

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-16 h-px bg-waldgruen/20 mb-10" />
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          Impact
        </p>
        <div className="font-typewriter text-6xl md:text-7xl font-bold text-waldgruen leading-none mb-3">
          {count}
        </div>
        <p className="font-body text-base text-warmgrau/70">
          Briefe generiert &amp; versendet
        </p>
        <div className="w-16 h-px bg-waldgruen/20 mt-10" />
      </div>
    </section>
  );
}
