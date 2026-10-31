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
      gisuMode: "specific" as const,
      orgMode: "chapter" as const,
      chapterId: 3,
      targetGisuId: 9,
      title: "t",
      content: "c",
    }

    const [request] = buildCreateNoticeRequests(form, 9, 10)
    expect(request).toBeDefined()

    expect(request!.targetInfo.targetNoticeTab).toBe("CENTRAL_MEMBER")
    expect(request!.targetInfo.targetChapterId).toBeUndefined()
    expect(request!.targetInfo.targetGisuId).toBe(9)
    expect(request!.targetInfo.targetSchoolId).toBeNull()
    expect(request!.targetInfo.targetParts).toBeUndefined()
  })

  it("maps staff school scope only for SCHOOL_PART_LEADER tab", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      challengerEnabled: false,
      staffEnabled: true,
      staffScope: "SCHOOL_PART_LEADER" as const,
      gisuMode: "specific" as const,
      orgMode: "school" as const,
      schoolId: 19,
      targetGisuId: 9,
      parts: ["WEB"] satisfies NoticePart[],
      title: "t",
      content: "c",
    }

    const [request] = buildCreateNoticeRequests(form, 9, 11)
    expect(request).toBeDefined()

    expect(request!.targetInfo).toEqual({
      targetNoticeTab: "SCHOOL_PART_LEADER",
      targetGisuId: 9,
      targetSchoolId: 19,
      targetParts: ["WEB"],
    })
    expect(request!.targetInfo.targetChapterId).toBeUndefined()
  })

  it("does not send school on SCHOOL_CORE staff notice", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      staffEnabled: true,
      gisuMode: "specific" as const,
      orgMode: "school" as const,
      schoolId: 19,
      staffScope: "SCHOOL_CORE" as const,
      targetGisuId: 9,
      title: "t",
      content: "c",
    }

    const [request] = buildCreateNoticeRequests(form, 9, 11)
    expect(request!.targetInfo.targetSchoolId).toBeNull()
    expect(request!.targetInfo.targetParts).toBeUndefined()
  })

  it("uses session gisu when staff notice has all-gisu mode", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      challengerEnabled: false,
      staffEnabled: true,
      gisuMode: "all" as const,
      targetGisuId: null,
      title: "t",
      content: "c",
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

  it("sends staff part filters only on SCHOOL_PART_LEADER tab", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      staffEnabled: true,
      challengerEnabled: false,
      staffScope: "SCHOOL_PART_LEADER" as const,
      gisuMode: "specific" as const,
      targetGisuId: 6,
      orgMode: "umc" as const,
      parts: ["WEB"] satisfies NoticePart[],
      title: "t",
      content: "c",
    }

    const [request] = buildCreateNoticeRequests(form, 6, 11)
    expect(request).toBeDefined()

    expect(request!.targetInfo.targetParts).toEqual(["WEB"])
  })
})
