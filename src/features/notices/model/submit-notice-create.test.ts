import { beforeEach, describe, expect, it, vi } from "vitest"

import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"
import { submitNoticeCreate } from "./submit-notice-create"

const postNotice = vi.fn()
const replaceNoticeLinks = vi.fn()
const replaceNoticeImages = vi.fn()
const addNoticeVote = vi.fn()
const uploadNoticeImageFiles = vi.fn()

vi.mock("../api/notices-command.api", () => ({
  addNoticeVote: (...args: unknown[]) => addNoticeVote(...args),
  postNotice: (...args: unknown[]) => postNotice(...args),
  replaceNoticeImages: (...args: unknown[]) => replaceNoticeImages(...args),
  replaceNoticeLinks: (...args: unknown[]) => replaceNoticeLinks(...args),
}))

vi.mock("../api/notice-file-upload.api", () => ({
  uploadNoticeImageFiles: (...args: unknown[]) =>
    uploadNoticeImageFiles(...args),
}))

const session = {
  gisuId: 9,
  id: 1,
  isAdmin: true,
  isSuperAdmin: true,
  roleTypes: ["SUPER_ADMIN"],
  schoolId: null,
}

const baseForm = {
  ...INITIAL_NOTICE_CREATE_FORM,
  challengerEnabled: true,
  staffEnabled: false,
  content: "본문",
  gisuMode: "specific" as const,
  orgMode: "umc" as const,
  targetGisuId: 9,
  title: "제목",
}

const voteDraft = {
  allowMultiple: false,
  endDate: new Date("2026-11-30T00:00:00"),
  endTime: "18:00",
  isAnonymous: false,
  options: ["Yes", "No"],
  startDate: new Date("2026-11-01T00:00:00"),
  startTime: "09:00",
  title: "투표",
}

function makeNetworkError() {
  return Object.assign(new Error("Network Error"), {
    isAxiosError: true,
    response: undefined,
  })
}

describe("submitNoticeCreate", () => {
  beforeEach(() => {
    postNotice.mockReset()
    replaceNoticeLinks.mockReset()
    replaceNoticeImages.mockReset()
    addNoticeVote.mockReset()
    uploadNoticeImageFiles.mockReset()
    postNotice.mockResolvedValue(100)
    replaceNoticeLinks.mockResolvedValue(undefined)
    replaceNoticeImages.mockResolvedValue(undefined)
    addNoticeVote.mockResolvedValue({ noticeVoteId: 1, voteId: 2 })
    uploadNoticeImageFiles.mockResolvedValue([])
  })

  it("skips replace calls when links and images are empty", async () => {
    const outcome = await submitNoticeCreate({ form: baseForm, session })

    expect(outcome).toEqual({ kind: "success", noticeId: 100 })
    expect(postNotice).toHaveBeenCalledTimes(1)
    expect(replaceNoticeLinks).not.toHaveBeenCalled()
    expect(replaceNoticeImages).not.toHaveBeenCalled()
    expect(uploadNoticeImageFiles).not.toHaveBeenCalled()
  })

  it("replaces links and images when both are present", async () => {
    uploadNoticeImageFiles.mockResolvedValue(["img-1"])
    const form = {
      ...baseForm,
      imageFiles: [new File(["x"], "a.png", { type: "image/png" })],
      links: ["https://example.com"],
    }

    await submitNoticeCreate({ form, session })

    expect(replaceNoticeLinks).toHaveBeenCalledWith(100, [
      "https://example.com",
    ])
    expect(replaceNoticeImages).toHaveBeenCalledWith(100, ["img-1"])
  })

  it("returns progress on failure and resumes without redoing completed steps", async () => {
    uploadNoticeImageFiles.mockResolvedValue(["img-1"])
    const form = {
      ...baseForm,
      imageFiles: [new File(["x"], "a.png", { type: "image/png" })],
    }
    replaceNoticeImages.mockRejectedValueOnce(makeNetworkError())

    const first = await submitNoticeCreate({ form, session, voteDraft })

    expect(first.kind).toBe("network_error")
    const progress = first.kind === "network_error" ? first.progress : undefined
    expect(progress).toEqual({
      attached: [false],
      imageIds: ["img-1"],
      noticeIds: [100],
      voted: [false],
    })

    const second = await submitNoticeCreate({
      form,
      progress,
      session,
      voteDraft,
    })

    expect(second).toEqual({ kind: "success", noticeId: 100 })
    expect(uploadNoticeImageFiles).toHaveBeenCalledTimes(1)
    expect(postNotice).toHaveBeenCalledTimes(1)
    expect(replaceNoticeImages).toHaveBeenCalledTimes(2)
    expect(addNoticeVote).toHaveBeenCalledTimes(1)
    expect(progress).toEqual({
      attached: [true],
      imageIds: ["img-1"],
      noticeIds: [100],
      voted: [true],
    })
  })

  it("does not repost a notice or re-add a vote on retry", async () => {
    addNoticeVote.mockRejectedValueOnce(makeNetworkError())

    const first = await submitNoticeCreate({
      form: baseForm,
      session,
      voteDraft,
    })
    const progress = first.kind === "network_error" ? first.progress : undefined
    expect(progress?.attached).toEqual([true])
    expect(progress?.voted).toEqual([false])

    await submitNoticeCreate({ form: baseForm, progress, session, voteDraft })

    expect(postNotice).toHaveBeenCalledTimes(1)
    expect(addNoticeVote).toHaveBeenCalledTimes(2)
  })
})
