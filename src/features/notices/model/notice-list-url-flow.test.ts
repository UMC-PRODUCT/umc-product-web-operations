import { describe, expect, it } from "vitest"

import { normalizeNoticeListFilters } from "./normalize-notice-list-filters"
import {
  areNoticeListFilterSearchParamsEqual,
  buildNoticeListFilterSearchParams,
  parseNoticeListFiltersFromSearch,
} from "./notice-list-route-search"

import type { NormalizeNoticeListFiltersContext } from "./normalize-notice-list-filters"
import type { NoticeAudience } from "./types"

/** URL(search) -> 파싱 -> 컨텍스트 보정 -> URL(search) 재생성까지의 흐름 */
function runFlow(
  search: Record<string, unknown>,
  audience: NoticeAudience,
  context: Partial<NormalizeNoticeListFiltersContext> = {},
) {
  const { filters, page } = parseNoticeListFiltersFromSearch(search, {
    audience,
  })
  const normalized = normalizeNoticeListFilters(filters, {
    chapterScopeOptions: ["chapter:1", "chapter:2"],
    optionsReady: true,
    partOptions: ["WEB", "DESIGN"],
    schoolScopeOptions: ["school:10", "school:11"],
    ...context,
  })
  return {
    filters,
    normalized,
    page,
    next: buildNoticeListFilterSearchParams({
      audience,
      filters: normalized,
    }),
  }
}

describe("공지 목록 필터 URL 흐름", () => {
  describe("챌린저 탭", () => {
    it("유효한 URL은 보정 없이 그대로 다시 URL이 된다", () => {
      const search = {
        chapterScope: "chapter:1",
        part: "WEB",
        q: "  모집  ",
        schoolScope: "school:10",
      }

      const { filters, next, normalized } = runFlow(search, "challenger")

      expect(normalized).toBe(filters)
      expect(next).toEqual({
        chapterScope: "chapter:1",
        part: "WEB",
        q: "모집",
        schoolScope: "school:10",
      })
    })

    it("옵션에 없는 지부·학교·파트는 URL에서 제거된다", () => {
      const { next, normalized } = runFlow(
        {
          chapterScope: "chapter:99",
          part: "IOS",
          q: "공지",
          schoolScope: "school:99",
        },
        "challenger",
      )

      expect(normalized).toMatchObject({
        chapterScope: null,
        part: null,
        schoolScope: null,
      })
      expect(next).toEqual({ q: "공지" })
    })

    it("옵션 로딩 중에는 옵션 기반 검증을 건너뛴다", () => {
      const { next } = runFlow(
        { chapterScope: "chapter:99", part: "IOS" },
        "challenger",
        { optionsReady: false },
      )

      expect(next).toMatchObject({ chapterScope: "chapter:99", part: "IOS" })
    })

    it("지부 고정 계정이 다른 지부 URL로 들어오면 지부 필터를 버린다", () => {
      const { next } = runFlow({ chapterScope: "chapter:2" }, "challenger", {
        lockedChapterScope: "chapter:1",
      })

      expect(next).toEqual({})
    })

    it("스키마에 맞지 않는 값(접두어·페이지)은 파싱 단계에서 걸러진다", () => {
      const { next, page } = runFlow(
        { chapterScope: "school:1", page: "-4", schoolScope: "chapter:1" },
        "challenger",
      )

      expect(page).toBe(1)
      expect(next).toEqual({})
    })

    it("보정 결과가 URL과 같으면 동기화가 필요 없다", () => {
      const clean = runFlow({ part: "WEB", q: "a" }, "challenger")
      const dirty = runFlow({ part: "IOS", q: "a" }, "challenger")

      expect(
        areNoticeListFilterSearchParamsEqual(clean.next, {
          part: "WEB",
          q: "a",
        }),
      ).toBe(true)
      expect(
        areNoticeListFilterSearchParamsEqual(dirty.next, {
          part: "IOS",
          q: "a",
        }),
      ).toBe(false)
    })
  })

  describe("운영진 탭", () => {
    it("파트 범위 + 받는 사람이 그대로 유지된다", () => {
      const { next } = runFlow(
        {
          part: "DESIGN",
          scopeStage: "part",
          staffRecipient: "SCHOOL_PART_LEADER",
        },
        "staff",
      )

      expect(next).toEqual({
        part: "DESIGN",
        scopeStage: "part",
        staffRecipient: "SCHOOL_PART_LEADER",
      })
    })

    it("학교 고정 계정은 학교별 범위를 본인 학교로 덮어쓴다", () => {
      const { next } = runFlow(
        { scope: "school:11", scopeStage: "school" },
        "staff",
        { staffLockedSchoolScope: "school:10" },
      )

      expect(next).toMatchObject({ scope: "school:10", scopeStage: "school" })
    })

    it("허용되지 않은 받는 사람은 제거되고, 고정 값이 있으면 고정된다", () => {
      const removed = runFlow({ staffRecipient: "SCHOOL_CORE" }, "staff", {
        staffRecipientScopeAllowlist: ["SCHOOL_PART_LEADER"],
      })
      const fixed = runFlow({ staffRecipient: "SCHOOL_CORE" }, "staff", {
        staffFixedStaffRecipient: "SCHOOL_PART_LEADER",
      })

      expect(removed.next).toEqual({})
      expect(fixed.next).toMatchObject({ staffRecipient: "SCHOOL_PART_LEADER" })
    })

    it("중앙 운영진 탭은 범위·파트 필터를 URL에서 지운다", () => {
      const { next } = runFlow(
        {
          part: "WEB",
          scopeStage: "part",
          staffRecipient: "CENTRAL_MEMBER",
        },
        "staff",
      )

      expect(next).toEqual({
        staffRecipient: "CENTRAL_MEMBER",
      })
    })

    it("범위 단계와 맞지 않는 scope 값은 파싱에서 버린다", () => {
      const { next } = runFlow(
        { scope: "chapter:1", scopeStage: "school" },
        "staff",
      )

      expect(next).toEqual({ scopeStage: "school" })
    })
  })

  it("한 번 정규화된 URL을 다시 흘려도 결과가 변하지 않는다 (idempotent)", () => {
    const first = runFlow(
      { chapterScope: "chapter:99", part: "WEB", q: "x" },
      "challenger",
    )
    const second = runFlow({ ...first.next }, "challenger")

    expect(second.next).toEqual(first.next)
  })
})
