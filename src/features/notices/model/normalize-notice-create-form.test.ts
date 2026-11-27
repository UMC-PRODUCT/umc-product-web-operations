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
  centralAdminStaffChipRestricted: false,
  centralLeadStaffChipRestricted: false,
  chapterPresidentChallengerOnly: false,
  chapterPresidentCreateLock: null,
  contextGeneration: 11,
  schoolExecutiveCreateLock: null,
  schoolStaffChallengerOnly: false,
  schoolStaffCreateLock: null,
  noticeCreateSuperAdmin: false,
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

  it("슈퍼어드민은 종류·대상 잠금 보정을 적용하지 않는다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({ staffEnabled: true }),
      {
        ...BASE_CONTEXT,
        chapterPresidentChallengerOnly: true,
        centralLeadStaffChipRestricted: true,
        noticeCreateSuperAdmin: true,
      },
    )

    expect(result.staffEnabled).toBe(true)
    expect(result.challengerEnabled).toBe(false)
  })

  it("특정 기수를 선택 가능할 때는 대상 기수를 비워 둔다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({ gisuMode: "specific", targetGisuId: null }),
      BASE_CONTEXT,
    )

    expect(result.targetGisuId).toBeNull()
  })

  it("지부장은 챌린저 공지만 작성하도록 강제한다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({ staffEnabled: true }),
      { ...BASE_CONTEXT, chapterPresidentChallengerOnly: true },
    )

    expect(result.challengerEnabled).toBe(true)
    expect(result.staffEnabled).toBe(false)
  })

  it("교내 파트장·기타 운영진은 챌린저 공지만 작성하도록 강제한다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({ staffEnabled: true }),
      {
        ...BASE_CONTEXT,
        schoolStaffChallengerOnly: true,
        schoolStaffCreateLock: { schoolId: 7, targetGisuId: 9 },
      },
    )

    expect(result).toMatchObject({
      challengerEnabled: true,
      staffEnabled: false,
      orgMode: "school",
      schoolId: 7,
      targetGisuId: 9,
    })
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

  it("HQ_LEAD 챌린저는 활성 기수로 대상을 맞춘다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({
        challengerEnabled: true,
        staffEnabled: false,
        gisuMode: "all",
        targetGisuId: null,
      }),
      { ...BASE_CONTEXT, centralLeadStaffChipRestricted: true },
    )

    expect(result).toMatchObject({
      gisuMode: "specific",
      targetGisuId: 9,
      orgMode: "umc",
    })
  })

  it("HQ_LEAD 운영진은 활성 기수로 대상을 맞춘다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({
        staffEnabled: true,
        staffScope: "CENTRAL_MEMBER",
        gisuMode: "all",
      }),
      { ...BASE_CONTEXT, centralLeadStaffChipRestricted: true },
    )

    expect(result).toMatchObject({
      gisuMode: "specific",
      targetGisuId: 9,
      orgMode: "umc",
    })
  })

  it("HQ_LEAD는 학교 운영진 범위를 모든 운영진으로 보정한다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({
        staffEnabled: true,
        staffScope: "SCHOOL_PART_LEADER",
      }),
      { ...BASE_CONTEXT, centralLeadStaffChipRestricted: true },
    )

    expect(result.staffScope).toBe("ALL_STAFF")
  })

  it("HQ_ADMIN는 학교 운영진 범위를 모든 운영진으로 보정한다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({
        staffEnabled: true,
        staffScope: "SCHOOL_PART_LEADER",
      }),
      { ...BASE_CONTEXT, centralAdminStaffChipRestricted: true },
    )

    expect(result.staffScope).toBe("ALL_STAFF")
  })

  it("HQ_ADMIN는 중앙 운영진 범위를 모든 운영진으로 보정한다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({
        staffEnabled: true,
        staffScope: "CENTRAL_MEMBER",
      }),
      { ...BASE_CONTEXT, centralAdminStaffChipRestricted: true },
    )

    expect(result.staffScope).toBe("ALL_STAFF")
  })

  it("HQ_ADMIN 운영진은 활성 기수로 대상을 맞춘다", () => {
    const result = normalizeNoticeCreateForm(
      createForm({
        staffEnabled: true,
        staffScope: "SCHOOL_CORE",
        gisuMode: "all",
      }),
      { ...BASE_CONTEXT, centralAdminStaffChipRestricted: true },
    )

    expect(result).toMatchObject({
      gisuMode: "specific",
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
