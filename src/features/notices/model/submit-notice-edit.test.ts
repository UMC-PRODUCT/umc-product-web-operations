import { beforeEach, describe, expect, it, vi } from "vitest"

import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"
import { submitNoticeEdit } from "./submit-notice-edit"

const patchNotice = vi.fn()
const replaceNoticeLinks = vi.fn()
const replaceNoticeImages = vi.fn()
const uploadNoticeImageFiles = vi.fn()

vi.mock("../api/notices-command.api", () => ({
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
    uploadNoticeImageFiles.mockReset()
    patchNotice.mockResolvedValue(undefined)
    replaceNoticeLinks.mockResolvedValue(undefined)
    replaceNoticeImages.mockResolvedValue(undefined)
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
})
