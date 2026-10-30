import { describe, expect, it } from "vitest"

import {
  applyPollVote,
  applyPollVoteCancel,
  getLeadingOptionIds,
  getVoteOptionProgressPercent,
  recomputePollPercents,
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

describe("applyPollVote", () => {
  it("keeps numeric vote counts when API sent string zeros", () => {
    const options: NoticePollOption[] = [
      {
        id: "1",
        label: "A",
        progressPercent: 0,
        voteCount: "0" as unknown as number,
      },
      {
        id: "2",
        label: "B",
        progressPercent: 0,
        voteCount: "0" as unknown as number,
      },
    ]

    const result = applyPollVote({
      isFirstVote: true,
      newSelection: ["2"],
      options,
      participantCount: "0" as unknown as number,
      previousSelection: [],
    })

    expect(result.participantCount).toBe(1)
    expect(result.options.find((option) => option.id === "2")?.voteCount).toBe(
      1,
    )
    expect(getLeadingOptionIds(result.options).has("2")).toBe(true)
  })
})

describe("getVoteOptionProgressPercent", () => {
  it("scales bar value by share of total votes", () => {
    const options: NoticePollOption[] = recomputePollPercents([
      { id: "1", label: "1", progressPercent: 0, voteCount: 2 },
      { id: "2", label: "2", progressPercent: 0, voteCount: 0 },
      { id: "3", label: "3", progressPercent: 0, voteCount: 1 },
      { id: "4", label: "4", progressPercent: 0, voteCount: 1 },
    ])

    expect(getVoteOptionProgressPercent(options[0]!, options)).toBe(50)
    expect(getVoteOptionProgressPercent(options[2]!, options)).toBe(25)
    expect(getVoteOptionProgressPercent(options[3]!, options)).toBe(25)
    expect(options[0]?.progressPercent).toBe(50)
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
