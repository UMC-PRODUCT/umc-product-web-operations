import { describe, expect, it } from "vitest"

import { NOTICE_LIST_FILTER_ALL } from "./notice-list-filter-all"
import { buildNoticeListStaffRecipientSelectOptions } from "./notice-list-staff-recipient-filter-options"

describe("buildNoticeListStaffRecipientSelectOptions", () => {
  it("Figma 받는 사람 필터 옵션 라벨·설명을 포함한다", () => {
    const options = buildNoticeListStaffRecipientSelectOptions(null)

    expect(options[0]).toMatchObject({
      value: NOTICE_LIST_FILTER_ALL,
      label: "받는 사람 전체",
      caption: "내가 받는 운영진 공지 전부",
    })
    expect(
      options.find((option) => option.value === "SCHOOL_CORE"),
    ).toMatchObject({
      label: "회장단",
      caption: "회장·부회장 + 중앙 운영진 (모든 학교 지부장도)",
    })
    expect(
      options.find((option) => option.value === "SCHOOL_PART_LEADER"),
    ).toMatchObject({
      label: "학교 운영진",
      caption: "파트장·기타 운영진 + 회장단 + 중앙 운영진",
    })
  })

  it("지부장(chapterAdmin)은 Figma 2808-42322 받는 사람 옵션만 반환한다", () => {
    const options = buildNoticeListStaffRecipientSelectOptions(
      ["ALL_STAFF", "SCHOOL_CORE"],
      "chapterAdmin",
    )

    expect(options).toHaveLength(3)
    expect(options[0]).toMatchObject({
      value: NOTICE_LIST_FILTER_ALL,
      label: "받는 사람 전체",
      caption: "내가 받는 운영진 공지 전부",
    })
    expect(options[1]).toMatchObject({
      value: "ALL_STAFF",
      label: "모든 운영진",
      caption: "전국 운영진 전체",
    })
    expect(options[2]).toMatchObject({
      value: "SCHOOL_CORE",
      label: "회장단",
      caption: "모든 학교 회장단",
    })
  })

  it("학교 회장단(schoolAdmin)은 Figma 2808-42349 받는 사람 옵션을 반환한다", () => {
    const options = buildNoticeListStaffRecipientSelectOptions(
      ["ALL_STAFF", "SCHOOL_CORE", "SCHOOL_PART_LEADER"],
      "schoolAdmin",
    )

    expect(options).toHaveLength(4)
    expect(options[0]).toMatchObject({
      value: NOTICE_LIST_FILTER_ALL,
      label: "받는 사람 전체",
      caption: "내가 받는 운영진 공지 전부",
    })
    expect(options[1]).toMatchObject({
      value: "ALL_STAFF",
      label: "모든 운영진",
      caption: "전국 운영진 전체",
    })
    expect(options[2]).toMatchObject({
      value: "SCHOOL_CORE",
      label: "회장단",
      caption: "모든 학교 + 본교",
    })
    expect(options[3]).toMatchObject({
      value: "SCHOOL_PART_LEADER",
      label: "학교 운영진",
      caption: "본교",
    })
    expect(options.some((option) => option.value === "CENTRAL_MEMBER")).toBe(
      false,
    )
  })

  it("school_staff는 school_admin과 같되 회장단 옵션 없음", () => {
    const options = buildNoticeListStaffRecipientSelectOptions(
      ["ALL_STAFF", "SCHOOL_PART_LEADER"],
      "schoolAdmin",
    )

    expect(options).toHaveLength(3)
    expect(options.map((option) => option.value)).toEqual([
      NOTICE_LIST_FILTER_ALL,
      "ALL_STAFF",
      "SCHOOL_PART_LEADER",
    ])
    expect(options.some((option) => option.value === "SCHOOL_CORE")).toBe(false)
    expect(options[2]).toMatchObject({
      label: "학교 운영진",
      caption: "본교",
    })
  })

  it("allowlist가 있으면 해당 범위만 반환한다", () => {
    const options = buildNoticeListStaffRecipientSelectOptions([
      "SCHOOL_PART_LEADER",
    ])

    expect(options).toHaveLength(2)
    expect(options[1]?.value).toBe("SCHOOL_PART_LEADER")
  })
})
