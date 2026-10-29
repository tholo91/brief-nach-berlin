import { toggleSpecialCampaignTopic } from "@/lib/campaigns/specialCampaigns";

export type TopicStarter = {
  id: string;
  title: string;
  eyebrow?: string;
  issueText: string;
};

export type TopicStarterState = {
  selectedIds: string[];
  issueText: string;
  insertions: Record<string, string>;
};

export type TopicToggleOutcome =
  | "limit"
  | "added"
  | "added-max"
  | "removed-text"
  | "removed-kept"
  | "unknown";

export type TopicDraft = {
  selectedTopicIds: string[];
  issueText: string;
  topicInsertions: Record<string, string>;
};

export function appendText(current: string, addition: string) {
  const trimmedCurrent = current.trim();
  return trimmedCurrent ? `${trimmedCurrent}\n\n${addition}` : addition;
}

export function removeInsertedText(current: string, fullInsertion: string) {
  // appendText trims the end of earlier text, so a starter ending in a space may now be stored without it.
  const insertion = current.includes(fullInsertion) ? fullInsertion : fullInsertion.trimEnd();
  const start = current.indexOf(insertion);
  if (start === -1) return { text: current, removed: false };

  const before = current.slice(0, start).trimEnd();
  const after = current.slice(start + insertion.length).trimStart();
  return {
    text: [before, after].filter(Boolean).join("\n\n"),
    removed: true,
  };
}

export function toggleTopicStarter(
  state: TopicStarterState,
  topics: readonly TopicStarter[],
  topicId: string,
  maxSelected: number,
): { state: TopicStarterState; outcome: TopicToggleOutcome } {
  const wasSelected = state.selectedIds.includes(topicId);
  const nextIds = toggleSpecialCampaignTopic(state.selectedIds, topicId, maxSelected);

  if (!wasSelected && nextIds.length === state.selectedIds.length) {
    return { state, outcome: "limit" };
  }

  if (wasSelected) {
    const insertion = state.insertions[topicId];
    const result = insertion ? removeInsertedText(state.issueText, insertion) : null;
    const insertions = { ...state.insertions };
    delete insertions[topicId];
    return {
      state: {
        selectedIds: nextIds,
        issueText: result?.removed ? result.text : state.issueText,
        insertions,
      },
      outcome: result?.removed ? "removed-text" : "removed-kept",
    };
  }

  const topic = topics.find((candidate) => candidate.id === topicId);
  if (!topic) return { state, outcome: "unknown" };

  return {
    state: {
      selectedIds: nextIds,
      issueText: appendText(state.issueText, topic.issueText),
      insertions: { ...state.insertions, [topicId]: topic.issueText },
    },
    outcome: nextIds.length === maxSelected ? "added-max" : "added",
  };
}

export function parseTopicDraft(raw: string | null): TopicDraft | null {
  try {
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Partial<TopicDraft>;
    if (!Array.isArray(candidate.selectedTopicIds)) return null;

    return {
      selectedTopicIds: candidate.selectedTopicIds.filter(
        (id): id is string => typeof id === "string",
      ),
      issueText: typeof candidate.issueText === "string" ? candidate.issueText : "",
      topicInsertions:
        candidate.topicInsertions && typeof candidate.topicInsertions === "object"
          ? candidate.topicInsertions
          : {},
    };
  } catch {
    return null;
  }
}

export function restoreTopicDraft(
  draft: TopicDraft,
  topics: readonly TopicStarter[],
  maxSelected: number,
  maxIssueLength: number,
): TopicStarterState {
  const selectedIds = draft.selectedTopicIds
    .filter((id) => topics.some((topic) => topic.id === id))
    .slice(0, maxSelected);
  const insertions: Record<string, string> = {};
  for (const id of selectedIds) {
    const insertion = draft.topicInsertions[id];
    if (typeof insertion === "string") insertions[id] = insertion;
  }
  return { selectedIds, insertions, issueText: draft.issueText.slice(0, maxIssueLength) };
}
