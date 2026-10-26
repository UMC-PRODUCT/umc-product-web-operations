import { describe, expect, it } from "vitest"

import {
  applyPollVoteCancel,
  shouldCancelNoticeVoteOnLeave,
} from "./notice-poll-vote"

import type { NoticePollOption } from "./notice-detail.types"

const baseOptions: NoticePollOption[] = [
  {
    id: "1",
    isSelected: true,
    label: "A",
    progressPercent: 100,
    voteCount: 2,
  },
  {
    id: "2",
    isSelected: false,
    label: "B",
    progressPercent: 0,
    voteCount: 0,
  },
]

describe("shouldCancelNoticeVoteOnLeave", () => {
  it("cancels when revoting with an empty draft after a prior vote", () => {
    expect(
      shouldCancelNoticeVoteOnLeave({
        draftSelection: [],
        hasEverVoted: true,
        isRevoting: true,
        viewerSelection: ["1"],
      }),
    ).toBe(true)
  })

  it("does not cancel when the draft still has selections", () => {
    expect(
      shouldCancelNoticeVoteOnLeave({
        draftSelection: ["2"],
        hasEverVoted: true,
        isRevoting: true,
        viewerSelection: ["1"],
      }),
    ).toBe(false)
  })
})

describe("applyPollVoteCancel", () => {
  it("clears selection and decrements participant count", () => {
    const result = applyPollVoteCancel({
      options: baseOptions,
      participantCount: 2,
      previousSelection: ["1"],
    })

    expect(result.viewerSelection).toEqual([])
    expect(result.participantCount).toBe(1)
    expect(result.options.find((option) => option.id === "1")?.voteCount).toBe(
      1,
    )
  })
})
