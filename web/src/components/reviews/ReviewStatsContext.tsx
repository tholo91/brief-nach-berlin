"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { RatingSummary, ReviewStats } from "@/lib/reviews/types";

type ReviewGroup = "short" | "submitted";

export function getReviewGroupStats(stats: ReviewStats, group: ReviewGroup) {
  return stats[group];
}

type ReviewStatsContextValue = {
  selectedGroup: ReviewGroup;
  selectedStats: RatingSummary;
  selectGroup: (group: ReviewGroup) => void;
};

const ReviewStatsContext = createContext<ReviewStatsContextValue | null>(null);

export function ReviewStatsProvider({
  stats,
  children,
}: {
  stats: ReviewStats;
  children: ReactNode;
}) {
  const [selectedGroup, selectGroup] = useState<ReviewGroup>("submitted");
  const value = {
    selectedGroup,
    selectedStats: getReviewGroupStats(stats, selectedGroup),
    selectGroup,
  };

  return (
    <ReviewStatsContext.Provider value={value}>
      {children}
    </ReviewStatsContext.Provider>
  );
}

export function useSelectedReviewStats() {
  const context = useContext(ReviewStatsContext);
  if (!context) {
    throw new Error("Review stats must be rendered inside ReviewStatsProvider");
  }
  return context;
}

export function ReviewStatsToggle() {
  const { selectedGroup, selectGroup } = useSelectedReviewStats();
  const options: { key: ReviewGroup; label: string }[] = [
    { key: "submitted", label: "Formular abgeschickt" },
    { key: "short", label: "Kurzbewertung · nur Sterne" },
  ];

  return (
    <fieldset className="mb-3">
      <legend className="mb-2 font-typewriter text-[11px] font-bold uppercase tracking-[0.12em] text-warmgrau/60">
        Sterne-Auswertung nach Feedback-Tiefe
      </legend>
      <div className="inline-flex max-w-full flex-wrap rounded-lg border border-waldgruen/15 bg-white/60 p-1">
        {options.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={selectedGroup === key}
            onClick={() => selectGroup(key)}
            className={`rounded-md px-3 py-2 text-left font-typewriter text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen-dark focus-visible:ring-offset-2 ${
              selectedGroup === key
                ? "bg-waldgruen-dark text-creme"
                : "text-warmgrau hover:bg-waldgruen/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
