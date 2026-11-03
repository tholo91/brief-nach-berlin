import type { TopicStarter } from "@/lib/topics/topicStarters";

export type TopicStarterGridProps = {
  topics: readonly Pick<TopicStarter, "id" | "title" | "eyebrow" | "emoji">[];
  selectedIds: readonly string[];
  limitReached: boolean;
  onToggle: (topicId: string) => void;
  /** "numbered": Kampagnen-Kacheln mit Nummer und Eyebrow. "scroll": zwei Chip-Reihen ohne Nummern, die zusammen horizontal scrollen. */
  variant: "numbered" | "scroll";
  /** Nur "scroll": alle Chips umbrechen statt in einer Reihe zu scrollen. */
  expanded?: boolean;
  id?: string;
};

export function TopicStarterGrid({ topics, selectedIds, limitReached, onToggle, variant, expanded = false, id }: TopicStarterGridProps) {
  const numbered = variant === "numbered";

  return (
    <div
      id={id}
      className={
        numbered
          ? "mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-3"
          : expanded
            ? "mt-2 grid grid-cols-2 gap-2 py-1 sm:mt-3 sm:grid-cols-3"
            : "chip-scroll-fade scrollbar-hide -mx-1 mt-2 grid auto-cols-max grid-flow-col grid-rows-2 snap-x gap-2 overflow-x-auto py-1 pl-1 pr-10 sm:mt-3"
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
              className={`group flex items-center gap-2 rounded-lg border font-body ${
                expanded ? "min-h-11 px-3 py-2 text-left leading-tight" : "h-11 shrink-0 snap-start whitespace-nowrap px-3.5"
              } text-[0.95rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 ${
                selected
                  ? "border-waldgruen bg-waldgruen text-creme"
                  : disabled
                    ? "cursor-not-allowed border-warmgrau/10 bg-creme/50 text-warmgrau opacity-40"
                    : "border-waldgruen/25 bg-surface text-warmgrau hover:border-waldgruen/50 hover:bg-waldgruen/5"
              }`}
            >
              <ChipMarker emoji={topic.emoji} selected={selected} interactive={!selected && !disabled} />
              <span>{topic.title}</span>
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
                  : "border-waldgruen/15 bg-surface text-warmgrau hover:-translate-y-0.5 hover:border-waldgruen/35 hover:shadow-sm motion-reduce:transform-none"
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

// Vorne steht das Emoji; bei Hover oder Fokus wird daraus das runde Plus, ausgewählt ein Haken.
function ChipMarker({ emoji, selected, interactive }: { emoji?: string; selected: boolean; interactive: boolean }) {
  const circle = "absolute inset-0 flex items-center justify-center rounded-full border text-xs font-bold transition-opacity duration-150";
  if (selected) {
    return (
      <span aria-hidden="true" className="relative h-5 w-5 shrink-0">
        <span className={`${circle} border-creme/40 bg-creme text-waldgruen`}>✓</span>
      </span>
    );
  }
  if (!emoji) {
    return (
      <span aria-hidden="true" className="relative h-5 w-5 shrink-0">
        <span className={`${circle} border-waldgruen/30 text-waldgruen/70`}>+</span>
      </span>
    );
  }
  const swap = interactive ? "group-hover:opacity-0 group-focus-visible:opacity-0" : "";
  const reveal = interactive ? "group-hover:opacity-100 group-focus-visible:opacity-100" : "";
  return (
    <span aria-hidden="true" className="relative h-5 w-5 shrink-0">
      <span className={`absolute inset-0 flex items-center justify-center text-base leading-none transition-opacity duration-150 ${swap}`}>{emoji}</span>
      <span className={`${circle} border-waldgruen/40 bg-surface text-waldgruen opacity-0 ${reveal}`}>+</span>
    </span>
  );
}
