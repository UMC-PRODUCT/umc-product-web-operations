import { describe, expect, it } from "vitest"

import { resolveWithdrawalExportFieldAccess } from "./withdrawal-export"

describe("resolveWithdrawalExportFieldAccess", () => {
  it("중앙단·슈퍼·지부는 기간·학교 모두 선택 가능", () => {
    for (const scope of ["SUPER_ADMIN", "CENTRAL", "CHAPTER"] as const) {
      expect(
        resolveWithdrawalExportFieldAccess({
          scope,
          roleTypes: [],
          schoolId: 1,
          schoolName: "홍익대학교",
        }),
      ).toEqual({
        periodSelectable: true,
        schoolSelectable: true,
        lockedSchool: null,
      })
    }
  })

  it("회장단은 기간만 선택 가능하고 학교를 고정한다", () => {
    expect(
      resolveWithdrawalExportFieldAccess({
        scope: "SCHOOL",
        roleTypes: ["SCHOOL_PRESIDENT"],
        schoolId: 12,
        schoolName: "홍익대학교",
      }),
    ).toEqual({
      periodSelectable: true,
      schoolSelectable: false,
      lockedSchool: { schoolId: "12", schoolName: "홍익대학교" },
    })
  })

  it("일반(교내 운영진·파트장)은 기간·학교 모두 선택 불가", () => {
    expect(
      resolveWithdrawalExportFieldAccess({
        scope: "SCHOOL",
        roleTypes: ["SCHOOL_ETC_ADMIN"],
        schoolId: 12,
        schoolName: "홍익대학교",
      }),
    ).toEqual({
      periodSelectable: false,
      schoolSelectable: false,
      lockedSchool: null,
    })

    expect(
      resolveWithdrawalExportFieldAccess({
        scope: "SCHOOL_PART",
        roleTypes: ["SCHOOL_PART_LEADER"],
        schoolId: 12,
        schoolName: "홍익대학교",
      }),
    ).toEqual({
      periodSelectable: false,
      schoolSelectable: false,
      lockedSchool: null,
    })
  })
})
