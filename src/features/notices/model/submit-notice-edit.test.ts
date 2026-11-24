import { beforeEach, describe, expect, it, vi } from "vitest"

import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"
import { submitNoticeEdit } from "./submit-notice-edit"

const patchNotice = vi.fn()
const replaceNoticeLinks = vi.fn()
const replaceNoticeImages = vi.fn()
const addNoticeVote = vi.fn()
const deleteNoticeVote = vi.fn()
const uploadNoticeImageFiles = vi.fn()

vi.mock("../api/notices-command.api", () => ({
  addNoticeVote: (...args: unknown[]) => addNoticeVote(...args),
  deleteNoticeVote: (...args: unknown[]) => deleteNoticeVote(...args),
  patchNotice: (...args: unknown[]) => patchNotice(...args),
  replaceNoticeImages: (...args: unknown[]) => replaceNoticeImages(...args),
  replaceNoticeLinks: (...args: unknown[]) => replaceNoticeLinks(...args),
}))

vi.mock("../api/notice-file-upload.api", () => ({
  uploadNoticeImageFiles: (...args: unknown[]) =>
    uploadNoticeImageFiles(...args),
}))

describe("submitNoticeEdit", () => {
  beforeEach(() => {
    patchNotice.mockReset()
    replaceNoticeLinks.mockReset()
    replaceNoticeImages.mockReset()
    addNoticeVote.mockReset()
    deleteNoticeVote.mockReset()
    uploadNoticeImageFiles.mockReset()
    patchNotice.mockResolvedValue(undefined)
    replaceNoticeLinks.mockResolvedValue(undefined)
    replaceNoticeImages.mockResolvedValue(undefined)
    addNoticeVote.mockResolvedValue({ noticeVoteId: 1, voteId: 2 })
    deleteNoticeVote.mockResolvedValue(undefined)
    uploadNoticeImageFiles.mockResolvedValue([])
  })

  it("calls NOTICE-203 then NOTICE-105 and NOTICE-104", async () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      title: "제목",
      content: "본문",
      mustRead: true,
      links: ["https://example.com"],
      existingImages: [{ fileId: "existing-1", src: "https://img/1" }],
      imageFiles: [],
    }

    const outcome = await submitNoticeEdit({ form, noticeId: 9 })

    expect(outcome).toEqual({ kind: "success" })
    expect(patchNotice).toHaveBeenCalledWith(9, {
      title: "제목",
      content: "본문",
      mustRead: true,
    })
    expect(replaceNoticeLinks).toHaveBeenCalledWith(9, ["https://example.com"])
    expect(replaceNoticeImages).toHaveBeenCalledWith(9, ["existing-1"])
    expect(uploadNoticeImageFiles).not.toHaveBeenCalled()
  })

  it("uploads new files and merges imageIds for NOTICE-104", async () => {
    uploadNoticeImageFiles.mockResolvedValue(["new-1"])
    const file = new File(["x"], "a.png", { type: "image/png" })
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      title: "t",
      content: "c",
      links: [],
      existingImages: [{ fileId: "existing-1", src: "https://img/1" }],
      imageFiles: [file],
    }

    await submitNoticeEdit({ form, noticeId: 3 })

    expect(replaceNoticeLinks).toHaveBeenCalledWith(3, [])
    expect(replaceNoticeImages).toHaveBeenCalledWith(3, ["existing-1", "new-1"])
  })

  it("sends empty arrays when all links and images are removed", async () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      title: "t",
      content: "c",
      links: [],
      existingImages: [],
      imageFiles: [],
    }

    await submitNoticeEdit({ form, noticeId: 2 })

    expect(replaceNoticeLinks).toHaveBeenCalledWith(2, [])
    expect(replaceNoticeImages).toHaveBeenCalledWith(2, [])
  })

  it("skips replace calls when links and images are unchanged from baseline", async () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      title: "t",
      content: "c",
      links: ["https://example.com"],
      existingImages: [{ fileId: "existing-1", src: "https://img/1" }],
      imageFiles: [],
    }

    const outcome = await submitNoticeEdit({
      baselineImageIds: ["existing-1"],
      baselineLinks: ["https://example.com"],
      form,
      noticeId: 5,
    })

    expect(outcome).toEqual({ kind: "success" })
    expect(patchNotice).toHaveBeenCalled()
    expect(replaceNoticeLinks).not.toHaveBeenCalled()
    expect(replaceNoticeImages).not.toHaveBeenCalled()
  })

  it("still calls replace with empty arrays when baseline content is cleared", async () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      title: "t",
      content: "c",
      links: [],
      existingImages: [],
      imageFiles: [],
    }

    await submitNoticeEdit({
      baselineImageIds: ["existing-1"],
      baselineLinks: ["https://example.com"],
      form,
      noticeId: 6,
    })

    expect(replaceNoticeLinks).toHaveBeenCalledWith(6, [])
    expect(replaceNoticeImages).toHaveBeenCalledWith(6, [])
  })

  it("calls NOTICE-104 when new files are added even if existing ids match baseline", async () => {
    uploadNoticeImageFiles.mockResolvedValue(["new-1"])
    const file = new File(["x"], "a.png", { type: "image/png" })
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      title: "t",
      content: "c",
      links: [],
      existingImages: [{ fileId: "existing-1", src: "https://img/1" }],
      imageFiles: [file],
    }

    await submitNoticeEdit({
      baselineImageIds: ["existing-1"],
      baselineLinks: [],
      form,
      noticeId: 7,
    })

    expect(replaceNoticeLinks).not.toHaveBeenCalled()
    expect(replaceNoticeImages).toHaveBeenCalledWith(7, ["existing-1", "new-1"])
  })

  it("calls NOTICE-106 when removeAttachedVote is set", async () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      title: "t",
      content: "c",
      links: [],
      existingImages: [],
      imageFiles: [],
    }

    const outcome = await submitNoticeEdit({
      form,
      noticeId: 12,
      removeAttachedVote: true,
    })

    expect(outcome).toEqual({ kind: "success" })
    expect(deleteNoticeVote).toHaveBeenCalledWith(12)
    expect(addNoticeVote).not.toHaveBeenCalled()
  })

  it("calls NOTICE-103 after content save when voteDraft is provided", async () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      title: "t",
      content: "c",
      links: [],
      existingImages: [],
      imageFiles: [],
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

    const outcome = await submitNoticeEdit({ form, noticeId: 11, voteDraft })

    expect(outcome).toEqual({ kind: "success" })
    expect(addNoticeVote).toHaveBeenCalledWith(
      11,
      expect.objectContaining({
        title: "투표",
        options: ["Yes", "No"],
      }),
    )
  })

  it("returns server_error for HTTP error responses and network_error for no response", async () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      title: "t",
      content: "c",
    }
    patchNotice.mockRejectedValueOnce(
      Object.assign(new Error("500"), {
        isAxiosError: true,
        response: { status: 500, data: undefined },
      }),
    )

    expect(await submitNoticeEdit({ form, noticeId: 1 })).toMatchObject({
      kind: "server_error",
      message: expect.any(String),
    })

    patchNotice.mockRejectedValueOnce(
      Object.assign(new Error("Network Error"), {
        isAxiosError: true,
        response: undefined,
      }),
    )

    expect(await submitNoticeEdit({ form, noticeId: 1 })).toEqual({
      kind: "network_error",
    })
  })
})
