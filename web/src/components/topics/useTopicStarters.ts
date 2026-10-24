"use client";

import { useEffect, useState } from "react";
import {
  parseTopicDraft,
  restoreTopicDraft,
  toggleTopicStarter,
  type TopicDraft,
  type TopicStarter,
  type TopicToggleOutcome,
} from "@/lib/topics/topicStarters";

type Options = {
  draftKey: string;
  topics: readonly TopicStarter[];
  maxTopics: number;
  maxIssueLength: number;
  messages: Record<Exclude<TopicToggleOutcome, "unknown">, string>;
};

export function useTopicStarters({ draftKey, topics, maxTopics, maxIssueLength, messages }: Options) {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [issueText, setIssueText] = useState("");
  const [topicInsertions, setTopicInsertions] = useState<Record<string, string>>({});
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(draftKey);
    } catch {
      // Ohne sessionStorage startet der Flow leer.
    }
    const saved = parseTopicDraft(raw);
    const frame = requestAnimationFrame(() => {
      if (saved) {
        const restored = restoreTopicDraft(saved, topics, maxTopics, maxIssueLength);
        setSelectedTopicIds(restored.selectedIds);
        setTopicInsertions(restored.insertions);
        setIssueText(restored.issueText);
      }
      setDraftHydrated(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [draftKey, topics, maxTopics, maxIssueLength]);

  useEffect(() => {
    if (!draftHydrated) return;
    try {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({ selectedTopicIds, issueText, topicInsertions } satisfies TopicDraft),
      );
    } catch {
      // Der Entwurf bleibt privat im Tab; ohne sessionStorage funktioniert der Flow weiter.
    }
  }, [draftKey, draftHydrated, issueText, selectedTopicIds, topicInsertions]);

  function toggleTopic(topicId: string) {
    const { state, outcome } = toggleTopicStarter(
      { selectedIds: selectedTopicIds, issueText, insertions: topicInsertions },
      topics,
      topicId,
      maxTopics,
    );
    if (outcome === "unknown") return;
    setStatusMessage(messages[outcome]);
    if (outcome === "limit") return;
    setSelectedTopicIds(state.selectedIds);
    setIssueText(state.issueText);
    setTopicInsertions(state.insertions);
  }

  return {
    selectedTopicIds,
    issueText,
    setIssueText,
    statusMessage,
    setStatusMessage,
    toggleTopic,
    selectionLimitReached: selectedTopicIds.length >= maxTopics,
  };
}
