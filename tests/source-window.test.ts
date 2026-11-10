import { describe, expect, it } from "vitest";
import {
  inspectSourceWindow,
  type SourceCheckpoint,
} from "../server/source-window";

const checkpoint: SourceCheckpoint = {
  version: 1,
  threadId: "personal-chat",
  publishedTurnId: "previous",
  publishedRevision: 4,
};

function snapshot(ids: string[]) {
  return {
    thread: { id: "personal-chat" },
    page: { order: "newest_first", hasMore: false, nextCursor: null },
    turns: ids.map((id) => ({ id, status: "completed" })),
  };
}

describe("conversation source continuity", () => {
  it("requires a reviewed baseline rather than treating the latest preview as full history", () => {
    expect(inspectSourceWindow(snapshot(["latest"]), null).status).toBe(
      "needs-baseline",
    );
  });

  it("returns new turns oldest first while retaining the published checkpoint", () => {
    const result = inspectSourceWindow(
      snapshot(["newest", "middle", "previous", "older"]),
      checkpoint,
    );
    expect(result.status).toBe("ready");
    expect(result.newTurnIds).toEqual(["middle", "newest"]);
    expect(checkpoint.publishedTurnId).toBe("previous");
  });

  it("recognizes an unchanged window without importing old turns again", () => {
    expect(
      inspectSourceWindow(snapshot(["previous", "older"]), checkpoint),
    ).toMatchObject({ status: "unchanged", newTurnIds: [] });
  });

  it("reports a missing overlap even when the bounded preview claims there is no more history", () => {
    for (const ids of [["fifth", "fourth", "third", "second", "first"], []]) {
      expect(inspectSourceWindow(snapshot(ids), checkpoint)).toMatchObject({
        status: "gap",
        newTurnIds: [],
      });
    }
  });

  it("requests an older page when a recovery cursor is available", () => {
    const input = snapshot(["newest"]);
    const result = inspectSourceWindow(
      {
        ...input,
        page: { ...input.page, hasMore: true, nextCursor: "older-page" },
      },
      checkpoint,
    );
    expect(result).toMatchObject({
      status: "needs-history",
      nextCursor: "older-page",
      newTurnIds: [],
    });
  });

  it("waits for an unfinished turn without advancing past it", () => {
    const input = snapshot(["newest", "previous"]);
    input.turns[0].status = "in_progress";
    expect(inspectSourceWindow(input, checkpoint)).toMatchObject({
      status: "waiting",
      newTurnIds: [],
    });
  });

  it("rejects a mismatched conversation or duplicate source ids", () => {
    expect(() =>
      inspectSourceWindow(
        { ...snapshot(["previous"]), thread: { id: "another-chat" } },
        checkpoint,
      ),
    ).toThrow("different conversation");
    expect(() =>
      inspectSourceWindow(snapshot(["previous", "previous"]), checkpoint),
    ).toThrow("duplicate turn ids");
  });
});
