import { describe, expect, it } from "vitest";
import { recordRecall } from "../src/utils/review";
import { learningDay, themeForDay } from "../src/utils/dates";
import type { RecallAttempt } from "../src/types/learning";

function attempt(overrides: Partial<RecallAttempt> = {}): RecallAttempt {
  return {
    id: "a",
    phraseId: "split-the-bill",
    at: "2026-11-09T10:00:00Z",
    hintLevel: 0,
    firstTry: true,
    mode: "written",
    assessment: {
      meaning: "correct",
      targetUsed: true,
      naturalness: "natural",
      feedback: "That fits.",
      nextHint: "",
    },
    ...overrides,
  };
}

describe("evidence-based review progress", () => {
  it("does not count hinted recall as independent recall", () => {
    const result = recordRecall(undefined, attempt({ hintLevel: 1 }));
    expect(result?.state).toBe("learning");
    expect(result?.recallDays).toEqual([]);
    expect(result?.dueAt).toBe("2026-11-09T10:10:00.000Z");
  });
  it("accepts another correct expression without claiming the target was recalled", () => {
    const answer = attempt();
    answer.assessment.targetUsed = false;
    expect(recordRecall(undefined, answer)?.state).toBe("learning");
  });
  it("counts one independent success today but does not declare mastery", () => {
    const result = recordRecall(undefined, attempt());
    expect(result?.stage).toBe(1);
    expect(result?.state).toBe("recalling");
    expect(result?.dueAt).toBe("2026-11-10T10:00:00.000Z");
    const repeated = recordRecall(
      result,
      attempt({ id: "b", at: "2026-11-09T11:00:00Z" }),
    );
    expect(repeated?.stage).toBe(1);
    expect(repeated?.dueAt).toBe(result?.dueAt);
  });
  it("ignores duplicate submissions and uncertain assessments", () => {
    const result = recordRecall(undefined, attempt());
    expect(recordRecall(result, attempt())).toBe(result);
    const uncertain = attempt({ id: "unknown" });
    uncertain.assessment.meaning = "uncertain";
    expect(recordRecall(result, uncertain)).toBe(result);
  });
  it("requires success on separated days before marking remembered and reopens failed words", () => {
    let result = recordRecall(undefined, attempt());
    result = recordRecall(
      result,
      attempt({ id: "b", at: "2026-11-10T10:00:00Z" }),
    );
    result = recordRecall(
      result,
      attempt({ id: "c", at: "2026-11-12T10:00:00Z" }),
    );
    expect(result?.state).toBe("recalling");
    result = recordRecall(
      result,
      attempt({ id: "d", at: "2026-11-17T10:00:00Z" }),
    );
    expect(result?.state).toBe("remembered");
    const retry = attempt({
      id: "e",
      at: "2026-11-18T10:00:00Z",
      firstTry: false,
    });
    result = recordRecall(result, retry);
    expect(result?.state).toBe("learning");
    expect(result?.stage).toBe(0);
  });
});

describe("Brisbane lesson dates", () => {
  it("changes day at midnight in Brisbane instead of UTC", () => {
    expect(learningDay("2026-11-09T13:59:59Z")).toBe("2026-11-09");
    expect(learningDay("2026-11-09T14:00:00Z")).toBe("2026-11-10");
    expect(themeForDay("2026-11-09")).toBe("small-talk");
    expect(themeForDay("2026-11-15")).toBe("slang");
  });
});
