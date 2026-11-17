import { describe, expect, it } from "vitest"

import {
  normalizeNoticeListFilters,
  type NormalizeNoticeListFiltersContext,
  type NoticeListFilterFields,
} from "./normalize-notice-list-filters"

const EMPTY_FILTERS: NoticeListFilterFields = {
  chapterScope: null,
  part: null,
  query: "",
  schoolScope: null,
  scope: null,
  scopeStage: null,
  staffRecipient: null,
}

const BASE_CONTEXT: NormalizeNoticeListFiltersContext = {
  chapterScopeOptions: ["chapter:1", "chapter:2"],
  optionsReady: true,
  partOptions: ["WEB", "DESIGN"],
  schoolScopeOptions: ["school:10", "school:20"],
}

describe("normalizeNoticeListFilters", () => {
  it("유효한 필터는 동일 참조를 반환한다", () => {
    const filters: NoticeListFilterFields = {
      ...EMPTY_FILTERS,
      chapterScope: "chapter:1",
      part: "WEB",
      query: "공지",
    }

    expect(normalizeNoticeListFilters(filters, BASE_CONTEXT)).toBe(filters)
  })

  it("옵션에 없는 지부·학교·파트는 null로 보정한다", () => {
    const result = normalizeNoticeListFilters(
      {
        ...EMPTY_FILTERS,
        chapterScope: "chapter:99",
        part: "IOS",
        schoolScope: "school:99",
      },
      BASE_CONTEXT,
    )

    expect(result.chapterScope).toBeNull()
    expect(result.schoolScope).toBeNull()
    expect(result.part).toBeNull()
  })

  it("옵션 로딩 중에는 옵션 기반 보정을 건너뛴다", () => {
    const filters: NoticeListFilterFields = {
      ...EMPTY_FILTERS,
      chapterScope: "chapter:99",
    }

    expect(
      normalizeNoticeListFilters(filters, {
        ...BASE_CONTEXT,
        chapterScopeOptions: [],
        optionsReady: false,
      }),
    ).toBe(filters)
  })

  it("운영진 범위 단계에 맞지 않는 scope를 제거한다", () => {
    const result = normalizeNoticeListFilters(
      { ...EMPTY_FILTERS, scope: "school:99", scopeStage: "school" },
      BASE_CONTEXT,
    )

    expect(result.scope).toBeNull()
    expect(result.scopeStage).toBe("school")
  })

  it("고정 지부가 있으면 본인 지부 외 선택을 제거한다", () => {
    const result = normalizeNoticeListFilters(
      { ...EMPTY_FILTERS, chapterScope: "chapter:2" },
      { ...BASE_CONTEXT, lockedChapterScope: "chapter:1" },
    )

    expect(result.chapterScope).toBeNull()
  })

  it("고정 학교가 있으면 본인 학교 외 선택을 제거한다", () => {
    const result = normalizeNoticeListFilters(
      { ...EMPTY_FILTERS, schoolScope: "school:20" },
      { ...BASE_CONTEXT, challengerLockedSchoolScope: "school:10" },
    )

    expect(result.schoolScope).toBeNull()
  })

  it("허용되지 않은 받는 사람을 제거한다", () => {
    const result = normalizeNoticeListFilters(
      { ...EMPTY_FILTERS, staffRecipient: "CENTRAL_MEMBER" },
      { ...BASE_CONTEXT, staffRecipientScopeAllowlist: ["SCHOOL_CORE"] },
    )

    expect(result.staffRecipient).toBeNull()
  })

  it("고정 받는 사람이 있으면 항상 해당 값으로 맞춘다", () => {
    const result = normalizeNoticeListFilters(EMPTY_FILTERS, {
      ...BASE_CONTEXT,
      staffFixedStaffRecipient: "SCHOOL_PART_LEADER",
    })

    expect(result.staffRecipient).toBe("SCHOOL_PART_LEADER")
  })

  it("중앙·회장단 받는 사람이면 범위 단계·대상·파트를 초기화한다", () => {
    const result = normalizeNoticeListFilters(
      {
        ...EMPTY_FILTERS,
        part: "WEB",
        scopeStage: "part",
        staffRecipient: "CENTRAL_MEMBER",
      },
      BASE_CONTEXT,
    )

    expect(result.scopeStage).toBeNull()
    expect(result.scope).toBeNull()
    expect(result.part).toBeNull()
  })

  it("학교 고정 운영진은 학교별 범위에서 scope를 고정 학교로 맞춘다", () => {
    const result = normalizeNoticeListFilters(
      { ...EMPTY_FILTERS, scope: "school:20", scopeStage: "school" },
      { ...BASE_CONTEXT, staffLockedSchoolScope: "school:10" },
    )

    expect(result.scope).toBe("school:10")
  })
})
