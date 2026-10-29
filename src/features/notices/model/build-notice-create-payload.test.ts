import { describe, expect, it } from "vitest"

import { buildCreateNoticeRequests } from "./build-notice-create-payload"
import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"

import type { NoticePart } from "../api/notice-api.types"

describe("buildCreateNoticeRequests", () => {
  it("maps challenger notice to NOTICE-201 targetInfo", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      challengerEnabled: true,
      staffEnabled: false,
      title: "  제목 ",
      content: " 본문 ",
      targetGisuId: 9,
      gisuMode: "specific" as const,
      orgMode: "chapter" as const,
      chapterId: 3,
      parts: ["WEB", "ANDROID"] satisfies NoticePart[],
      sendNotification: true,
      mustRead: false,
    }

    const [request] = buildCreateNoticeRequests(form, 9, 10)
    expect(request).toBeDefined()

    expect(request).toEqual({
      title: "제목",
      content: "본문",
      shouldNotify: true,
      targetInfo: {
        targetNoticeTab: "CHALLENGER",
        targetGisuId: 9,
        targetChapterId: 3,
        targetSchoolId: null,
        targetParts: ["WEB_PRODUCT_ENGINEER", "MOBILE_PRODUCT_ENGINEER"],
      },
    })
  })

  it("omits targetChapterId for staff notices", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      challengerEnabled: false,
      staffEnabled: true,
      staffScope: "CENTRAL_MEMBER" as const,
      orgMode: "chapter" as const,
      chapterId: 3,
      targetGisuId: 9,
    }

    const [request] = buildCreateNoticeRequests(form, 9, 10)
    expect(request).toBeDefined()

    expect(request!.targetInfo.targetNoticeTab).toBe("CENTRAL_MEMBER")
    expect(request!.targetInfo.targetChapterId).toBeUndefined()
    expect(request!.targetInfo.targetGisuId).toBe(9)
    expect(request!.targetInfo.targetSchoolId).toBeNull()
  })

  it("uses session gisu when staff notice has all-gisu mode", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      challengerEnabled: false,
      staffEnabled: true,
      gisuMode: "all" as const,
      targetGisuId: null,
    }

    const [request] = buildCreateNoticeRequests(form, 12, 11)
    expect(request).toBeDefined()

    expect(request!.targetInfo.targetGisuId).toBe(12)
  })

  it("does not send chapter or school when challenger notice has all-gisu mode", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      challengerEnabled: true,
      gisuMode: "all" as const,
      orgMode: "chapter" as const,
      chapterId: 3,
      title: "t",
      content: "c",
    }

    const [request] = buildCreateNoticeRequests(form, 6, 11)
    expect(request).toBeDefined()

    expect(request!.targetInfo.targetGisuId).toBeNull()
    expect(request!.targetInfo.targetChapterId).toBeNull()
    expect(request!.targetInfo.targetSchoolId).toBeNull()
  })

  it("sends empty targetParts as all-part challenger notice", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      challengerEnabled: true,
      title: "t",
      content: "c",
      parts: [],
    }

    const [request] = buildCreateNoticeRequests(form, 6, 11)
    expect(request).toBeDefined()

    expect(request!.targetInfo.targetParts).toEqual([])
  })

  it("omits challenger part filters on central staff notice", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      staffEnabled: true,
      challengerEnabled: false,
      parts: ["WEB"] satisfies NoticePart[],
      title: "t",
      content: "c",
    }

    const [request] = buildCreateNoticeRequests(form, 6, 11)
    expect(request).toBeDefined()

    expect(request!.targetInfo.targetNoticeTab).toBe("CENTRAL_MEMBER")
    expect(request!.targetInfo.targetParts).toBeUndefined()
  })
})
