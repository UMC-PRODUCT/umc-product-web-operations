import { describe, expect, it } from "vitest"

import { resolveNoticeVoteUiStatus } from "./resolve-notice-vote-ui-status"

describe("resolveNoticeVoteUiStatus", () => {
  it("returns closed for CLOSED status", () => {
    expect(
      resolveNoticeVoteUiStatus({
        endsAtExclusive: "2099-01-01T00:00:00.000Z",
        status: "CLOSED",
      }),
    ).toBe("closed")
  })

  it("returns closed when endsAtExclusive is in the past", () => {
    expect(
      resolveNoticeVoteUiStatus(
        {
          endsAtExclusive: "2020-01-01T00:00:00.000Z",
          status: "OPEN",
        },
        new Date("2026-01-01T00:00:00.000Z"),
      ),
    ).toBe("closed")
  })

  it("returns in_progress for open future vote", () => {
    expect(
      resolveNoticeVoteUiStatus(
        {
          endsAtExclusive: "2099-01-01T00:00:00.000Z",
          status: "OPEN",
        },
        new Date("2026-01-01T00:00:00.000Z"),
      ),
    ).toBe("in_progress")
  })
})
