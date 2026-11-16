import { describe, expect, it } from "vitest"

import {
  normalizeNoticeCreateForm,
  type NormalizeNoticeCreateFormContext,
  resetNoticeCreateOrganization,
} from "./normalize-notice-create-form"
import {
  INITIAL_NOTICE_CREATE_FORM,
  type NoticeCreateFormState,
} from "./notice-create-form"

const BASE_CONTEXT: NormalizeNoticeCreateFormContext = {
  chapterPresidentChallengerOnly: false,
  chapterPresidentCreateLock: null,
  contextGeneration: 11,
  schoolExecutiveCreateLock: null,
  sessionGisuId: 9,
}

function createForm(
  patch: Partial<NoticeCreateFormState> = {},
): NoticeCreateFormState {
  return { ...INITIAL_NOTICE_CREATE_FORM, ...patch }
}

describe("normalizeNoticeCreateForm", () => {
  it("보정할 것이 없으면 같은 참조를 반환한다", () => {
    const form = createForm()

    expect(normalizeNoticeCreateForm(form, BASE_CONTEXT)).toBe(form)
  })

  it("특정 기수 모드에서 대상 기수가 없으면 세션 기수로 채운다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({ gisuMode: "specific" }),
      BASE_CONTEXT,
    )

    expect(result.targetGisuId).toBe(9)
  })

  it("지부장은 챌린저 공지만 작성하도록 강제한다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({ staffEnabled: true }),
      { ...BASE_CONTEXT, chapterPresidentChallengerOnly: true },
    )

    expect(result.challengerEnabled).toBe(true)
    expect(result.staffEnabled).toBe(false)
  })

  it("지부장 잠금이 있으면 기수·지부를 고정한다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({ challengerEnabled: true, schoolId: 5 }),
      {
        ...BASE_CONTEXT,
        chapterPresidentCreateLock: { chapterId: 3, targetGisuId: 9 },
      },
    )

    expect(result).toMatchObject({
      chapterId: 3,
      gisuMode: "specific",
      orgMode: "chapter",
      schoolId: null,
      targetGisuId: 9,
    })
  })

  it("학교 회장단 잠금이 있으면 학교를 고정하고 운영진 범위를 맞춘다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({
        challengerEnabled: true,
        staffEnabled: true,
        staffScope: "CENTRAL_MEMBER",
      }),
      {
        ...BASE_CONTEXT,
        schoolExecutiveCreateLock: { schoolId: 7, targetGisuId: 9 },
      },
    )

    expect(result).toMatchObject({
      chapterId: null,
      orgMode: "school",
      schoolId: 7,
      staffScope: "SCHOOL_PART_LEADER",
      targetGisuId: 9,
    })
  })

  it("기수에서 허용되지 않는 파트를 제거한다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({ parts: ["WEB", "WEB_PRODUCT_ENGINEER"] }),
      BASE_CONTEXT,
    )

    expect(result.parts).toEqual(["WEB_PRODUCT_ENGINEER"])
  })
})

describe("resetNoticeCreateOrganization", () => {
  it("지부·학교가 없으면 같은 참조를 반환한다", () => {
    const form = createForm()

    expect(resetNoticeCreateOrganization(form)).toBe(form)
  })

  it("지부·학교 선택을 비운다", () => {
    const result = resetNoticeCreateOrganization(
      createForm({ chapterId: 1, schoolId: 2 }),
    )

    expect(result.chapterId).toBeNull()
    expect(result.schoolId).toBeNull()
  })
})
