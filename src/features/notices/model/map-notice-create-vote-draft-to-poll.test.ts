import { describe, expect, it } from "vitest"

import { mapNoticeCreateVoteDraftToPoll } from "./map-notice-create-vote-draft-to-poll"

import type { NoticeCreateVoteDraft } from "./notice-create-vote-draft"

describe("mapNoticeCreateVoteDraftToPoll", () => {
  it("maps draft fields to detail vote card poll shape", () => {
    const draft: NoticeCreateVoteDraft = {
      allowMultiple: true,
      endDate: new Date("2026-11-30T00:00:00"),
      endTime: "18:00",
      isAnonymous: true,
      options: ["항목 A", "항목 B"],
      startDate: new Date("2026-11-01T00:00:00"),
      startTime: "09:00",
      title: "기수 MT 날짜",
    }

    const poll = mapNoticeCreateVoteDraftToPoll(draft)

    expect(poll.title).toBe("기수 MT 날짜")
    expect(poll.settingsLabel).toBe("복수선택 · 익명투표")
    expect(poll.status).toBe("in_progress")
    expect(poll.participantCount).toBe(0)
    expect(poll.options).toEqual([
      {
        id: "1",
        label: "항목 A",
        progressPercent: 0,
        voteCount: 0,
      },
      {
        id: "2",
        label: "항목 B",
        progressPercent: 0,
        voteCount: 0,
      },
    ])
  })
})
