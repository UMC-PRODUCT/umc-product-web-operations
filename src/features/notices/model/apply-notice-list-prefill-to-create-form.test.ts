import { describe, expect, it } from "vitest"

import {
  applyNoticeListPrefillToCreateForm,
  sanitizeNoticeListCreatePrefill,
} from "./apply-notice-list-prefill-to-create-form"
import { encodeChapterScope, encodeSchoolScope } from "./notice-scope-filter"

const emptyFilters = {
  chapterScope: null,
  schoolScope: null,
  part: null,
  scopeStage: null,
  scope: null,
  staffRecipient: null,
}

describe("applyNoticeListPrefillToCreateForm", () => {
  it("prefills staff central tab without school org from list filters", () => {
    expect(
      applyNoticeListPrefillToCreateForm(
        sanitizeNoticeListCreatePrefill({
          audience: "staff",
          filters: {
            ...emptyFilters,
            scopeStage: "school",
            scope: encodeSchoolScope(7),
            staffRecipient: "SCHOOL_CORE",
          },
        }),
        9,
      ),
    ).toMatchObject({
      staffEnabled: true,
      challengerEnabled: false,
      gisuMode: "specific",
      targetGisuId: 9,
      orgMode: "umc",
      schoolId: null,
      staffScope: "SCHOOL_CORE",
    })
  })

  it("prefills staff campus tab with school from list filters", () => {
    expect(
      applyNoticeListPrefillToCreateForm(
        sanitizeNoticeListCreatePrefill({
          audience: "staff",
          filters: {
            ...emptyFilters,
            scopeStage: "school",
            scope: encodeSchoolScope(7),
            staffRecipient: "SCHOOL_PART_LEADER",
          },
        }),
        9,
      ),
    ).toMatchObject({
      staffEnabled: true,
      orgMode: "school",
      schoolId: 7,
      staffScope: "SCHOOL_PART_LEADER",
    })
  })

  it("prefills challenger chapter and part from independent filters", () => {
    expect(
      applyNoticeListPrefillToCreateForm(
        {
          audience: "challenger",
          filters: {
            ...emptyFilters,
            chapterScope: encodeChapterScope(2),
            part: "WEB",
          },
        },
        9,
      ),
    ).toMatchObject({
      challengerEnabled: true,
      orgMode: "chapter",
      chapterId: 2,
      parts: ["WEB"],
    })
  })
})
