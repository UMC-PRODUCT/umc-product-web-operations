import { describe, expect, it } from "vitest"

import { NOTICE_LIST_FILTER_ALL } from "./notice-list-filter-all"
import { buildNoticeListStaffScopeStageSelectOptions } from "./notice-list-staff-scope-stage-filter-options"
import { NOTICE_LIST_STAFF_SCOPE_ALL_SCHOOLS } from "./notice-scope-stage"

describe("buildNoticeListStaffScopeStageSelectOptions", () => {
  it("회장단 범위 필터는 Figma 라벨·설명 3개(파트 없음)", () => {
    const options = buildNoticeListStaffScopeStageSelectOptions("SCHOOL_CORE")

    expect(options).toHaveLength(3)
    expect(options[0]).toMatchObject({
      value: NOTICE_LIST_FILTER_ALL,
      label: "범위 전체",
      caption: "모든 학교 대상 + 학교 지정",
    })
    expect(options[1]).toMatchObject({
      value: NOTICE_LIST_STAFF_SCOPE_ALL_SCHOOLS,
      label: "모든 학교 대상",
      caption: "학교를 지정하지 않은 공지",
    })
    expect(options[2]).toMatchObject({
      value: "school",
      label: "학교별",
      caption: "대상에서 학교 선택",
    })
  })

  it("학교 운영진은 파트별 옵션을 추가한다", () => {
    const options =
      buildNoticeListStaffScopeStageSelectOptions("SCHOOL_PART_LEADER")

    expect(options).toHaveLength(4)
    expect(options[3]).toMatchObject({
      value: "part",
      label: "파트별",
      caption: "대상에서 파트 선택",
    })
  })

  it("범위가 잠긴 받는 사람이면 옵션이 비어 있다", () => {
    expect(
      buildNoticeListStaffScopeStageSelectOptions("CENTRAL_MEMBER"),
    ).toEqual([])
    expect(buildNoticeListStaffScopeStageSelectOptions(null)).toEqual([])
  })
})
