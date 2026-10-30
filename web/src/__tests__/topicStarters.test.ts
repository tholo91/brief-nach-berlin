import {
  appendText,
  parseTopicDraft,
  releaseEditedTopics,
  removeInsertedText,
  restoreTopicDraft,
  toggleTopicStarter,
  type TopicStarter,
  type TopicStarterState,
} from "@/lib/topics/topicStarters";
import { JUNG_MAX_TOPICS, JUNG_OPEN_TOPICS, JUNG_TOPICS } from "@/lib/schule/jungTopics";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TopicStarterGrid, type TopicStarterGridProps } from "@/components/topics/TopicStarterGrid";
import { ExpandableTopicChips } from "@/components/topics/ExpandableTopicChips";

const gridTopics = [
  { id: "a", title: "Thema A", eyebrow: "Eins" },
  { id: "b", title: "Thema B", eyebrow: "Zwei" },
  { id: "c", title: "Thema C", eyebrow: "Drei" },
];

function renderGrid(variant: "numbered" | "scroll", extra: Partial<TopicStarterGridProps> = {}) {
  return renderToStaticMarkup(
    createElement(TopicStarterGrid, {
      topics: gridTopics,
      selectedIds: ["a"],
      limitReached: true,
      onToggle: () => {},
      variant,
      ...extra,
    }),
  );
}

describe("TopicStarterGrid scroll", () => {
  it("renders one horizontally scrollable chip row", () => {
    const markup = renderGrid("scroll");

    expect(markup).toContain("overflow-x-auto");
    expect(markup).toContain("snap-x");
    expect(markup).toContain("chip-scroll-fade");
    expect(markup).toContain("whitespace-nowrap");
    expect(markup).toContain('aria-pressed="true"');
    expect(markup.match(/disabled=""/g)).toHaveLength(2);
    expect(markup).not.toContain("grid-cols-2");
  });

  it("wraps all chips when expanded, without scroll affordances", () => {
    const markup = renderGrid("scroll", { expanded: true });

    expect(markup).toContain("grid-cols-2");
    for (const cls of ["overflow-x-auto", "chip-scroll-fade", "snap-x", "pr-10"]) {
      expect(markup).not.toContain(cls);
    }
    expect(markup).toContain('aria-pressed="true"');
    expect(markup.match(/disabled=""/g)).toHaveLength(2);
  });

  it("puts the id on the root", () => {
    expect(renderGrid("scroll", { id: "test-chips" })).toContain('id="test-chips"');
  });
});

describe("ExpandableTopicChips", () => {
  it("renders heading, collapsed toggle, hint and grid in order", () => {
    const markup = renderToStaticMarkup(
      createElement(ExpandableTopicChips, {
        topics: gridTopics,
        selectedIds: [],
        limitReached: false,
        onToggle: () => {},
        heading: createElement("h2", null, "Meine Überschrift"),
        hint: createElement("p", null, "Mein Hinweis"),
        gridId: "test-chips",
      }),
    );

    expect(markup).toContain("Alle Themen");
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-controls="test-chips"');
    expect(markup).toContain('id="test-chips"');
    expect(markup).toContain("overflow-x-auto");
    const heading = markup.indexOf("Meine Überschrift");
    const hint = markup.indexOf("Mein Hinweis");
    const grid = markup.indexOf('id="test-chips"');
    expect(heading).toBeGreaterThan(-1);
    expect(hint).toBeGreaterThan(heading);
    expect(grid).toBeGreaterThan(hint);
  });
});

describe("TopicStarterGrid numbered", () => {
  it("renders the same markup as before the scroll variant (SchreibMerz gate)", () => {
    expect(renderGrid("numbered")).toMatchSnapshot();
  });
});

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
  it("removes the first of two starters even though its trailing space was trimmed", () => {
    const jung = { selectedIds: [], issueText: "", insertions: {} };
    const one = toggleTopicStarter(jung, JUNG_TOPICS, "klima", JUNG_MAX_TOPICS).state;
    const two = toggleTopicStarter(one, JUNG_TOPICS, "wehrdienst", JUNG_MAX_TOPICS).state;
    const removed = toggleTopicStarter(two, JUNG_TOPICS, "klima", JUNG_MAX_TOPICS);
    expect(removed.outcome).toBe("removed-text");
    expect(removed.state.issueText).toBe(two.insertions.wehrdienst);
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
  it("has an opinionated variant with the same ids and new texts for every topic", () => {
    expect(JUNG_OPEN_TOPICS.map((t) => t.id)).toEqual(JUNG_TOPICS.map((t) => t.id));
    JUNG_OPEN_TOPICS.forEach((topic, i) => {
      expect(topic.issueText).not.toBe(JUNG_TOPICS[i].issueText);
      expect(topic.issueText).not.toMatch(/[–—]/);
    });
  });
  it("ends every opinionated text as a finished sentence", () => {
    JUNG_OPEN_TOPICS.forEach((topic) => {
      expect(topic.issueText).toMatch(/[.!?]$/);
    });
  });
});

describe("releaseEditedTopics", () => {
  const insertion = "Mein Bus fährt nur einmal pro Stunde und ich warte oft lange.";
  const state = { selectedIds: ["bus"], insertions: { bus: insertion }, issueText: insertion };

  it("keeps the topic while most of the starter is still there", () => {
    expect(releaseEditedTopics({ ...state, issueText: `${insertion} Bitte ändern Sie das.` }).selectedIds).toEqual(["bus"]);
    expect(releaseEditedTopics({ ...state, issueText: "Mein Bus fährt nur einmal pro Stunde." }).selectedIds).toEqual(["bus"]);
  });

  it("releases the topic once the starter is mostly gone", () => {
    const result = releaseEditedTopics({ ...state, issueText: "Die Toiletten an meiner Schule sind kaputt." });
    expect(result.selectedIds).toEqual([]);
    expect(result.insertions).toEqual({});
  });

  it("releases everything when the field is empty", () => {
    expect(releaseEditedTopics({ ...state, issueText: "  " }).selectedIds).toEqual([]);
  });
});
