import { describe, expect, it } from "vitest"

import {
  buildAddNoticeVoteRequest,
  validateNoticeCreateVoteForSubmit,
} from "./build-notice-create-vote-request"

import type { NoticeCreateVoteDraft } from "./notice-create-vote-draft"

const validDraft: NoticeCreateVoteDraft = {
  allowMultiple: true,
  endDate: new Date("2026-11-30T00:00:00"),
  endTime: "18:00",
  isAnonymous: true,
  options: ["A", "B"],
  startDate: new Date("2026-11-01T00:00:00"),
  startTime: "09:00",
  title: "MT 일정",
}

describe("validateNoticeCreateVoteForSubmit", () => {
  it("returns null for a complete draft", () => {
    expect(validateNoticeCreateVoteForSubmit(validDraft)).toBeNull()
  })

  it("requires start and end dates", () => {
    expect(
      validateNoticeCreateVoteForSubmit({
        ...validDraft,
        endDate: null,
      }),
    ).not.toBeNull()
  })
})

describe("buildAddNoticeVoteRequest", () => {
  it("maps draft to NOTICE-103 body", () => {
    const body = buildAddNoticeVoteRequest(validDraft)

    expect(body.title).toBe("MT 일정")
    expect(body.isAnonymous).toBe(true)
    expect(body.allowMultipleChoice).toBe(true)
    expect(body.options).toEqual(["A", "B"])
    expect(body.startsAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(body.endsAtExclusive).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
