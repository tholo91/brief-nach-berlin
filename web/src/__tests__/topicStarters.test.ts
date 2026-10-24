import {
  appendText,
  parseTopicDraft,
  removeInsertedText,
  restoreTopicDraft,
  toggleTopicStarter,
  type TopicStarter,
  type TopicStarterState,
} from "@/lib/topics/topicStarters";
import { JUNG_MAX_TOPICS, JUNG_TOPICS } from "@/lib/schule/jungTopics";

const topics: TopicStarter[] = [
  { id: "a", title: "A", issueText: "Satz A. " },
  { id: "b", title: "B", issueText: "Satz B. " },
  { id: "c", title: "C", issueText: "Satz C. " },
];
const empty: TopicStarterState = { selectedIds: [], issueText: "", insertions: {} };

describe("appendText / removeInsertedText", () => {
  it("appends with a blank line and trims", () => {
    expect(appendText("", "X")).toBe("X");
    expect(appendText("Hallo  ", "X")).toBe("Hallo\n\nX");
  });
  it("removes the insertion and keeps the rest", () => {
    expect(removeInsertedText("Davor\n\nX\n\nDanach", "X")).toEqual({
      text: "Davor\n\nDanach",
      removed: true,
    });
    expect(removeInsertedText("nichts", "X")).toEqual({ text: "nichts", removed: false });
  });
});

describe("toggleTopicStarter", () => {
  it("adds topics up to the max and reports added-max", () => {
    const one = toggleTopicStarter(empty, topics, "a", 2);
    expect(one.outcome).toBe("added");
    const two = toggleTopicStarter(one.state, topics, "b", 2);
    expect(two.outcome).toBe("added-max");
    expect(two.state.issueText).toBe("Satz A.\n\nSatz B. ");
    expect(two.state.selectedIds).toEqual(["a", "b"]);
  });
  it("refuses a third topic", () => {
    const two = toggleTopicStarter(toggleTopicStarter(empty, topics, "a", 2).state, topics, "b", 2).state;
    const third = toggleTopicStarter(two, topics, "c", 2);
    expect(third.outcome).toBe("limit");
    expect(third.state).toBe(two);
  });
  it("removes inserted text on deselect", () => {
    const added = toggleTopicStarter(empty, topics, "a", 2).state;
    const removed = toggleTopicStarter(added, topics, "a", 2);
    expect(removed.outcome).toBe("removed-text");
    expect(removed.state).toEqual(empty);
  });
  it("keeps edited text when the insertion was changed", () => {
    const added = toggleTopicStarter(empty, topics, "a", 2).state;
    const edited = { ...added, issueText: "Ganz anders" };
    const removed = toggleTopicStarter(edited, topics, "a", 2);
    expect(removed.outcome).toBe("removed-kept");
    expect(removed.state.issueText).toBe("Ganz anders");
    expect(removed.state.selectedIds).toEqual([]);
  });
  it("ignores unknown topics", () => {
    expect(toggleTopicStarter(empty, topics, "zzz", 2).outcome).toBe("unknown");
  });
});

describe("draft parsing", () => {
  it("rejects garbage", () => {
    expect(parseTopicDraft(null)).toBeNull();
    expect(parseTopicDraft("{")).toBeNull();
    expect(parseTopicDraft('{"issueText":"x"}')).toBeNull();
  });
  it("restores only known ids, capped, with sliced text", () => {
    const draft = parseTopicDraft(
      JSON.stringify({
        selectedTopicIds: ["a", "x", "b", "c"],
        issueText: "abcdef",
        topicInsertions: { a: "Satz A. ", c: 5 },
      }),
    );
    expect(draft).not.toBeNull();
    const restored = restoreTopicDraft(draft!, topics, 2, 3);
    expect(restored.selectedIds).toEqual(["a", "b"]);
    expect(restored.insertions).toEqual({ a: "Satz A. " });
    expect(restored.issueText).toBe("abc");
  });
});

describe("JUNG_TOPICS", () => {
  it("has 8 unique topics and max 2", () => {
    expect(JUNG_TOPICS).toHaveLength(8);
    expect(new Set(JUNG_TOPICS.map((t) => t.id)).size).toBe(8);
    expect(JUNG_MAX_TOPICS).toBe(2);
  });
});
