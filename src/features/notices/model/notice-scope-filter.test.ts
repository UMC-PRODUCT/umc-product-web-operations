import { describe, expect, it } from "vitest"

import {
  encodeChapterScope,
  encodeSchoolScope,
  parseNoticeScopeFilter,
} from "./notice-scope-filter"

describe("parseNoticeScopeFilter", () => {
  it("parses chapter and school scopes exclusively", () => {
    expect(parseNoticeScopeFilter(encodeChapterScope(7))).toEqual({
      chapterId: 7,
      schoolId: null,
    })
    expect(parseNoticeScopeFilter(encodeSchoolScope(4))).toEqual({
      chapterId: null,
      schoolId: 4,
    })
    expect(parseNoticeScopeFilter(null)).toEqual({
      chapterId: null,
      schoolId: null,
    })
  })
})
