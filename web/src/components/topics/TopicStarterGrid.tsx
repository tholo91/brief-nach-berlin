import type { TopicStarter } from "@/lib/topics/topicStarters";

type Props = {
  topics: readonly Pick<TopicStarter, "id" | "title" | "eyebrow">[];
  selectedIds: readonly string[];
  limitReached: boolean;
  onToggle: (topicId: string) => void;
  /** "numbered": Kampagnen-Kacheln mit Nummer und Eyebrow. "plain": ruhige Chips ohne Nummern. */
  variant: "numbered" | "plain";
};

export function TopicStarterGrid({ topics, selectedIds, limitReached, onToggle, variant }: Props) {
  const numbered = variant === "numbered";

  return (
    <div
      className={
        numbered
          ? "mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-3"
          : "mt-3 grid grid-cols-2 gap-2"
      }
    >
      {topics.map((topic, index) => {
        const selected = selectedIds.includes(topic.id);
        const disabled = limitReached && !selected;

        if (!numbered) {
          return (
            <button
              key={topic.id}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onToggle(topic.id)}
              className={`flex min-h-14 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left font-body text-[0.95rem] font-semibold leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 ${
                selected
                  ? "border-waldgruen bg-waldgruen text-creme"
                  : disabled
                    ? "cursor-not-allowed border-warmgrau/10 bg-creme/50 text-warmgrau opacity-40"
                    : "border-waldgruen/25 bg-white text-warmgrau hover:border-waldgruen/50 hover:bg-waldgruen/5"
              }`}
            >
              <span className="min-w-0 break-words">{topic.title}</span>
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  selected ? "border-creme/40 bg-creme text-waldgruen" : "border-waldgruen/30 text-waldgruen/70"
                }`}
              >
                {selected ? "✓" : "+"}
              </span>
            </button>
          );
        }

        return (
          <button
            key={topic.id}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onToggle(topic.id)}
            className={`group relative min-h-32 rounded-lg border p-3.5 pr-9 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 sm:p-4 sm:pr-10 ${
              selected
                ? "border-waldgruen bg-waldgruen text-creme shadow-[0_16px_36px_-24px_rgba(27,67,50,0.8)]"
                : disabled
                  ? "cursor-not-allowed border-warmgrau/10 bg-creme/50 text-warmgrau opacity-40"
                  : "border-waldgruen/15 bg-white text-warmgrau hover:-translate-y-0.5 hover:border-waldgruen/35 hover:shadow-sm motion-reduce:transform-none"
            }`}
          >
            <span className={`font-typewriter text-[10px] font-bold uppercase tracking-[0.14em] ${selected ? "text-creme/70" : "text-waldgruen/60"}`}>
              {String(index + 1).padStart(2, "0")} · {topic.eyebrow}
            </span>
            <span className="mt-3 block font-body text-base font-bold leading-tight sm:text-lg">{topic.title}</span>
            <span aria-hidden="true" className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold ${selected ? "border-creme/40 bg-creme text-waldgruen" : "border-waldgruen/20 text-waldgruen/70"}`}>
              {selected ? "✓" : "+"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
